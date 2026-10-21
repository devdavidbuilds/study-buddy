# Study Buddy — Student Performance Prediction

Predicts a student's **expected score (0–100) on their next quiz** in a
course from their learning history, using scikit-learn's
**RandomForestRegressor**. CPU-only, single core, a few MB of memory; no
neural network, no pretrained model, no external API.

This module is **standalone**: it is not connected to the backend, the
frontend or the course recommender (`ml/recommender.py` is unchanged).

> **Status (2026-10-21): there is not enough real data yet.** The Study
> Buddy database holds 0 quiz attempts and 1 lesson check in total (2
> students with any activity). The real-data path is built and tested, but
> it refuses to train until there are at least 50 assessments from 10
> students. Until then the demo uses a clearly labelled **synthetic**
> dataset, which only shows that the software works.

## Features and target

The prediction point is *just before the student's next assessment in a
course*. All features come from data strictly **before** that moment:

| Feature | Meaning | Source (CourseProgress) |
|---|---|---|
| `prev_quiz_avg` | mean % of earlier assessments in the course (empty if none) | `quizAttempts[].percentage`, `lessonChecks[].percentage` |
| `prev_attempts` | number of earlier assessments | count of the above |
| `completion_pct` | % of the course's lessons completed before the assessment | `completedLessons[].completedAt` / lesson count of the course |
| `last_quiz_score` | % on the most recent earlier assessment (optional) | as above |

**Target:** the % score the student actually got on that assessment.

**Leakage protection:** each assessment's features use only events with an
earlier timestamp. A lesson completed at the same moment as the quiz is not
counted, because completing the check can itself mark the lesson complete.
The test data is split **by student**, so one student's quizzes never appear
in both the training and the test set.

Note: the app keeps every quiz attempt, but only the latest attempt of each
lesson check (retakes replace it), so lesson-check history is partial.

## How the model works

```
history ──► 4 features ──► SimpleImputer (median + "was missing" flags)
                                │
                                ▼
                RandomForestRegressor: 100 trees, max depth 8,
                ≥ 3 rows per leaf, random_state 42, n_jobs 1
                                │
                                ▼
            average of the trees' predictions, clipped to 0–100
```

Each tree learns if/else splits ("previous average > 72 and completion >
40 → ~78") from a random bootstrap sample of the training rows; the forest
averages them, which reduces overfitting. Because every leaf holds real
training scores, predictions always stay within 0–100. Missing values (for
example, a new student with no earlier quizzes) are filled with the training
median, and a flag tells the trees that the value was missing.

## Data sources: real and synthetic are kept separate

| | Real | Synthetic |
|---|---|---|
| Created by | `node ml\performance\export_training_data.js` (read-only) | `synthetic_data.py` (fixed formula, seed 7) |
| Stored in | `data\real_history.json` | `data\SYNTHETIC_demo_dataset.csv` (every row says `source=synthetic`) |
| Train with | `train_model.py --real` | `train_model.py --synthetic` |
| Model file | `artifacts\performance_real.joblib` | `artifacts\performance_synthetic.joblib` |

Each run uses exactly one source; the real loader rejects any file not
marked `"source": "real"`. The export replaces students and courses with
labels (`s1`, `c1`, …) and contains only scores, timestamps and lesson
counts — no names, emails, ids, answers or feedback. `data/` and
`artifacts/` are git-ignored, so exported student data is never committed.

The synthetic generator draws a hidden "ability" per row and makes the
target ≈ 0.75 × ability + 0.15 × completion + a small practice effect +
noise. The model never sees the ability. Good metrics on this data only show
that the pipeline can recover a pattern **we put there**.

## Evaluation

`train_model.py` holds out 20% (seed 42) and reports:

- **MAE**: the average absolute error in score points.
- **R²**: the share of score variation explained (1 = perfect, 0 = no
  better than predicting the average).
- Two **baselines**: always predicting the training average, and predicting
  the student's previous average. The model is only worth using if it beats
  both.

The saved model is the one fitted on the training split, so its stored
metrics describe exactly that model.

## Windows commands

From `D:\progress`. Dependencies are already installed for the recommender,
so this installs nothing new:

```bat
python -m pip install -r ml\performance\requirements.txt
```

Software tests (tiny data, a few seconds):

```bat
python ml\performance\test_model.py
```

Synthetic demo model (600 rows, ~1 s, saves `artifacts\performance_synthetic.joblib`):

```bat
python ml\performance\train_model.py --synthetic
```

Review demo:

```bat
python ml\performance\demo.py --avg 72 --attempts 3 --completion 60
python ml\performance\demo.py --avg 45 --attempts 6 --completion 30 --last 40
python ml\performance\demo.py --attempts 0 --completion 10
```

Real data, once students have quiz history. It reads MongoDB through
`Backend\.env` and never writes to it:

```bat
node ml\performance\export_training_data.js
python ml\performance\train_model.py --real
```

With today's data this prints "Not trained: only 1 assessment rows from 1
students …", which is the intended behaviour. When a real model exists,
`demo.py` uses it automatically (`--synthetic` forces the demo model).

## Limitations

- **No real training data yet**, so no real accuracy can be claimed. Any
  MAE or R² shown today comes from synthetic data.
- Even with real data, four features capture only part of performance:
  quiz difficulty, topic, time spent and study habits are not modelled.
- Lesson checks keep only their latest attempt, so retake history is lost.
- History is per course; a student's record in other courses is not used.
- Predictions are estimates from past patterns, not guaranteed results, and
  should not be used to grade or label students.

## Possible next steps (after approval)

1. Collect real history (students taking quizzes), then re-export and retrain.
2. A minimal integration: a read-only Node endpoint that computes the four
   features for the logged-in student and asks a small Python service, shown
   as "estimated next quiz score ± MAE" on the course page — only once the
   real model beats the baselines.
3. More features: quiz difficulty, time since the last attempt, assignment
   marks (`assignments[].marks`).
