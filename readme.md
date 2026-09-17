# botta.in

Personal portfolio with a Next.js/React frontend and Python/FastAPI backend.
Design inspiration: [Tukesh1/tukesh.in](https://github.com/Tukesh1/tukesh.in).
No upstream application code has been copied.

## Current milestone

Phase 0: all four source résumés have been read, compared, and merged into
`seed/content-seed.json`. The résumé-derived content is **owner-approved for import**, not published.
Ten project drafts include six additions from the owner’s GitHub repositories.
New/enriched project copy remains editorially pending. Local reviews are
`.preference/content-review.md` and `.preference/project-review.md`.

Implemented: FastAPI health endpoint, Pydantic seed models and JSON Schema,
PDF extraction tooling, a read-only validator, and validation/API tests.
Not implemented yet: frontend, SQLAlchemy persistence, Alembic migrations,
OAuth, admin, or deployment. Hosting must remain within a verified $0 budget.

## Local backend

Requires Python 3.12+ and uv. From the repository root:

```sh
cd backend
uv sync --extra ingest --extra test --locked
uv run --no-sync uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Health: `http://127.0.0.1:8000/api/v1/health`.
API documentation: `http://127.0.0.1:8000/docs`.

From `backend/`, validate the content or run tests:

```sh
uv run --no-sync python -m app.cli.validate_seed ../seed/content-seed.json
uv run --no-sync python -m unittest discover -s tests -v
```

Check import approval (the current seed is approved; this still does not publish):

```sh
uv run --no-sync python -m app.cli.validate_seed ../seed/content-seed.json --require-approved
```

To re-extract the original PDFs into an ignored review directory:

```sh
uv run --no-sync python -m app.cli.extract_resumes ../resume ../.preference/resume-extraction
```

Extraction normalizes Unicode ligatures and preserves source hashes and page
numbers. Extracted source text may contain private contact details; do not serve
it. The reviewed seed omits the phone number. Never overwrite an approved seed
or delete original résumés without owner authorization.

## Next milestones

Verify free Python hosting and durable storage,
then build the database and admin before public UI. Public résumé creation
requires its dedicated conversation in Phase 4. Use the supplied project
repositories in Phase 5 and request only remaining assets and featured priorities.
