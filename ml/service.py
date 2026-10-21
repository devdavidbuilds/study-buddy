"""Tiny HTTP API around the course recommender (Python standard library only).

The Node.js backend calls this service; browsers never do. It only returns
course ids, titles and scores — the backend loads the full course data from
MongoDB itself.

Endpoints
---------
GET  /health                      -> model status
POST /recommend  (JSON body)      -> ranked recommendations
     {"query": "python", "k": 5}                       search / interests
     {"course_id": "<id>", "text": "...", "k": 5}      similar to a course
     optional "exclude_ids": ["<id>", ...]
GET  /recommend?q=python&k=5      -> same, handy for a browser demo
     (or ?course_id=<id>)

Configuration (environment variables)
-------------------------------------
PORT / RECOMMENDER_PORT   port to listen on (default 8001)
RECOMMENDER_HOST          interface (default 127.0.0.1; use 0.0.0.0 on Render)
RECOMMENDER_MODEL_PATH    model file (default artifacts/course_recommender.joblib)
RECOMMENDER_CATALOG_URL   if the model file is missing (or --retrain is given),
                          the model is trained at startup from this URL
                          (default http://localhost:5000/api/recommendations/catalog)
RECOMMENDER_API_TOKEN     optional shared secret; when set, /recommend needs
                          "Authorization: Bearer <token>" (the backend sends it)

Run:  python ml\\service.py            (Ctrl+C to stop)
"""

from __future__ import annotations

import argparse
import hmac
import json
import os
import sys
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, urlparse

from recommender import DEFAULT_MODEL_PATH, DEFAULT_TOP_K, CatalogError, CourseRecommender
from train_model import DEFAULT_CATALOG_URL, load_catalog_from_url, train

MAX_BODY_BYTES = 16 * 1024
MAX_TEXT_LENGTH = 2000
MAX_EXCLUDE_IDS = 50

MODEL: CourseRecommender | None = None
API_TOKEN = os.environ.get("RECOMMENDER_API_TOKEN", "")


def handle_recommend(params: dict) -> tuple[int, dict]:
    """Validate one request and run the model. Returns (status, json body)."""
    query = params.get("query")
    cid = params.get("course_id")
    text = params.get("text")
    exclude_ids = params.get("exclude_ids") or []

    for name, value in (("query", query), ("course_id", cid), ("text", text)):
        if value is not None and not isinstance(value, str):
            return 400, {"error": f"{name} must be a string"}
        if isinstance(value, str) and len(value) > MAX_TEXT_LENGTH:
            return 400, {"error": f"{name} must be at most {MAX_TEXT_LENGTH} characters"}
    if not isinstance(exclude_ids, list) or len(exclude_ids) > MAX_EXCLUDE_IDS:
        return 400, {"error": f"exclude_ids must be a list of at most {MAX_EXCLUDE_IDS} ids"}

    query, cid = (query or "").strip(), (cid or "").strip()
    if not query and not cid:
        return 400, {"error": "query or course_id is required"}

    k = params.get("k", DEFAULT_TOP_K)
    exclude = [str(item) for item in exclude_ids] + ([cid] if cid else [])

    # A query wins when both are given; the selected course is still excluded.
    if query:
        results = MODEL.recommend(query, k=k, exclude_ids=exclude)
    else:
        results = MODEL.similar_to(cid, k=k, text=text, exclude_ids=exclude)

    body = {"results": results, "model": MODEL.info()}
    if query:
        body["query_terms"] = MODEL.query_terms(query)
    return 200, body


class Handler(BaseHTTPRequestHandler):
    server_version = "StudyBuddyRecommender/1.0"

    def _send(self, status: int, body: dict) -> None:
        data = json.dumps(body).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def _authorized(self) -> bool:
        if not API_TOKEN:
            return True
        return hmac.compare_digest(self.headers.get("Authorization", ""), f"Bearer {API_TOKEN}")

    def do_GET(self):  # noqa: N802 (http.server naming)
        url = urlparse(self.path)
        if url.path == "/health":
            return self._send(200, {"status": "ok", "model": MODEL.info()})
        if url.path == "/recommend":
            if not self._authorized():
                return self._send(401, {"error": "unauthorized"})
            qs = parse_qs(url.query)
            first = lambda name: qs.get(name, [None])[0]  # noqa: E731
            return self._send(*handle_recommend({
                "query": first("q"),
                "course_id": first("course_id"),
                "k": first("k") or DEFAULT_TOP_K,
            }))
        return self._send(404, {"error": "not found"})

    def do_POST(self):  # noqa: N802
        if urlparse(self.path).path != "/recommend":
            return self._send(404, {"error": "not found"})
        if not self._authorized():
            return self._send(401, {"error": "unauthorized"})
        try:
            length = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            length = -1
        if length < 0 or length > MAX_BODY_BYTES:
            return self._send(413, {"error": "request body too large"})
        try:
            params = json.loads(self.rfile.read(length) or b"{}")
        except (json.JSONDecodeError, UnicodeDecodeError):
            return self._send(400, {"error": "body must be JSON"})
        if not isinstance(params, dict):
            return self._send(400, {"error": "body must be a JSON object"})
        try:
            return self._send(*handle_recommend(params))
        except Exception as error:  # never leak a traceback to the caller
            print(f"recommend failed: {error!r}", file=sys.stderr)
            return self._send(500, {"error": "recommendation failed"})

    def log_message(self, fmt, *args):
        # One short line per request; query text is not logged.
        sys.stderr.write(f"{self.address_string()} {self.command} {urlparse(self.path).path} {args[1] if len(args) > 1 else ''}\n")


def load_model(path: str, retrain: bool, catalog_url: str) -> CourseRecommender:
    if not retrain and os.path.exists(path):
        print(f"Loading model from {path}")
        return CourseRecommender.load(path)
    print(f"Training model from {catalog_url}")
    return train(load_catalog_from_url(catalog_url), source=catalog_url, output=path)


def main(argv=None) -> int:
    global MODEL
    parser = argparse.ArgumentParser(description="Serve course recommendations over HTTP.")
    parser.add_argument("--retrain", action="store_true", help="rebuild the model from the catalog URL at startup")
    args = parser.parse_args(argv)

    path = os.environ.get("RECOMMENDER_MODEL_PATH", str(DEFAULT_MODEL_PATH))
    catalog_url = os.environ.get("RECOMMENDER_CATALOG_URL", DEFAULT_CATALOG_URL)
    host = os.environ.get("RECOMMENDER_HOST", "127.0.0.1")
    port = int(os.environ.get("PORT") or os.environ.get("RECOMMENDER_PORT") or 8001)

    try:
        MODEL = load_model(path, args.retrain, catalog_url)
    except (CatalogError, OSError) as error:
        print(f"Cannot start: {error}", file=sys.stderr)
        return 1

    info = MODEL.info()
    print(f"Model ready: {info['courses']} courses, {info['features']} features (trained {info['trained_at']})")
    print(f"Recommendation service listening on http://{host}:{port}  (Ctrl+C to stop)")
    server = ThreadingHTTPServer((host, port), Handler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
    return 0


if __name__ == "__main__":
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.exit(main())
