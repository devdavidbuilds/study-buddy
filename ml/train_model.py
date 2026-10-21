"""Build the Study Buddy course recommendation model from the real catalog.

Where the data comes from
-------------------------
By default the courses are downloaded from the Study Buddy backend's
read-only export endpoint::

    GET <backend>/api/recommendations/catalog

That endpoint (Backend/controllers/recommendationController.js) returns the
public text fields of every non-archived course: _id, courseName, category,
level, description, skills, outcomes and module titles. It runs a plain
MongoDB ``find`` — nothing is written, updated or deleted — and this script
never needs database credentials.

Alternatively ``--input catalog.json`` reads a file saved from that endpoint
(either the whole ``{"data": [...]}`` response or just the list).

Output
------
The fitted index is saved to ``artifacts/course_recommender.joblib``
(~1-2 MB). Saving it means the demo, the tests and the API service start
instantly and work even when the backend or database is offline. Re-run this
script whenever courses are added or edited.

Usage (Windows, from the repository root)::

    python ml\\train_model.py
    python ml\\train_model.py --source-url https://study-buddy-91gv.onrender.com/api/recommendations/catalog
    python ml\\train_model.py --input C:\\path\\to\\catalog.json
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

from recommender import DEFAULT_MODEL_PATH, CatalogError, CourseRecommender

DEFAULT_CATALOG_URL = "http://localhost:5000/api/recommendations/catalog"


def _course_list(payload) -> list:
    courses = payload.get("data") if isinstance(payload, dict) else payload
    if not isinstance(courses, list):
        raise CatalogError('Catalog must be a list of courses or {"data": [...]}')
    return courses


def load_catalog_from_url(url: str, attempts: int = 3, timeout: int = 120) -> list:
    """Download the course catalog. Retries because a sleeping Render free-tier
    backend can take ~1 minute to wake up."""
    last_error = None
    for attempt in range(1, attempts + 1):
        try:
            request = urllib.request.Request(url, headers={"Accept": "application/json"})
            with urllib.request.urlopen(request, timeout=timeout) as response:
                return _course_list(json.loads(response.read().decode("utf-8")))
        except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as error:
            last_error = error
            if attempt < attempts:
                print(f"  attempt {attempt} failed ({error}); retrying in {5 * attempt}s...", file=sys.stderr)
                time.sleep(5 * attempt)
    raise CatalogError(f"Could not download the catalog from {url}: {last_error}")


def load_catalog_from_file(path) -> list:
    with open(path, encoding="utf-8") as handle:
        return _course_list(json.load(handle))


def train(courses: list, source: str, output=DEFAULT_MODEL_PATH, verbose: bool = True) -> CourseRecommender:
    started = time.perf_counter()
    model = CourseRecommender().fit(courses, source=source)
    elapsed = time.perf_counter() - started

    if verbose:
        stats = model.stats
        matrix_bytes = 0
        if model.matrix is not None:
            matrix_bytes = model.matrix.data.nbytes + model.matrix.indices.nbytes + model.matrix.indptr.nbytes
        print(f"  courses indexed        : {stats['courses']}")
        print(f"  skipped records        : {stats['skipped']}")
        print(f"  courses without text   : {stats['courses_without_text']}")
        print(f"  duplicate titles       : {stats['duplicate_titles']} (shown once in results)")
        print(f"  TF-IDF features        : {stats['features']} (words + two-word phrases)")
        if model.matrix is not None:
            density = model.matrix.nnz / (model.matrix.shape[0] * model.matrix.shape[1])
            print(f"  matrix                 : {model.matrix.shape[0]} x {model.matrix.shape[1]}, "
                  f"{model.matrix.nnz} non-zero ({density:.3%} dense), {matrix_bytes / 1024:.0f} KB in memory")
        print(f"  fit time               : {elapsed:.2f} s (CPU)")

    if not model.is_ready:
        raise CatalogError("The catalog has no usable course text, so no model was built.")

    if output:
        path = model.save(output)
        print(f"  saved model            : {path} ({path.stat().st_size / 1024:.0f} KB)")
    return model


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(description="Train the Study Buddy course recommender (TF-IDF + cosine similarity).")
    source = parser.add_mutually_exclusive_group()
    source.add_argument("--source-url", default=os.environ.get("RECOMMENDER_CATALOG_URL", DEFAULT_CATALOG_URL),
                        help=f"backend catalog export URL (default: {DEFAULT_CATALOG_URL})")
    source.add_argument("--input", help="read courses from a JSON file instead of the backend")
    parser.add_argument("--output", default=str(DEFAULT_MODEL_PATH), help="where to save the model")
    args = parser.parse_args(argv)

    try:
        if args.input:
            print(f"Loading courses from file {args.input} ...")
            courses, label = load_catalog_from_file(args.input), f"file:{Path(args.input).name}"
        else:
            print(f"Downloading courses from {args.source_url} ...")
            courses, label = load_catalog_from_url(args.source_url), args.source_url
        print(f"  received {len(courses)} course records")
        train(courses, source=label, output=args.output)
    except (CatalogError, OSError, json.JSONDecodeError) as error:
        print(f"Training failed: {error}", file=sys.stderr)
        if not args.input:
            print("Is the backend running? Start it with: cd Backend && npm run dev", file=sys.stderr)
        return 1

    print("Done. Try: python ml\\recommender.py \"Python programming\"")
    return 0


if __name__ == "__main__":
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.exit(main())
