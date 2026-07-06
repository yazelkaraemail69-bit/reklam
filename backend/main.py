"""Compatibility entry point for local preview server runners.

The application itself lives in app/main.py. This wrapper supports tooling that
starts FastAPI from the backend root with either `uvicorn main:app` or
`python main.py`.
"""

import os

from app.main import app


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", "8000")),
    )
