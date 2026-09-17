import copy
import hashlib
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

from pydantic import ValidationError

from app.cli.extract_resumes import normalize_text
from app.schemas.content import ContentSeed

ROOT = Path(__file__).resolve().parents[2]
SEED_PATH = ROOT / "seed/content-seed.json"


class ContentTests(unittest.TestCase):
    def setUp(self):
        self.raw = json.loads(SEED_PATH.read_text())
        # Test draft rules independently of the owner's current approval state.
        self.raw["review_status"] = "pending"

    def test_draft_is_structurally_valid_but_cannot_be_imported(self):
        seed = ContentSeed.model_validate(self.raw)
        with self.assertRaisesRegex(ValueError, "Owner approval"):
            seed.require_import_ready()

    def test_confirmed_date_and_no_invented_day(self):
        microsoft = next(role for role in self.raw["experience"] if role["id"] == "microsoft")
        self.assertEqual(microsoft["end_date"], "2026-04")
        microsoft["end_date"] = "2026-04-01"
        with self.assertRaises(ValidationError):
            ContentSeed.model_validate(self.raw)

    def test_invalid_month_rejected(self):
        self.raw["experience"][0]["start_date"] = "2026-13"
        with self.assertRaises(ValidationError):
            ContentSeed.model_validate(self.raw)

    def test_reversed_dates_rejected(self):
        self.raw["experience"][1]["end_date"] = "2024-04"
        with self.assertRaisesRegex(ValidationError, "precedes"):
            ContentSeed.model_validate(self.raw)

    def test_current_role_cannot_have_an_end_date(self):
        self.raw["experience"][0]["end_date"] = "2026-05"
        with self.assertRaisesRegex(ValidationError, "current role"):
            ContentSeed.model_validate(self.raw)

    def test_duplicate_entities_rejected(self):
        self.raw["projects"].append(copy.deepcopy(self.raw["projects"][0]))
        with self.assertRaisesRegex(ValidationError, "Duplicate project"):
            ContentSeed.model_validate(self.raw)

    def test_duplicate_repository_under_a_different_id_rejected(self):
        duplicate = copy.deepcopy(self.raw["projects"][0])
        duplicate["id"] = "same-project-another-name"
        duplicate["repo_url"] = duplicate["repo_url"].upper() + "/"
        self.raw["projects"].append(duplicate)
        with self.assertRaisesRegex(ValidationError, "Duplicate project repository"):
            ContentSeed.model_validate(self.raw)

    def test_github_evidence_requires_traceable_reference(self):
        source = next(source for source in self.raw["sources"] if source["kind"] == "github_file")
        source["git_blob_sha"] = None
        with self.assertRaisesRegex(ValidationError, "source URL and blob SHA"):
            ContentSeed.model_validate(self.raw)

    def test_owner_approved_import_keeps_repository_projects_as_drafts(self):
        seed = ContentSeed.model_validate_json(SEED_PATH.read_text())
        seed.require_import_ready()
        self.assertEqual(len(seed.projects), 10)
        self.assertEqual(sum(project.id == "role-collector" for project in seed.projects), 1)
        self.assertTrue(all(project.status == "draft" for project in seed.projects))
        self.assertEqual(next(p for p in seed.projects if p.id == "codemate").editorial_status, "pending")

    def test_unknown_claim_source_rejected(self):
        self.raw["experience"][0]["bullets"][0]["sources"] = ["invented-source"]
        with self.assertRaisesRegex(ValidationError, "Unknown source"):
            ContentSeed.model_validate(self.raw)

    def test_approval_cannot_hide_a_pending_issue(self):
        self.raw["review_status"] = "approved"
        self.raw["review_issues"][0]["disposition"] = "pending"
        with self.assertRaisesRegex(ValidationError, "Unresolved review issues"):
            ContentSeed.model_validate(self.raw)

    def test_approval_cannot_hide_an_unresolved_date(self):
        self.raw["review_status"] = "approved"
        self.raw["experience"][1]["end_date"] = None
        self.raw["experience"][1]["date_review_required"] = True
        with self.assertRaisesRegex(ValidationError, "Unresolved employment dates"):
            ContentSeed.model_validate(self.raw)

    def test_resolved_approved_copy_passes_import_guard_without_writing(self):
        self.raw["review_status"] = "approved"
        ContentSeed.model_validate(self.raw).require_import_ready()

    def test_phone_field_is_not_part_of_public_profile_contract(self):
        self.raw["site_settings"]["phone"] = "not-public"
        with self.assertRaisesRegex(ValidationError, "Extra inputs"):
            ContentSeed.model_validate(self.raw)

    def test_seed_contains_no_phone_or_pdf_ligatures(self):
        text = SEED_PATH.read_text()
        self.assertNotRegex(text, r"\b\d{3}[-.]\d{3}[-.]\d{4}\b")
        self.assertNotIn("tel:", text)
        self.assertFalse(any("\ufb00" <= char <= "\ufb06" for char in text))
        self.assertIsNone(self.raw["site_settings"]["resume_url"])

    def test_project_links_are_web_urls(self):
        self.raw["projects"][0]["repo_url"] = "javascript:alert(1)"
        with self.assertRaises(ValidationError):
            ContentSeed.model_validate(self.raw)

    def test_exact_technology_names_survive_merge(self):
        names = {skill["name"] for skill in self.raw["skills"]}
        self.assertTrue({"Langfuse", "LangSmith", "QLoRA/PEFT", "Qwen3 8B embeddings"} <= names)

    def test_pdf_ligatures_are_expanded(self):
        self.assertEqual(normalize_text("workﬂows  oﬄoading\n  ﬁne-tuning"), "workflows offloading\nfine-tuning")

    def test_json_schema_matches_authoritative_models(self):
        saved = json.loads((ROOT / "seed/content-seed.schema.json").read_text())
        self.assertEqual(saved, ContentSeed.model_json_schema())

    def test_cli_approval_gate_does_not_modify_seed(self):
        before = hashlib.sha256(SEED_PATH.read_bytes()).hexdigest()
        with tempfile.TemporaryDirectory() as temp:
            draft = Path(temp) / "draft.json"
            draft.write_text(json.dumps(self.raw))
            result = subprocess.run(
                [sys.executable, "-m", "app.cli.validate_seed", str(draft), "--require-approved"],
                capture_output=True, text=True,
            )
        self.assertEqual(result.returncode, 1)
        self.assertIn("Owner approval", result.stderr)
        self.assertEqual(before, hashlib.sha256(SEED_PATH.read_bytes()).hexdigest())


if __name__ == "__main__":
    unittest.main()
