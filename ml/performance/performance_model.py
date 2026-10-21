"""Student performance prediction: expected score on a student's next quiz.

Prediction point
----------------
"Just before the student takes their next assessment in a course." Every
feature is computed only from what had happened *before* that moment:

    prev_quiz_avg    mean % of the student's earlier assessments in the course
                     (missing when there are none)
    prev_attempts    how many earlier assessments the student took
    completion_pct   % of the course's lessons completed before that moment
    last_quiz_score  % on the most recent earlier assessment (missing if none)

Target: the % score (0-100) actually obtained on that next assessment.

Model: scikit-learn Pipeline = SimpleImputer(median, + missing-value flags)
-> RandomForestRegressor. A random forest averages many decision trees, each
trained on a bootstrap sample of the rows, so its output is an average of
real training scores and always lies in 0-100. It is a classic ML model
(no neural network) and trains in well under a second on CPU for thousands
of rows.
"""

from __future__ import annotations

import math
from datetime import datetime, timezone
from pathlib import Path

import numpy as np
import sklearn
from sklearn.ensemble import RandomForestRegressor
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline

FEATURES = ("prev_quiz_avg", "prev_attempts", "completion_pct", "last_quiz_score")
SCORE_MIN, SCORE_MAX = 0.0, 100.0
MAX_ATTEMPTS = 1000

# Each feature: (minimum, maximum, must be a whole number).
FEATURE_RANGES = {
    "prev_quiz_avg": (SCORE_MIN, SCORE_MAX, False),
    "prev_attempts": (0, MAX_ATTEMPTS, True),
    "completion_pct": (0.0, 100.0, False),
    "last_quiz_score": (SCORE_MIN, SCORE_MAX, False),
}

ARTIFACT_DIR = Path(__file__).resolve().parent / "artifacts"
MODEL_FORMAT_VERSION = 1


def artifact_path(source: str) -> Path:
    """Real and synthetic models are always saved to different files."""
    if source not in ("real", "synthetic"):
        raise ValueError("source must be 'real' or 'synthetic'")
    return ARTIFACT_DIR / f"performance_{source}.joblib"


def _is_missing(value) -> bool:
    return value is None or (isinstance(value, str) and not value.strip()) or (
        isinstance(value, float) and math.isnan(value)
    )


def validate_features(row: dict) -> list[float]:
    """Check one input row and return it as a feature vector.

    Missing values (None, "", NaN) become NaN and are imputed by the model.
    Anything else that is not a number in range raises ValueError.
    """
    if not isinstance(row, dict):
        raise ValueError("features must be a dict")
    unknown = set(row) - set(FEATURES)
    if unknown:
        raise ValueError(f"unknown feature(s): {', '.join(sorted(unknown))}")

    vector = []
    for name in FEATURES:
        value = row.get(name)
        if _is_missing(value):
            vector.append(math.nan)
            continue
        if isinstance(value, bool):
            raise ValueError(f"{name} must be a number")
        try:
            number = float(value)
        except (TypeError, ValueError):
            raise ValueError(f"{name} must be a number, got {value!r}") from None
        low, high, whole = FEATURE_RANGES[name]
        if not math.isfinite(number) or not low <= number <= high:
            raise ValueError(f"{name} must be between {low:g} and {high:g}, got {value!r}")
        if whole and not number.is_integer():
            raise ValueError(f"{name} must be a whole number, got {value!r}")
        vector.append(number)

    attempts = vector[FEATURES.index("prev_attempts")]
    has_history = not (math.isnan(vector[0]) and math.isnan(vector[3]))
    if attempts == 0 and has_history:
        raise ValueError("prev_quiz_avg / last_quiz_score must be empty when prev_attempts is 0")
    return vector


def validate_score(value) -> float:
    try:
        score = float(value)
    except (TypeError, ValueError):
        raise ValueError(f"score must be a number, got {value!r}") from None
    if isinstance(value, bool) or not math.isfinite(score) or not SCORE_MIN <= score <= SCORE_MAX:
        raise ValueError(f"score must be between {SCORE_MIN:g} and {SCORE_MAX:g}, got {value!r}")
    return score


def _parse_time(value):
    if not isinstance(value, str) or not value:
        return None
    try:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        return None
    return parsed if parsed.tzinfo else parsed.replace(tzinfo=timezone.utc)


def build_training_rows(records: list[dict]) -> tuple[list[dict], list[float], list[str], dict]:
    """Turn exported assessment histories into leakage-free training rows.

    Each record is one student in one course (see export_training_data.js):
        {"student": "s1", "total_lessons": 12,
         "completed_at": ["2026-10-01T10:00:00Z", ...],
         "assessments": [{"at": "...", "score": 80.0}, ...]}

    One row per assessment. Its features use only assessments and lesson
    completions strictly *before* that assessment's timestamp, so the target
    score and anything after it never leak into the inputs.
    Returns (rows, targets, student groups, counts of skipped items).
    """
    rows, targets, groups = [], [], []
    skipped = {"bad_record": 0, "bad_assessment": 0}

    for record in records or []:
        if not isinstance(record, dict):
            skipped["bad_record"] += 1
            continue
        events = []
        for item in record.get("assessments") or []:
            at = _parse_time(item.get("at")) if isinstance(item, dict) else None
            try:
                score = validate_score(item.get("score")) if at else None
            except ValueError:
                score = None
            if at is None or score is None:
                skipped["bad_assessment"] += 1
                continue
            events.append((at, score))
        events.sort(key=lambda event: event[0])

        completions = sorted(t for t in (_parse_time(v) for v in record.get("completed_at") or []) if t)
        total_lessons = record.get("total_lessons")
        total_lessons = total_lessons if isinstance(total_lessons, int) and total_lessons > 0 else None

        for at, score in events:
            earlier = [s for t, s in events if t < at]
            done = sum(1 for t in completions if t < at)
            rows.append({
                "prev_quiz_avg": round(sum(earlier) / len(earlier), 2) if earlier else None,
                "prev_attempts": len(earlier),
                "completion_pct": round(min(100.0, 100.0 * done / total_lessons), 2) if total_lessons else None,
                "last_quiz_score": earlier[-1] if earlier else None,
            })
            targets.append(score)
            groups.append(str(record.get("student") or "unknown"))
    return rows, targets, groups, skipped


class PerformanceModel:
    """Random-forest regressor for the next assessment score (0-100)."""

    def __init__(self, n_estimators=100, max_depth=8, min_samples_leaf=3, random_state=42):
        self.pipeline = Pipeline([
            # Median of the training data; add_indicator adds "was missing"
            # flags so "no earlier quizzes" is itself information.
            ("impute", SimpleImputer(strategy="median", add_indicator=True, keep_empty_features=True)),
            ("forest", RandomForestRegressor(
                n_estimators=n_estimators,
                max_depth=max_depth,
                min_samples_leaf=min_samples_leaf,
                random_state=random_state,
                n_jobs=1,  # one core: modest memory, no worker processes
            )),
        ])
        self.metadata: dict = {}
        self.is_fitted = False

    def fit(self, rows: list[dict], targets: list, source: str, **metadata) -> "PerformanceModel":
        if source not in ("real", "synthetic"):
            raise ValueError("source must be 'real' or 'synthetic'")
        if not rows or len(rows) != len(targets):
            raise ValueError("need the same, non-zero number of rows and targets")
        X = np.array([validate_features(row) for row in rows], dtype=float)
        y = np.array([validate_score(score) for score in targets], dtype=float)
        self.pipeline.fit(X, y)
        self.is_fitted = True
        self.metadata = {
            "source": source,
            "n_train": len(y),
            "trained_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
            **metadata,
        }
        return self

    def predict(self, rows: list[dict]) -> np.ndarray:
        if not self.is_fitted:
            raise RuntimeError("model is not trained")
        X = np.array([validate_features(row) for row in rows], dtype=float)
        return np.clip(self.pipeline.predict(X), SCORE_MIN, SCORE_MAX)

    def predict_one(self, features: dict) -> float:
        return round(float(self.predict([features])[0]), 1)

    def feature_importances(self) -> dict:
        """Share of the forest's splits' error reduction per input (sums to 1).
        Imputer "missing" flags are folded into their feature."""
        forest = self.pipeline.named_steps["forest"]
        imputer = self.pipeline.named_steps["impute"]
        names = list(FEATURES)
        if imputer.indicator_ is not None:
            names += [FEATURES[i] for i in imputer.indicator_.features_]
        totals = dict.fromkeys(FEATURES, 0.0)
        for name, value in zip(names, forest.feature_importances_):
            totals[name] += float(value)
        return {name: round(value, 3) for name, value in totals.items()}

    def save(self, path=None) -> Path:
        import joblib

        path = Path(path or artifact_path(self.metadata["source"]))
        path.parent.mkdir(parents=True, exist_ok=True)
        joblib.dump({"format_version": MODEL_FORMAT_VERSION, "sklearn_version": sklearn.__version__, "model": self},
                    path, compress=3)
        return path

    @classmethod
    def load(cls, path) -> "PerformanceModel":
        """Load a model saved by save(). joblib files are pickles: only load
        files you created yourself."""
        import joblib

        payload = joblib.load(path)
        if not isinstance(payload, dict) or payload.get("format_version") != MODEL_FORMAT_VERSION:
            raise ValueError(f"{path} is not a performance model from this version; retrain it.")
        return payload["model"]
