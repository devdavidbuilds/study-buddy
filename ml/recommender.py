"""Content-based course recommender for Study Buddy.

How it works
------------
1. Every course is turned into one text document built from its title,
   category, description, skills, outcomes and module titles.
2. ``TfidfVectorizer`` turns each document into a sparse vector. A term's
   weight is high when it appears in this course (term frequency) but in few
   other courses (inverse document frequency), so words like "guitar" or
   "django" count for much more than words every course shares.
3. A query (a search phrase, a student's interests, or another course) is
   turned into a vector with the *same* fitted vocabulary.
4. ``cosine_similarity`` measures the angle between the query vector and
   every course vector (1.0 = same direction, 0.0 = no shared terms). The
   courses with the highest scores are returned, best first.

This is a classic information-retrieval model, not a neural network: there
are no learned weights, no embeddings and no GPU work. Fitting is a single
pass over the text and each query is one sparse (1 x N) multiplication, so it
runs in milliseconds on a laptop CPU.

Run ``python recommender.py "Python programming"`` for a quick demo after
building the model with ``train_model.py``.
"""

from __future__ import annotations

import argparse
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

import numpy as np
import sklearn
from sklearn.feature_extraction.text import ENGLISH_STOP_WORDS, TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

DEFAULT_TOP_K = 5
MAX_TOP_K = 50
MAX_QUERY_LENGTH = 2000

DEFAULT_MODEL_PATH = Path(__file__).resolve().parent / "artifacts" / "course_recommender.joblib"
MODEL_FORMAT_VERSION = 2

# The title is the most descriptive field, so it is repeated to weigh more.
TITLE_WEIGHT = 2

# Terms in more than this share of courses carry almost no information
# (template text such as "Career growth" appears in every imported course).
# Only applied to catalogs big enough for document frequency to be meaningful.
MAX_DOCUMENT_FREQUENCY = 0.5
MIN_DOCS_FOR_MAX_DF = 20

# Words that describe a course's format or marketing rather than its
# subject. Without this, "Django For Beginners" looked most similar to
# "CSS For Beginners" and "PHP For Beginners".
COURSE_STOP_WORDS = frozenset({
    "beginner", "beginners", "basics", "complete", "course", "courses", "guide",
    "introduction", "intro", "masterclass", "scratch", "step", "tutorial", "ultimate",
    "subject",  # label inside imported descriptions ("... Subject: Web Development.")
})
STOP_WORDS = ENGLISH_STOP_WORDS | COURSE_STOP_WORDS

# Fields are joined with this separator; two-word phrases never span it, so
# the end of a title and the start of the category do not form a phrase.
FIELD_SEPARATOR = "\n"

# Keep programming names that the default tokenizer would otherwise break
# ("c++" -> "c", "node.js" -> "node", "js").
_TECH_TERMS = [
    (re.compile(r"c\+\+"), " cplusplus "),
    (re.compile(r"c#"), " csharp "),
    (re.compile(r"\.net\b"), " dotnet "),
    (re.compile(r"\b(\w+)\.js\b"), r" \1js "),
]
_URL = re.compile(r"(course url:\s*)?https?://\S+")


class CatalogError(ValueError):
    """Raised when course data cannot be used to build the model."""


def normalize_text(text) -> str:
    """Lower-case text, drop URLs and keep tech names such as C++ intact."""
    if not isinstance(text, str):
        return ""
    value = _URL.sub(" ", text.lower())
    for pattern, replacement in _TECH_TERMS:
        value = pattern.sub(replacement, value)
    return " ".join(value.split())


def _strings(value) -> list[str]:
    """Return the non-empty strings in a value that may be a string, list or None."""
    if isinstance(value, str):
        return [value] if value.strip() else []
    if isinstance(value, (list, tuple)):
        return [item for item in value if isinstance(item, str) and item.strip()]
    return []


def course_title(course: dict) -> str:
    return str(course.get("courseName") or course.get("title") or "").strip()


def course_id(course: dict) -> str:
    return str(course.get("_id") or course.get("id") or "").strip()


def build_course_text(course: dict) -> str:
    """Combine the meaningful text fields of one course into one document.

    Field names follow Backend/models/Course.js. Missing or malformed fields
    are skipped, so a course with only a title still gets a document.
    """
    if not isinstance(course, dict):
        return ""

    parts = [course_title(course)] * TITLE_WEIGHT
    parts += _strings(course.get("category"))
    parts += _strings(course.get("description"))
    parts += _strings(course.get("skills"))
    parts += _strings(course.get("outcomes"))

    for module in course.get("modules") or []:
        if isinstance(module, dict):
            parts += _strings(module.get("title"))
            parts += _strings(module.get("summary"))

    meta = course.get("contentMeta")
    if isinstance(meta, dict):
        parts += _strings(meta.get("summary"))

    fields = (normalize_text(part) for part in parts)
    return FIELD_SEPARATOR.join(field for field in fields if field)


_WORD_PATTERN = re.compile(r"(?u)\b\w\w+\b")  # scikit-learn's default token pattern


def analyze(document: str) -> list[str]:
    """Split a document into words and two-word phrases, field by field.

    Same tokens and English stop words as scikit-learn's default analyzer,
    plus COURSE_STOP_WORDS; phrases are only formed inside one field.
    """
    terms = []
    for field in document.split(FIELD_SEPARATOR):
        words = [word for word in _WORD_PATTERN.findall(field) if word not in STOP_WORDS]
        terms += words
        terms += [f"{first} {second}" for first, second in zip(words, words[1:])]
    return terms


def _clamp_k(k) -> int:
    try:
        return min(MAX_TOP_K, max(1, int(k)))
    except (TypeError, ValueError):
        return DEFAULT_TOP_K


class CourseRecommender:
    """A fitted TF-IDF index over the course catalog.

    The index stores one L2-normalised sparse vector per course. Queries are
    scored against it on demand (one row of similarities per query), so the
    full N x N course-to-course similarity matrix is never built.
    """

    def __init__(self, max_df=MAX_DOCUMENT_FREQUENCY):
        self.max_df = max_df
        self.vectorizer: TfidfVectorizer | None = None
        self.matrix = None
        self.ids: list[str] = []
        self.titles: list[str] = []
        self.categories: list[str] = []
        self._title_keys: list[str] = []
        self._index_by_id: dict[str, int] = {}
        self._feature_names_cache = None
        self.stats: dict = {}
        self.trained_at: str | None = None
        self.source: str | None = None

    # ------------------------------------------------------------------
    # Building the index
    # ------------------------------------------------------------------
    def fit(self, courses, source: str | None = None) -> "CourseRecommender":
        """Build the index from a list of course dicts (as stored in MongoDB)."""
        if courses is None:
            courses = []
        if not isinstance(courses, (list, tuple)):
            raise CatalogError("courses must be a list of course objects")

        ids, titles, categories, texts = [], [], [], []
        seen = set()
        skipped = {"invalid": 0, "missing_id": 0, "duplicate_id": 0}

        for course in courses:
            if not isinstance(course, dict):
                skipped["invalid"] += 1
                continue
            cid = course_id(course)
            if not cid:
                skipped["missing_id"] += 1
                continue
            if cid in seen:
                skipped["duplicate_id"] += 1
                continue
            seen.add(cid)
            ids.append(cid)
            titles.append(course_title(course) or "Untitled course")
            categories.append(str(course.get("category") or ""))
            texts.append(build_course_text(course))

        self.ids, self.titles, self.categories = ids, titles, categories
        self._title_keys = [" ".join(title.lower().split()) for title in titles]
        self._index_by_id = {cid: index for index, cid in enumerate(ids)}
        self.trained_at = datetime.now(timezone.utc).isoformat(timespec="seconds")
        self.source = source

        non_empty = sum(1 for text in texts if text)
        self.vectorizer, self.matrix, self._feature_names_cache = None, None, None

        if non_empty:
            self.vectorizer = TfidfVectorizer(
                analyzer=analyze,  # words + two-word phrases, stop words removed
                sublinear_tf=True,  # 1 + log(tf): repeated words count less
                max_df=self.max_df if non_empty >= MIN_DOCS_FOR_MAX_DF else 1.0,
                dtype=np.float32,
            )
            try:
                self.matrix = self.vectorizer.fit_transform(texts).tocsr()
            except ValueError:
                # Only stop words / no usable terms in the whole catalog.
                self.vectorizer, self.matrix = None, None

        self.stats = {
            "courses": len(ids),
            "courses_without_text": len(ids) - non_empty,
            "duplicate_titles": len(self._title_keys) - len(set(self._title_keys)),
            "skipped": skipped,
            "features": len(self.vectorizer.vocabulary_) if self.vectorizer else 0,
            "nonzero_weights": int(self.matrix.nnz) if self.matrix is not None else 0,
        }
        return self

    @property
    def is_ready(self) -> bool:
        return self.vectorizer is not None and self.matrix is not None and len(self.ids) > 0

    def info(self) -> dict:
        return {
            "name": "tfidf-cosine",
            "courses": len(self.ids),
            "features": self.stats.get("features", 0),
            "trained_at": self.trained_at,
        }

    # ------------------------------------------------------------------
    # Recommending
    # ------------------------------------------------------------------
    def recommend(self, query, k=DEFAULT_TOP_K, exclude_ids=None) -> list[dict]:
        """Rank courses for a free-text query (search phrase or interests).

        Returns [] for empty/invalid queries, an empty catalog, or a query
        that shares no terms with any course — never random filler.
        """
        if not self.is_ready or not isinstance(query, str):
            return []
        text = normalize_text(query[:MAX_QUERY_LENGTH])
        if not text:
            return []
        query_vector = self.vectorizer.transform([text])
        return self._rank(query_vector, k, self._indices(exclude_ids))

    def similar_to(self, course_id_value, k=DEFAULT_TOP_K, text=None, exclude_ids=None) -> list[dict]:
        """Courses most similar to a selected course; the course itself is excluded.

        Uses the stored vector when the course is in the index; ``text`` is a
        fallback for courses added after the model was trained.
        """
        if not self.is_ready:
            return []
        cid = str(course_id_value or "").strip()
        excluded = self._indices(exclude_ids)
        index = self._index_by_id.get(cid)

        if index is not None:
            excluded.add(index)
            # Copies of the same course (same title) are not "similar courses".
            return self._rank(self.matrix[index], k, excluded, skip_titles={self._title_keys[index]})

        if isinstance(text, str) and normalize_text(text):
            results = self._rank(self.vectorizer.transform([normalize_text(text)]), _clamp_k(k) + 1, excluded)
            return [item for item in results if item["id"] != cid][: _clamp_k(k)]
        return []

    def query_terms(self, query) -> dict:
        """Which words of a query the model knows (are in its vocabulary)."""
        if not self.is_ready or not isinstance(query, str):
            return {"known": [], "unknown": []}
        analyzer = self.vectorizer.build_analyzer()
        vocabulary = self.vectorizer.vocabulary_
        known, unknown = [], []
        for term in analyzer(normalize_text(query[:MAX_QUERY_LENGTH])):
            if term in vocabulary:
                if term not in known:
                    known.append(term)
            elif " " not in term and term not in unknown:  # report single words only
                unknown.append(term)
        return {"known": known, "unknown": unknown}

    def _indices(self, ids) -> set[int]:
        if not ids:
            return set()
        if isinstance(ids, str):
            ids = [ids]
        return {self._index_by_id[str(i)] for i in ids if str(i) in self._index_by_id}

    def _rank(self, query_vector, k, excluded: set[int], skip_titles=None) -> list[dict]:
        k = _clamp_k(k)
        if query_vector.nnz == 0:
            return []

        # One row of scores: (1 x features) . (features x courses).
        scores = cosine_similarity(query_vector, self.matrix).ravel()
        if excluded:
            scores[list(excluded)] = 0.0

        candidates = np.flatnonzero(scores > 0)
        # Highest score first; ties keep catalog order so results are repeatable.
        order = candidates[np.lexsort((candidates, -scores[candidates]))]

        feature_names = self._feature_names()
        seen_titles = set(skip_titles or ())
        results = []
        for index in order:
            title_key = self._title_keys[index]
            if title_key in seen_titles:
                continue  # duplicate course listing
            seen_titles.add(title_key)
            results.append({
                "id": self.ids[index],
                "title": self.titles[index],
                "category": self.categories[index],
                "score": round(float(scores[index]), 4),
                "matched_terms": self._matched_terms(query_vector, index, feature_names),
            })
            if len(results) == k:
                break
        return results

    def _feature_names(self):
        if getattr(self, "_feature_names_cache", None) is None:
            self._feature_names_cache = self.vectorizer.get_feature_names_out()
        return self._feature_names_cache

    def _matched_terms(self, query_vector, index, feature_names, limit=5) -> list[str]:
        """The shared terms that contributed most to this course's score."""
        contribution = query_vector.multiply(self.matrix[index]).tocoo()
        if contribution.nnz == 0:
            return []
        top = np.argsort(-contribution.data)[:limit]
        return [str(feature_names[contribution.col[i]]) for i in top]

    # ------------------------------------------------------------------
    # Persistence
    # ------------------------------------------------------------------
    def save(self, path=DEFAULT_MODEL_PATH) -> Path:
        import joblib

        path = Path(path)
        path.parent.mkdir(parents=True, exist_ok=True)
        joblib.dump(
            {
                "format_version": MODEL_FORMAT_VERSION,
                "sklearn_version": sklearn.__version__,
                "model": self,
            },
            path,
            compress=3,
        )
        return path

    @classmethod
    def load(cls, path=DEFAULT_MODEL_PATH) -> "CourseRecommender":
        """Load a model saved by ``save``. Only load files you created yourself:
        joblib files are pickles and can run code when loaded."""
        import joblib

        path = Path(path)
        if not path.exists():
            raise FileNotFoundError(f"No trained model at {path}. Run train_model.py first.")
        payload = joblib.load(path)
        if not isinstance(payload, dict) or payload.get("format_version") != MODEL_FORMAT_VERSION:
            raise CatalogError(f"{path} is not a model file from this version of recommender.py; retrain it.")
        if payload.get("sklearn_version") != sklearn.__version__:
            print(
                f"Warning: model was trained with scikit-learn {payload.get('sklearn_version')}, "
                f"running {sklearn.__version__}. Retrain if results look wrong.",
                file=sys.stderr,
            )
        return payload["model"]


def format_results(results: list[dict]) -> str:
    """Readable table of recommendations for the terminal."""
    if not results:
        return "  (no matching courses)"
    lines = [f"  {'#':>2}  {'Score':>6}  {'Category':<20} Title", f"  {'-' * 2}  {'-' * 6}  {'-' * 20} {'-' * 40}"]
    for rank, item in enumerate(results, start=1):
        title = item["title"] if len(item["title"]) <= 70 else item["title"][:67] + "..."
        lines.append(f"  {rank:>2}  {item['score']:>6.3f}  {item['category'][:20]:<20} {title}")
        if item.get("matched_terms"):
            lines.append(f"  {'':>2}  {'':>6}  {'':<20}   matched: {', '.join(item['matched_terms'])}")
    return "\n".join(lines)


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(description="Recommend Study Buddy courses for a query.")
    parser.add_argument("query", nargs="+", help='search text, e.g. "Python programming"')
    parser.add_argument("-k", "--top", type=int, default=DEFAULT_TOP_K, help="number of courses (default 5)")
    parser.add_argument("--model", default=str(DEFAULT_MODEL_PATH), help="path to the trained model file")
    args = parser.parse_args(argv)

    try:
        model = CourseRecommender.load(args.model)
    except (FileNotFoundError, CatalogError) as error:
        print(error, file=sys.stderr)
        return 1

    query = " ".join(args.query)
    terms = model.query_terms(query)
    print(f'\nQuery: "{query}"   (model: {model.stats["courses"]} courses, {model.stats["features"]} TF-IDF features)')
    if terms["unknown"]:
        print(f"Words not in the catalog vocabulary (ignored): {', '.join(terms['unknown'])}")
    print(format_results(model.recommend(query, k=args.top)))
    print()
    return 0


if __name__ == "__main__":
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.exit(main())
