"""Validate content without seeding a database or changing the input file."""

import argparse
from pathlib import Path

from pydantic import ValidationError

from app.schemas.content import ContentSeed


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("path", type=Path)
    parser.add_argument("--require-approved", action="store_true")
    args = parser.parse_args()
    try:
        seed = ContentSeed.model_validate_json(args.path.read_text())
        if args.require_approved:
            seed.require_import_ready()
    except (OSError, ValidationError, ValueError) as error:
        parser.exit(1, f"Seed validation failed: {error}\n")
    print(f"Valid seed: {len(seed.experience)} roles, {len(seed.projects)} project candidates, "
          f"{len(seed.skills)} skills; review status: {seed.review_status}.")
    print("No database was created or modified.")


if __name__ == "__main__":
    main()
