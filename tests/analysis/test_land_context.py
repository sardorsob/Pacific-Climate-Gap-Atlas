import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from scripts import build_land_context


class LandContextTests(unittest.TestCase):
    def test_shift_pacific_lon_keeps_pacific_contiguous(self):
        self.assertEqual(build_land_context.shift_pacific_lon(166.9), 166.9)
        self.assertEqual(build_land_context.shift_pacific_lon(-170.7), 189.3)

    def test_feature_intersects_pacific_bounds_after_antimeridian_shift(self):
        feature = {
            "type": "Feature",
            "properties": {"name": "test island"},
            "geometry": {
                "type": "Polygon",
                "coordinates": [[[-171, -15], [-170, -15], [-170, -14], [-171, -14], [-171, -15]]],
            },
        }

        self.assertTrue(
            build_land_context.feature_intersects_bounds(
                feature,
                build_land_context.PACIFIC_BOUNDS,
            )
        )

    def test_source_download_rejects_a_caller_controlled_url(self):
        with tempfile.TemporaryDirectory() as tmp:
            source_path = Path(tmp) / "source.geojson"
            with (
                patch("scripts.build_land_context.urllib.request.urlopen") as transport,
                self.assertRaisesRegex(ValueError, "approved Natural Earth source"),
            ):
                build_land_context.ensure_source(
                    source_path,
                    source_url="https://example.test/alternate.geojson",
                )

        transport.assert_not_called()

    def test_source_download_uses_the_approved_natural_earth_url(self):
        class Response:
            def __enter__(self):
                return self

            def __exit__(self, *args):
                return None

            def read(self):
                return b'{"type":"FeatureCollection","features":[]}'

        with tempfile.TemporaryDirectory() as tmp:
            source_path = Path(tmp) / "source.geojson"
            with patch(
                "scripts.build_land_context.urllib.request.urlopen",
                return_value=Response(),
            ) as transport:
                build_land_context.ensure_source(source_path)

            self.assertEqual(
                source_path.read_bytes(),
                b'{"type":"FeatureCollection","features":[]}',
            )

        transport.assert_called_once_with(build_land_context.SOURCE_URL, timeout=60)

    def test_build_land_context_filters_and_shifts_features(self):
        source = {
            "type": "FeatureCollection",
            "features": [
                {
                    "type": "Feature",
                    "properties": {"featurecla": "Land"},
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [
                            [[-171, -15], [-170, -15], [-170, -14], [-171, -14], [-171, -15]]
                        ],
                    },
                },
                {
                    "type": "Feature",
                    "properties": {"featurecla": "Land"},
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[[120, -35], [250, -35], [250, 25], [120, 25], [120, -35]]],
                    },
                },
                {
                    "type": "Feature",
                    "properties": {"featurecla": "Land"},
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[[10, 40], [11, 40], [11, 41], [10, 41], [10, 40]]],
                    },
                },
            ],
        }

        with tempfile.TemporaryDirectory() as tmp:
            source_path = Path(tmp) / "source.geojson"
            output_path = Path(tmp) / "pacific_land_context.geojson"
            provenance_path = Path(tmp) / "land_context_summary.json"
            source_path.write_text(json.dumps(source), encoding="utf-8")

            summary = build_land_context.build_land_context(
                source_path=source_path,
                output_path=output_path,
                public_output_path=None,
                provenance_path=provenance_path,
            )

            output = json.loads(output_path.read_text(encoding="utf-8"))
            provenance = json.loads(provenance_path.read_text(encoding="utf-8"))

        self.assertEqual(summary["features_written"], 1)
        self.assertEqual(output["features"][0]["geometry"]["coordinates"][0][0][0], 189)
        self.assertEqual(
            output["features"][0]["properties"]["geometry_role"],
            "island_or_regional_land_context",
        )
        self.assertEqual(output["geometry_policy"], "natural_earth_visual_land_context")
        self.assertEqual(provenance["features_written"], 1)
        self.assertEqual(provenance["score_input_role"], "visual_context_only_not_score_input")


if __name__ == "__main__":
    unittest.main()
