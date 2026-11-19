import os
import sys
import json

import azure.functions as func

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import nextgen_core as core  # noqa: E402


def main(req: func.HttpRequest) -> func.HttpResponse:
    try:
        body = req.get_json()
    except ValueError:
        body = None
    status, payload = core.handle_chat(body, req.headers)
    return func.HttpResponse(json.dumps(payload), status_code=status, mimetype="application/json",
                             headers={"Cache-Control": "no-store"})
