"""
Run the chat API on your own computer (no Azure tools needed):

    cd api
    pip install requests openpyxl
    python local_server.py

It listens on http://127.0.0.1:8000 with the same /api/chat and /api/health addresses.
It reads GOOGLE_API_KEY (and the other settings) from a .env file in this folder, or from
local.settings.json, or from your environment. On the real site this file is NOT used.
"""
import os
import re
import json
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

HERE = os.path.dirname(os.path.abspath(__file__))


def load_local_settings():
    path = os.path.join(HERE, ".env")
    if os.path.exists(path):
        for line in open(path, encoding="utf-8-sig"):
            m = re.match(r"\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$", line)
            if m and not line.lstrip().startswith("#"):
                os.environ.setdefault(m.group(1), m.group(2).strip("'\""))
    path = os.path.join(HERE, "local.settings.json")
    if os.path.exists(path):
        for k, v in json.load(open(path, encoding="utf-8")).get("Values", {}).items():
            os.environ.setdefault(k, str(v))


load_local_settings()
import nextgen_core as core  # noqa: E402


class Handler(BaseHTTPRequestHandler):
    def _send(self, status, payload):
        data = json.dumps(payload).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Access-Control-Allow-Origin", "*")   # local testing only (site opened from another port)
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.end_headers()
        self.wfile.write(data)

    def do_OPTIONS(self):
        self._send(204, {})

    def do_GET(self):
        if self.path.split("?")[0] == "/api/health":
            self._send(*core.handle_health())
        else:
            self._send(404, {"error": "not found"})

    def do_POST(self):
        if self.path.split("?")[0] != "/api/chat":
            return self._send(404, {"error": "not found"})
        try:
            n = int(self.headers.get("Content-Length") or 0)
            body = json.loads(self.rfile.read(min(n, 100000)) or b"null")
        except ValueError:
            body = None
        self._send(*core.handle_chat(body, {"x-forwarded-for": self.client_address[0]}))


if __name__ == "__main__":
    print("NextGenPH chat API on http://127.0.0.1:8000  (Ctrl+C to stop)")
    ThreadingHTTPServer(("127.0.0.1", 8000), Handler).serve_forever()
