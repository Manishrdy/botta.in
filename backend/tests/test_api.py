import unittest

from fastapi.testclient import TestClient

from app.main import create_app


class ApiTests(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(create_app())

    def tearDown(self):
        self.client.close()

    def test_health(self):
        response = self.client.get("/api/v1/health")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"status": "ok"})

    def test_private_seed_and_resume_files_are_not_served(self):
        for path in (
            "/seed/content-seed.json", "/.preference/content-review.md",
            "/resume/ManishBotta_Resume_SWE.pdf", "/api/v1/admin/content",
        ):
            with self.subTest(path=path):
                self.assertEqual(self.client.get(path).status_code, 404)


if __name__ == "__main__":
    unittest.main()
