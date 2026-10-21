"""Review demo: predict the next quiz score from a student's history.

    python ml\\performance\\demo.py --avg 72 --attempts 3 --completion 60
    python ml\\performance\\demo.py --avg 72 --attempts 3 --completion 60 --last 80
    python ml\\performance\\demo.py --attempts 0 --completion 10      (new student)

Uses the real-student model if one has been trained, then the demo-account
model, then the SYNTHETIC model (with a warning for the last two); --source
picks one explicitly. The prediction comes from the saved model; it is
an estimate, not a guaranteed score.
"""

from __future__ import annotations

import argparse
import sys

from performance_model import FEATURES, PerformanceModel, artifact_path

LABELS = {
    "prev_quiz_avg": "Previous quiz average (%)",
    "prev_attempts": "Previous quiz attempts",
    "completion_pct": "Course completion (%)",
    "last_quiz_score": "Most recent quiz score (%)",
}


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(description="Predict a student's next quiz score.")
    parser.add_argument("--avg", type=float, help="previous quiz average, 0-100 (omit if no attempts)")
    parser.add_argument("--attempts", type=int, required=True, help="number of previous quiz attempts")
    parser.add_argument("--completion", type=float, help="course completion percentage, 0-100")
    parser.add_argument("--last", type=float, help="most recent quiz score, 0-100 (optional)")
    parser.add_argument("--source", choices=["real", "demo", "synthetic"], help="which trained model to use")
    args = parser.parse_args(argv)

    features = {"prev_quiz_avg": args.avg, "prev_attempts": args.attempts,
                "completion_pct": args.completion, "last_quiz_score": args.last}

    order = [args.source] if args.source else ["real", "demo", "synthetic"]
    path = next((artifact_path(s) for s in order if artifact_path(s).exists()), None)
    if path is None:
        print("No trained model found. Train one first, e.g.:\n  python ml\\performance\\train_model.py --synthetic")
        return 1
    model = PerformanceModel.load(path)
    meta = model.metadata

    print("\n=== Study Buddy - next quiz score prediction (Random Forest) ===")
    if meta["source"] == "synthetic":
        print("\n  WARNING: this model was trained ONLY on SYNTHETIC demonstration data.")
        print("  It shows how the software works; the number below is not evidence")
        print("  about any real student.\n")
    elif meta["source"] == "demo":
        print("\n  NOTE: this model was trained on the SIMULATED learning history of the")
        print("  seeded demo accounts (@demo.studybuddy.in), not on real students.")
        print("  It demonstrates the full pipeline on data stored in the app.\n")

    print("Input features:")
    for name in FEATURES:
        value = features[name]
        print(f"  {LABELS[name]:<28} {'(missing - imputed)' if value is None else value}")

    try:
        predicted = model.predict_one(features)
    except ValueError as error:
        print(f"\nInvalid input: {error}")
        return 1

    m = meta.get("metrics", {})
    print(f"\nPredicted next quiz score: {predicted} / 100")
    if m.get("mae") is not None:
        print(f"  typical error on held-out { {'real': 'real', 'demo': 'demo-account'}.get(meta['source'], 'synthetic') } data: "
              f"about +/- {m['mae']} points (MAE)")
    print("  This is an estimate from past patterns, not a guaranteed result.")

    print(f"\nModel: trained {meta.get('trained_at')} on {meta.get('n_train')} {meta['source']} rows "
          f"({meta.get('students')} {'students' if meta['source'] == 'real' else 'demo accounts' if meta['source'] == 'demo' else 'made-up students'})")
    print(f"  held-out test rows: {m.get('n_test')}, MAE {m.get('mae')}, R^2 {m.get('r2')}")
    print(f"  baselines MAE: training average {m.get('baseline_mae_train_average')}, "
          f"previous average {m.get('baseline_mae_previous_average')}")
    print(f"  feature importance: {meta.get('feature_importances')}")
    print()
    return 0


if __name__ == "__main__":
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.exit(main())
