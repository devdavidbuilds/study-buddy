"""Software tests for the performance model.

    python ml\\performance\\test_model.py

These check that the code behaves correctly (validation, missing values,
score range, no data leakage, real/synthetic separation). They use tiny
datasets (~150 rows, 10 trees) and are NOT evidence of predictive accuracy —
see train_model.py for evaluation.
"""

from __future__ import annotations

import json
import math
import sys
import tempfile
import unittest
from pathlib import Path

import numpy as np

import synthetic_data
import train_model
from performance_model import PerformanceModel, build_training_rows, validate_features

VALID = {"prev_quiz_avg": 70, "prev_attempts": 3, "completion_pct": 50, "last_quiz_score": 80}


def small_model(n=150):
    rows, targets, _ = synthetic_data.generate(n_rows=n, seed=1)
    return PerformanceModel(n_estimators=10).fit(rows, targets, source="synthetic")


class ValidationTests(unittest.TestCase):
    def test_valid_row(self):
        self.assertEqual(validate_features(VALID), [70.0, 3.0, 50.0, 80.0])

    def test_missing_values_become_nan(self):
        vector = validate_features({"prev_attempts": 0, "prev_quiz_avg": None, "completion_pct": "", "last_quiz_score": float("nan")})
        self.assertEqual(vector[1], 0.0)
        self.assertTrue(all(math.isnan(v) for v in (vector[0], vector[2], vector[3])))
        self.assertTrue(all(math.isnan(v) for v in validate_features({})))

    def test_invalid_values_rejected(self):
        bad = [
            {"prev_quiz_avg": 101}, {"prev_quiz_avg": -1}, {"completion_pct": 150},
            {"prev_attempts": -2}, {"prev_attempts": 2.5}, {"prev_attempts": 10**6},
            {"prev_quiz_avg": "abc"}, {"prev_quiz_avg": True}, {"prev_quiz_avg": float("inf")},
            {"unknown_feature": 1}, {"prev_attempts": 0, "prev_quiz_avg": 50},
        ]
        for row in bad:
            with self.subTest(row=row), self.assertRaises(ValueError):
                validate_features(row)
        with self.assertRaises(ValueError):
            validate_features(["not", "a", "dict"])

    def test_boundaries_accepted(self):
        for value in (0, 100):
            self.assertEqual(validate_features({"prev_quiz_avg": value, "prev_attempts": 1, "completion_pct": value})[0], value)


class ModelTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.model = small_model()

    def test_prediction_is_numeric_and_in_range(self):
        for row in (VALID, {"prev_attempts": 0}, {},
                    {"prev_quiz_avg": 0, "prev_attempts": 20, "completion_pct": 0, "last_quiz_score": 0},
                    {"prev_quiz_avg": 100, "prev_attempts": 20, "completion_pct": 100, "last_quiz_score": 100}):
            with self.subTest(row=row):
                score = self.model.predict_one(row)
                self.assertIsInstance(score, float)
                self.assertTrue(0 <= score <= 100)

    def test_higher_history_predicts_higher_score(self):
        low = self.model.predict_one({"prev_quiz_avg": 30, "prev_attempts": 5, "completion_pct": 20, "last_quiz_score": 30})
        high = self.model.predict_one({"prev_quiz_avg": 90, "prev_attempts": 5, "completion_pct": 90, "last_quiz_score": 90})
        self.assertGreater(high, low)

    def test_prediction_does_not_retrain(self):
        before = self.model.pipeline.named_steps["forest"].estimators_[0]
        self.model.predict_one(VALID)
        self.assertIs(self.model.pipeline.named_steps["forest"].estimators_[0], before)

    def test_invalid_training_data_rejected(self):
        with self.assertRaises(ValueError):
            PerformanceModel().fit([VALID], [120], source="synthetic")
        with self.assertRaises(ValueError):
            PerformanceModel().fit([], [], source="synthetic")
        with self.assertRaises(ValueError):
            PerformanceModel().fit([VALID], [50], source="mixed")
        with self.assertRaises(RuntimeError):
            PerformanceModel().predict_one(VALID)

    def test_tiny_dataset_and_all_missing_column(self):
        rows = [{"prev_attempts": i, "completion_pct": None} for i in range(6)]
        model = PerformanceModel(n_estimators=5).fit(rows, [40, 50, 60, 70, 80, 90], source="synthetic")
        self.assertTrue(0 <= model.predict_one({"prev_attempts": 3}) <= 100)

    def test_save_and_load_round_trip(self):
        with tempfile.TemporaryDirectory() as folder:
            path = self.model.save(Path(folder) / "m.joblib")
            loaded = PerformanceModel.load(path)
        self.assertEqual(loaded.predict_one(VALID), self.model.predict_one(VALID))
        self.assertEqual(loaded.metadata["source"], "synthetic")


class LeakageTests(unittest.TestCase):
    RECORD = {
        "student": "s1", "total_lessons": 4,
        "completed_at": ["2026-01-01T09:00:00Z", "2026-01-02T10:00:00Z", "2026-01-03T10:00:00Z"],
        "assessments": [
            {"at": "2026-01-03T10:00:00Z", "score": 90},   # out of order on purpose
            {"at": "2026-01-01T10:00:00Z", "score": 50},
            {"at": "2026-01-02T10:00:00Z", "score": 70},
            {"at": "bad-date", "score": 60},
            {"at": "2026-01-04T10:00:00Z", "score": 140},  # invalid score
        ],
    }

    def test_features_use_only_earlier_events(self):
        rows, targets, groups, skipped = build_training_rows([self.RECORD])
        self.assertEqual(targets, [50, 70, 90])
        self.assertEqual(skipped["bad_assessment"], 2)
        first, second, third = rows
        self.assertEqual((first["prev_attempts"], first["prev_quiz_avg"], first["last_quiz_score"]), (0, None, None))
        self.assertEqual(first["completion_pct"], 25.0)   # 1 of 4 lessons done before it
        self.assertEqual((second["prev_quiz_avg"], second["last_quiz_score"]), (50, 50))
        # The lesson completed at the same moment as the 2nd quiz is NOT counted.
        self.assertEqual(second["completion_pct"], 25.0)
        self.assertEqual((third["prev_attempts"], third["prev_quiz_avg"], third["last_quiz_score"]), (2, 60, 70))
        self.assertEqual(third["completion_pct"], 50.0)   # its own-moment completion excluded
        self.assertEqual(groups, ["s1"] * 3)

    def test_bad_records_are_skipped(self):
        rows, _, _, skipped = build_training_rows([None, "x", {"assessments": None}])
        self.assertEqual(rows, [])
        self.assertEqual(skipped["bad_record"], 2)


class TrainingPipelineTests(unittest.TestCase):
    def test_too_little_real_data_is_refused(self):
        rows, targets, _, _ = build_training_rows([LeakageTests.RECORD])
        with self.assertRaises(train_model.InsufficientDataError):
            train_model.train(rows, targets, ["s1"] * len(rows), "real", {}, save=False, verbose=False)

    def test_synthetic_training_reports_metrics(self):
        rows, targets, groups = synthetic_data.generate(n_rows=150, seed=3)
        model = train_model.train(rows, targets, groups, "synthetic", {}, save=False, n_estimators=10, verbose=False)
        metrics = model.metadata["metrics"]
        self.assertEqual(model.metadata["source"], "synthetic")
        self.assertEqual(model.metadata["split"], "by student")
        self.assertTrue(np.isfinite(metrics["mae"]) and metrics["n_test"] > 0)
        self.assertAlmostEqual(sum(model.metadata["feature_importances"].values()), 1.0, places=2)

    def test_real_loader_rejects_non_real_files(self):
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / "h.json"
            path.write_text(json.dumps({"source": "synthetic", "records": []}), encoding="utf-8")
            with self.assertRaises(ValueError):
                train_model.load_real(path)
            with self.assertRaises(FileNotFoundError):
                train_model.load_real(Path(folder) / "missing.json")

    def test_synthetic_csv_is_labelled(self):
        rows, targets, groups = synthetic_data.generate(n_rows=5)
        with tempfile.TemporaryDirectory() as folder:
            path = synthetic_data.write_csv(rows, targets, groups, Path(folder) / "s.csv")
            lines = path.read_text(encoding="utf-8").splitlines()
        self.assertTrue(all(line.endswith(",synthetic") for line in lines[1:]))


if __name__ == "__main__":
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    unittest.main(verbosity=2)
