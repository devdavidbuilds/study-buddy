"""Tests and a readable demo for the course recommender.

    python ml\\test_recommender.py

Two groups of tests:
* EdgeCaseTests use a few hand-written courses to check behaviour that must
  hold for any catalog (empty data, missing fields, duplicates, exclusion).
* RealCatalogTests load the model trained from the real Study Buddy catalog
  (run train_model.py first) and print the top-5 results for the demo
  queries so they can be inspected.
"""

from __future__ import annotations

import sys
import tempfile
import unittest
from pathlib import Path

from recommender import DEFAULT_MODEL_PATH, CatalogError, CourseRecommender, format_results
from service import handle_recommend
import service

SAMPLE_COURSES = [
    {"_id": "c1", "courseName": "Python Programming for Beginners", "category": "Programming",
     "description": "Learn Python syntax, variables, loops and functions.", "skills": ["Python"]},
    {"_id": "c2", "courseName": "Advanced Python: Decorators and Generators", "category": "Programming",
     "description": "Deep dive into advanced Python features."},
    {"_id": "c3", "courseName": "Web Development with HTML, CSS and JavaScript", "category": "Web Development",
     "description": "Build responsive websites.", "skills": ["HTML", "CSS", "JavaScript"]},
    {"_id": "c4", "courseName": "Node.js REST APIs", "category": "Web Development",
     "description": None, "modules": [{"title": "Express routing"}, {"title": "MongoDB with Mongoose"}]},
    {"_id": "c5", "courseName": "Acoustic Guitar Basics", "category": "Musical Instruments",
     "description": "Chords, strumming and your first songs."},
    {"_id": "c6", "courseName": "Acoustic Guitar Basics", "category": "Musical Instruments",
     "description": "Chords, strumming and your first songs."},  # duplicate listing, new id
    {"_id": "c7", "courseName": "Logo Design in Illustrator", "category": "Graphic Design"},  # no description
    {"_id": "c1", "courseName": "Duplicate id — must be skipped"},
    {"courseName": "No id — must be skipped"},
    "not a course",
]


class EdgeCaseTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.model = CourseRecommender().fit(SAMPLE_COURSES)

    def test_bad_records_are_skipped(self):
        self.assertEqual(self.model.stats["courses"], 7)
        self.assertEqual(self.model.stats["skipped"], {"invalid": 1, "missing_id": 1, "duplicate_id": 1})

    def test_python_query_ranks_python_courses_first(self):
        results = self.model.recommend("python programming", k=5)
        self.assertEqual([r["id"] for r in results[:2]], ["c1", "c2"])
        scores = [r["score"] for r in results]
        self.assertEqual(scores, sorted(scores, reverse=True))
        self.assertTrue(all(0 < s <= 1 for s in scores))

    def test_empty_and_invalid_queries_return_nothing(self):
        for query in ["", "   ", None, 42, ["python"], "the and of"]:  # last one: only stop words
            with self.subTest(query=query):
                self.assertEqual(self.model.recommend(query), [])

    def test_unknown_words_return_nothing_instead_of_random_courses(self):
        self.assertEqual(self.model.recommend("quantum chromodynamics"), [])
        self.assertEqual(self.model.query_terms("python quantum")["unknown"], ["quantum"])

    def test_missing_description_still_indexed(self):
        self.assertIn("c7", [r["id"] for r in self.model.recommend("logo illustrator")])
        self.assertIn("c4", [r["id"] for r in self.model.recommend("node.js mongoose")])

    def test_tech_names_survive_tokenizing(self):
        self.assertEqual(self.model.recommend("nodejs")[0]["id"], "c4")

    def test_selected_course_is_excluded(self):
        results = self.model.similar_to("c1", k=5)
        self.assertNotIn("c1", [r["id"] for r in results])
        self.assertEqual(results[0]["id"], "c2")
        self.assertNotIn("c2", [r["id"] for r in self.model.recommend("python", exclude_ids=["c2"])])

    def test_duplicate_courses_are_not_recommended_as_similar(self):
        # c6 is a copy of c5: it is neither "similar to c5" nor listed twice.
        self.assertNotIn("c6", [r["id"] for r in self.model.similar_to("c5")])
        guitar = [r for r in self.model.recommend("acoustic guitar") if "Guitar" in r["title"]]
        self.assertEqual(len(guitar), 1)

    def test_unknown_course_uses_fallback_text(self):
        results = self.model.similar_to("new-course", text="Python loops and functions")
        self.assertEqual(results[0]["id"], "c1")
        self.assertEqual(self.model.similar_to("new-course"), [])

    def test_k_is_validated(self):
        self.assertLessEqual(len(self.model.recommend("course", k="abc")), 5)
        self.assertEqual(len(self.model.recommend("python", k=1)), 1)
        self.assertGreaterEqual(len(self.model.recommend("python", k=-3)), 1)

    def test_empty_dataset(self):
        for data in ([], None, [{"_id": "x"}], [{"_id": "y", "courseName": "the and"}]):
            with self.subTest(data=data):
                empty = CourseRecommender().fit(data)
                self.assertFalse(empty.is_ready)
                self.assertEqual(empty.recommend("python"), [])
                self.assertEqual(empty.similar_to("x"), [])
        with self.assertRaises(CatalogError):
            CourseRecommender().fit("not a list")

    def test_save_and_load_round_trip(self):
        with tempfile.TemporaryDirectory() as folder:
            path = self.model.save(Path(folder) / "model.joblib")
            loaded = CourseRecommender.load(path)
        self.assertEqual(loaded.recommend("python"), self.model.recommend("python"))


class ServiceValidationTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        service.MODEL = CourseRecommender().fit(SAMPLE_COURSES)

    def test_query_request(self):
        status, body = handle_recommend({"query": "python", "k": 2})
        self.assertEqual(status, 200)
        self.assertEqual(len(body["results"]), 2)
        self.assertEqual(body["model"]["name"], "tfidf-cosine")

    def test_course_request_excludes_course(self):
        status, body = handle_recommend({"course_id": "c3"})
        self.assertEqual(status, 200)
        self.assertNotIn("c3", [r["id"] for r in body["results"]])

    def test_invalid_requests(self):
        for params in ({}, {"query": "  "}, {"query": 5}, {"query": "x" * 5000}, {"query": "a", "exclude_ids": "c1"}):
            with self.subTest(params=params):
                self.assertEqual(handle_recommend(params)[0], 400)


@unittest.skipUnless(DEFAULT_MODEL_PATH.exists(), "no trained model - run: python ml\\train_model.py")
class RealCatalogTests(unittest.TestCase):
    """Uses the model trained on the real Study Buddy catalog."""

    @classmethod
    def setUpClass(cls):
        cls.model = CourseRecommender.load(DEFAULT_MODEL_PATH)

    def show(self, query, results):
        terms = self.model.query_terms(query)
        note = f"   [ignored, not in catalog: {', '.join(terms['unknown'])}]" if terms["unknown"] else ""
        print(f'\n\n  Query: "{query}"{note}\n{format_results(results)}')

    def assert_valid(self, results, k=5):
        self.assertLessEqual(len(results), k)
        self.assertEqual(len({r["id"] for r in results}), len(results))
        scores = [r["score"] for r in results]
        self.assertEqual(scores, sorted(scores, reverse=True))
        self.assertTrue(all(0 < s <= 1 for s in scores))

    def test_catalog_size(self):
        self.assertGreater(self.model.stats["courses"], 1000)

    def test_python_programming(self):
        results = self.model.recommend("Python programming")
        self.show("Python programming", results)
        self.assert_valid(results)
        self.assertEqual(len(results), 5)
        self.assertTrue(all("python" in r["title"].lower() for r in results))

    def test_web_development(self):
        results = self.model.recommend("web development")
        self.show("web development", results)
        self.assert_valid(results)
        self.assertEqual(len(results), 5)
        self.assertTrue(all(r["category"] == "Web Development" for r in results))

    def test_machine_learning(self):
        # The catalog has no machine-learning course: "machine" is not in the
        # vocabulary, so only "learning" can match. The test documents that
        # limitation instead of hiding it.
        results = self.model.recommend("machine learning")
        self.show("machine learning", results)
        self.assert_valid(results)
        self.assertIn("machine", self.model.query_terms("machine learning")["unknown"])

    def test_data_analytics(self):
        results = self.model.recommend("data analytics")
        self.show("data analytics", results)
        self.assert_valid(results)
        self.assertIn("analytics", results[0]["title"].lower())

    def test_empty_query(self):
        self.assertEqual(self.model.recommend(""), [])

    def test_similar_courses_exclude_selected(self):
        index = next(i for i, t in enumerate(self.model.titles) if "django" in t.lower())
        selected = self.model.ids[index]
        results = self.model.similar_to(selected)
        self.show(f"similar to: {self.model.titles[index]}", results)
        self.assert_valid(results)
        self.assertNotIn(selected, [r["id"] for r in results])
        self.assertNotIn(self.model.titles[index].lower(), [r["title"].lower() for r in results])


if __name__ == "__main__":
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    unittest.main(verbosity=2)
