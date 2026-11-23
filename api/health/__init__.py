import os
import sys
import jsons
import pandas

import azure.functions as func

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import nextgen_core as core  # noqa: E402


def main(req: func.HttpRequest) -> func.HttpResponse:
    status, payload = core.handle_health(deep=req.params.get("deep") in ("1", "true"))
    return func.HttpResponse(json.dumps(payload), status_code=status, mimetype="application/json",
                             headers={"Cache-Control": "no-store"})
