"""Minimal API foundation; content remains private until reviewed and published."""

from fastapi import FastAPI
from pydantic import BaseModel


class HealthResponse(BaseModel):
    status: str


def create_app() -> FastAPI:
    app = FastAPI(title="botta.in API", version="0.1.0")

    @app.get("/api/v1/health", response_model=HealthResponse, tags=["health"])
    def health() -> HealthResponse:
        return HealthResponse(status="ok")

    return app


app = create_app()
