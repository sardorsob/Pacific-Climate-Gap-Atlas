"""Check the built app's JavaScript and CSS assets against release budgets."""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ASSETS_DIR = ROOT / "app" / "dist" / "assets"

# TASK-056 accepted JS baseline was 1,018,827 bytes, below the original cap.
MAX_JS_BYTES = 1_050_000
# TASK-056 accepted CSS baseline was 93,895 bytes (above the original 92,000 cap).
# The 95,000-byte cap is 1.18% above that measured baseline to allow release noise.
MAX_CSS_BYTES = 95_000


def check_assets(assets_dir: Path) -> list[str]:
    errors: list[str] = []
    if not assets_dir.exists():
        return [f"asset directory does not exist: {assets_dir}"]

    for asset in sorted(path for path in assets_dir.rglob("*") if path.is_file()):
        suffix = asset.suffix.lower()
        if suffix not in {".js", ".css"}:
            continue
        size = asset.stat().st_size
        limit = MAX_JS_BYTES if suffix == ".js" else MAX_CSS_BYTES
        print(f"{asset.relative_to(assets_dir)}: {size} bytes (limit {limit})")
        if size > limit:
            errors.append(
                f"{asset.relative_to(assets_dir)} is {size} bytes, over {limit}-byte budget"
            )
    return errors


def main() -> int:
    errors = check_assets(ASSETS_DIR)
    if errors:
        print("App bundle budget check failed:")
        for error in errors:
            print(f"- {error}")
        return 1
    print("App bundle budget check passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
