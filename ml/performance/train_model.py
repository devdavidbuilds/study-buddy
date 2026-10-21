"""Train the student performance model (RandomForestRegressor).

Exactly one data source per run; sources are never mixed:

    python ml\\performance\\train_model.py --real        real students in data\\real_history.json
                                                        (made by export_training_data.js)
    python ml\\performance\\train_model.py --demo        only the seeded DEMO accounts in that file
                                                        (simulated history from seedDemoData.js)
    python ml\\performance\\train_model.py --synthetic   the labelled SYNTHETIC dataset
                                                        (software demo only)

Evaluation: 20% of the rows are held out (split by student when possible, so
one student's quizzes are not in both halves; seed 42). MAE and R^2 are
reported next to two simple baselines — "predict the training average" and
"predict the student's previous average" — because a model is only useful if
it beats them. The saved model is the one fitted on the training split, so
its stored metrics describe exactly that model.

This script never writes to MongoDB. Real data below MIN_REAL_ROWS rows or
MIN_REAL_STUDENTS students is refused: metrics on a handful of rows are noise.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

import numpy as np
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.model_selection import GroupShuffleSplit, train_test_split

from performance_model import PerformanceModel, artifact_path, build_training_rows
import synthetic_data

REAL_HISTORY = Path(__file__).resolve().parent / "data" / "real_history.json"
MIN_REAL_ROWS = 50
MIN_REAL_STUDENTS = 10
TEST_SIZE = 0.2
SEED = 42


class InsufficientDataError(RuntimeError):
    pass


def load_real(path=REAL_HISTORY, demo=False):
    """Rows from the export: real students only, or (demo=True) only the
    seeded demo accounts. The two are never combined."""
    path = Path(path)
    if not path.exists():
        raise FileNotFoundError(f"{path} not found. Export it first: node ml\\performance\\export_training_data.js")
    with open(path, encoding="utf-8") as handle:
        payload = json.load(handle)
    if not isinstance(payload, dict) or payload.get("source") != "real":
        raise ValueError(f'{path} is not a real-data export (expected "source": "real")')
    records = [r for r in payload.get("records") or [] if isinstance(r, dict) and bool(r.get("demo")) == demo]
    rows, targets, groups, skipped = build_training_rows(records)
    return rows, targets, groups, {"file": path.name, "database": payload.get("database"), "skipped": skipped,
                                   "records": "demo accounts" if demo else "real students"}


def split(rows, targets, groups):
    indices = np.arange(len(rows))
    if len(set(groups)) >= 5:
        train_idx, test_idx = next(GroupShuffleSplit(n_splits=1, test_size=TEST_SIZE, random_state=SEED)
                                   .split(indices, groups=groups))
        how = "by student"
    else:
        train_idx, test_idx = train_test_split(indices, test_size=TEST_SIZE, random_state=SEED)
        how = "by row"
    pick = lambda seq, idx: [seq[i] for i in idx]  # noqa: E731
    return pick(rows, train_idx), pick(targets, train_idx), pick(rows, test_idx), pick(targets, test_idx), how


def evaluate(model, train_targets, test_rows, test_targets) -> dict:
    y = np.array(test_targets, dtype=float)
    predicted = model.predict(test_rows)
    mean_baseline = np.full_like(y, float(np.mean(train_targets)))
    prev_baseline = np.array([row["prev_quiz_avg"] if row["prev_quiz_avg"] is not None else mean_baseline[0]
                              for row in test_rows], dtype=float)
    metrics = {
        "mae": round(float(mean_absolute_error(y, predicted)), 2),
        "baseline_mae_train_average": round(float(mean_absolute_error(y, mean_baseline)), 2),
        "baseline_mae_previous_average": round(float(mean_absolute_error(y, prev_baseline)), 2),
        "n_test": len(y),
    }
    # R^2 is undefined when every test score is identical.
    metrics["r2"] = round(float(r2_score(y, predicted)), 3) if len(y) >= 2 and np.ptp(y) > 0 else None
    return metrics


def train(rows, targets, groups, source: str, data_info: dict, save=True, n_estimators=100, verbose=True):
    students = len(set(groups))
    if source in ("real", "demo") and (len(rows) < MIN_REAL_ROWS or students < MIN_REAL_STUDENTS):
        raise InsufficientDataError(
            f"Only {len(rows)} assessment rows from {students} students; need at least {MIN_REAL_ROWS} rows "
            f"from {MIN_REAL_STUDENTS} students for a meaningful model. No model was trained."
        )
    if len(rows) < 5:
        raise InsufficientDataError(f"Only {len(rows)} rows; cannot split into training and test data.")

    train_rows, train_targets, test_rows, test_targets, how = split(rows, targets, groups)
    model = PerformanceModel(n_estimators=n_estimators).fit(
        train_rows, train_targets, source=source, data=data_info, split=how, students=students)
    model.metadata["metrics"] = evaluate(model, train_targets, test_rows, test_targets)
    model.metadata["feature_importances"] = model.feature_importances()

    if verbose:
        m = model.metadata["metrics"]
        print(f"  rows: {len(rows)} ({len(train_rows)} train / {m['n_test']} test, split {how}), students: {students}")
        print(f"  MAE  : {m['mae']} points   (baselines: training average {m['baseline_mae_train_average']}, "
              f"previous average {m['baseline_mae_previous_average']})")
        print(f"  R^2  : {m['r2']}")
        print(f"  importance: {model.metadata['feature_importances']}")
    if save:
        path = model.save(artifact_path(source))
        if verbose:
            print(f"  saved: {path}")
    return model


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(description="Train the student performance model.")
    source = parser.add_mutually_exclusive_group(required=True)
    source.add_argument("--real", nargs="?", const=str(REAL_HISTORY), metavar="HISTORY_JSON",
                        help="train on real exported history (default data\\real_history.json)")
    source.add_argument("--demo", nargs="?", const=str(REAL_HISTORY), metavar="HISTORY_JSON",
                        help="train only on the seeded demo accounts in the export (simulated history)")
    source.add_argument("--synthetic", action="store_true", help="train on the SYNTHETIC demo dataset")
    parser.add_argument("--trees", type=int, default=100, help="number of trees (default 100)")
    args = parser.parse_args(argv)

    try:
        if args.synthetic:
            print("Training on SYNTHETIC demonstration data (not real students).")
            rows, targets, groups = synthetic_data.generate()
            csv_path = synthetic_data.write_csv(rows, targets, groups)
            print(f"  synthetic rows written for inspection: {csv_path}")
            train(rows, targets, groups, "synthetic", {"file": csv_path.name, "generator": "synthetic_data.py"},
                  n_estimators=args.trees)
            print("  NOTE: these metrics only show the code works; they are not evidence about real students.")
        elif args.demo:
            print(f"Training on DEMO-ACCOUNT history (simulated, not real students): {args.demo}")
            rows, targets, groups, info = load_real(args.demo, demo=True)
            print(f"  built {len(rows)} leakage-free rows ({info['skipped']} skipped)")
            train(rows, targets, groups, "demo", info, n_estimators=args.trees)
            print("  NOTE: demo accounts follow a simulation; these metrics describe that simulation, not real students.")
        else:
            print(f"Training on REAL exported history: {args.real}")
            rows, targets, groups, info = load_real(args.real)
            print(f"  built {len(rows)} leakage-free rows ({info['skipped']} skipped)")
            train(rows, targets, groups, "real", info, n_estimators=args.trees)
    except InsufficientDataError as error:
        print(f"  Not trained: {error}")
        return 2
    except (FileNotFoundError, ValueError) as error:
        print(f"  Error: {error}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.exit(main())
