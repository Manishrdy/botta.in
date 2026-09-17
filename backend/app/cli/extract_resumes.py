"""Extract source evidence into an ignored review directory; never publish PDFs."""

import argparse
import hashlib
import json
import re
import unicodedata
from pathlib import Path

from pypdf import PdfReader


def normalize_text(text: str) -> str:
    """Expand PDF ligatures without guessing at missing words or changing facts."""
    normalized = unicodedata.normalize("NFKC", text).replace("\u00ad", "")
    return "\n".join(re.sub(r"[ \t]+", " ", line).strip() for line in normalized.splitlines())


def extract(source: Path) -> dict:
    reader = PdfReader(source)
    return {
        "filename": source.name,
        "sha256": hashlib.sha256(source.read_bytes()).hexdigest(),
        "pages": [
            {"page": index + 1, "text": normalize_text(page.extract_text() or "")}
            for index, page in enumerate(reader.pages)
        ],
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path)
    parser.add_argument("output", type=Path, help="Use an ignored, private directory")
    args = parser.parse_args()
    paths = sorted(args.source.glob("*.pdf"))
    if not paths:
        parser.error("No résumé PDFs found")
    args.output.mkdir(parents=True, exist_ok=True)
    for path in paths:
        destination = args.output / f"{path.stem}.json"
        destination.write_text(json.dumps(extract(path), ensure_ascii=False, indent=2) + "\n")
    print(f"Extracted {len(paths)} PDFs. Output may contain private source contact details; do not publish.")


if __name__ == "__main__":
    main()
