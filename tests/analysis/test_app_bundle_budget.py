from __future__ import annotations

import tempfile
import unittest
from pathlib import Path

from scripts import check_app_bundle_budget


class AppBundleBudgetTests(unittest.TestCase):
    def test_uses_approved_task_108_css_threshold(self) -> None:
        self.assertEqual(check_app_bundle_budget.MAX_CSS_BYTES, 97_500)

    def test_assets_one_byte_below_threshold_pass(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            assets = Path(tmp)
            (assets / "app.js").write_bytes(b"x" * (check_app_bundle_budget.MAX_JS_BYTES - 1))
            (assets / "app.css").write_bytes(b"x" * (check_app_bundle_budget.MAX_CSS_BYTES - 1))

            errors = check_app_bundle_budget.check_assets(assets)

            self.assertEqual(errors, [])

    def test_assets_one_byte_above_threshold_fail(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            assets = Path(tmp)
            (assets / "app.js").write_bytes(b"x" * (check_app_bundle_budget.MAX_JS_BYTES + 1))
            (assets / "app.css").write_bytes(b"x" * (check_app_bundle_budget.MAX_CSS_BYTES + 1))

            errors = check_app_bundle_budget.check_assets(assets)

            self.assertEqual(len(errors), 2)
            self.assertTrue(any("app.js" in error for error in errors))
            self.assertTrue(any("app.css" in error for error in errors))


if __name__ == "__main__":
    unittest.main()
