"""Table-driven static regional research figures for TASK-068."""

from __future__ import annotations

import re
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt  # noqa: E402
import numpy as np  # noqa: E402
import pandas as pd  # noqa: E402
from matplotlib.collections import PatchCollection  # noqa: E402
from matplotlib.colors import LinearSegmentedColormap  # noqa: E402
from matplotlib.patches import Polygon  # noqa: E402

from analysis.eda.candidate_datasets import (  # noqa: E402
    LOSS_SLUG,
    RENEWABLE_SLUG,
    WATER_SLUG,
)
from analysis.eda.regional_patterns import MONITORING_SLUG  # noqa: E402

FIGURE_FILENAMES = (
    "eda_regional_distributions.png",
    "eda_regional_crosscurrents.png",
    "eda_regional_condition_heatmap.png",
    "eda_regional_visibility_heatmap.png",
    "eda_regional_relationships.png",
    "eda_regional_maps.png",
)

PAPER = "#f3efe5"
INK = "#172c33"
MUTED = "#64767a"
GRID = "#c8cec8"
TEAL = "#177f78"
SEA = "#54a8a1"
CORAL = "#d4644d"
GOLD = "#c6922f"
PALE = "#dfe5df"
SOURCE_LINE = (
    "Source: Pacific Data Hub official SDMX rows; TASK-003 derived index where stated."
)
CROSSCURRENT_LABEL_OFFSETS = {
    "CK": (-18, 12),
    "PW": (8, 10),
    "TO": (8, -12),
    "WF": (-18, -10),
}


def render_regional_research_atlas(
    tables: dict[str, pd.DataFrame],
    geographies: dict[str, object] | list[dict[str, object]],
    land_context: dict[str, object],
    output_dir: Path,
) -> dict[str, Path]:
    """Render the six regional plates from reviewed tables and map geometry."""

    required = {
        "eda_regional_feature_matrix.csv",
        "eda_regional_distribution_summary.csv",
        "eda_regional_crosscurrents.csv",
        "eda_regional_pairwise_relationships.csv",
    }
    missing = required.difference(tables)
    if missing:
        raise ValueError(f"Regional figure tables are missing: {sorted(missing)}")
    matrix = tables["eda_regional_feature_matrix.csv"]
    figures = {
        FIGURE_FILENAMES[0]: _distributions(
            tables["eda_regional_distribution_summary.csv"]
        ),
        FIGURE_FILENAMES[1]: _crosscurrents(
            tables["eda_regional_crosscurrents.csv"]
        ),
        FIGURE_FILENAMES[2]: _heatmap(matrix, "measured_condition"),
        FIGURE_FILENAMES[3]: _heatmap(matrix, "evidence_visibility"),
        FIGURE_FILENAMES[4]: _relationships(
            tables["eda_regional_pairwise_relationships.csv"]
        ),
        FIGURE_FILENAMES[5]: _maps(matrix, geographies, land_context),
    }
    output_dir.mkdir(parents=True, exist_ok=True)
    paths = {}
    for filename, figure in figures.items():
        path = output_dir / filename
        figure.savefig(
            path,
            dpi=180,
            facecolor=PAPER,
            bbox_inches="tight",
            metadata={"Software": "Matplotlib"},
        )
        plt.close(figure)
        paths[filename] = path
    return paths


def _distributions(summary: pd.DataFrame) -> plt.Figure:
    rows = summary.sort_values("feature_order", kind="mergesort").reset_index(drop=True)
    geography_count = int(rows["total_geography_count"].max())
    figure, axis = plt.subplots(figsize=(16, 11))
    _style_figure(figure)
    _header(
        figure,
        f"How do latest measured conditions vary across the {geography_count} Pacific geographies?",
        "Independent within-indicator raw distributions; latest years and n are shown per row.",
    )
    for position, row in rows.iterrows():
        low = float(row["minimum"])
        high = float(row["maximum"])
        span = high - low
        y = len(rows) - position - 1
        axis.plot([0, 1], [y, y], color=GRID, linewidth=2)
        axis.plot(
            [_range_position(row["p25"], low, span), _range_position(row["p75"], low, span)],
            [y, y],
            color=SEA,
            linewidth=8,
            solid_capstyle="round",
        )
        axis.scatter(
            _range_position(row["median"], low, span), y, s=45, color=INK, zorder=3
        )
        axis.text(
            1.02,
            y,
            (
                f"{_fmt(low)} | {_fmt(row['median'])} | {_fmt(high)} {row['unit']}  "
                f"n={int(row['geography_count'])}; {int(row['latest_year_min'])}–"
                f"{int(row['latest_year_max'])}"
            ),
            va="center",
            fontsize=8,
            color=MUTED,
        )
    axis.set_yticks(
        np.arange(len(rows)),
        [_short_label(value) for value in rows["feature_label"].tolist()[::-1]],
    )
    axis.set_xlim(-0.02, 1.72)
    axis.set_xlabel(
        "Within-row position from raw minimum to maximum (labels = min | median | max)",
        color=MUTED,
    )
    axis.set_xticks([0, 0.5, 1], ["raw min", "mid-range", "raw max"])
    _style_axis(axis, grid_axis="x")
    _footer(
        figure,
        "Each row has its own unit and scale; land-cover direction is withheld and proxy fields "
        "do not establish preparedness/readiness.",
    )
    figure.subplots_adjust(left=0.28, right=0.96, top=0.88, bottom=0.10)
    return figure


def _crosscurrents(crosscurrents: pd.DataFrame) -> plt.Figure:
    complete = crosscurrents[crosscurrents["complete_overlap"]].copy()
    figure, axis = plt.subplots(figsize=(14, 9))
    _style_figure(figure)
    _header(
        figure,
        "How do water-service and renewable-energy shares move across the complete overlap?",
        f"First-to-latest percentage-point change; {len(complete)} overlapping places; "
        "endpoint years vary.",
    )
    colors = {
        "both_up": TEAL,
        "water_up_renewable_down": GOLD,
        "water_down_renewable_up": SEA,
        "both_down": CORAL,
        "flat_axis": MUTED,
    }
    for quadrant, group in complete.groupby("quadrant", sort=True):
        axis.scatter(
            group["water_change_percentage_points"],
            group["renewable_change_percentage_points"],
            s=72,
            color=colors[quadrant],
            edgecolor=PAPER,
            linewidth=1,
            label=f"{quadrant.replace('_', ' ')} (n={len(group)})",
            zorder=3,
        )
    for row in complete.itertuples(index=False):
        offset = CROSSCURRENT_LABEL_OFFSETS.get(row.geo_code, (4, 4))
        axis.annotate(
            row.geo_code,
            (row.water_change_percentage_points, row.renewable_change_percentage_points),
            xytext=offset,
            textcoords="offset points",
            ha="right" if offset[0] < 0 else "left",
            fontsize=7.5,
            color=INK,
        )
    axis.axhline(0, color=INK, linewidth=1)
    axis.axvline(0, color=INK, linewidth=1)
    axis.set_xlabel("Safely managed drinking-water change (percentage points)", color=MUTED)
    axis.set_ylabel("Renewable-energy share change (percentage points)", color=MUTED)
    axis.legend(frameon=False, loc="lower left", fontsize=8, ncol=2)
    _style_axis(axis, grid_axis="both")
    missing_codes = " ".join(
        crosscurrents.loc[~crosscurrents["complete_overlap"], "geo_code"].tolist()
    )
    _footer(
        figure,
        f"Descriptive, non-causal endpoint comparison; clocks differ. Missing overlap: "
        f"{missing_codes}. No regional progress score is formed.",
    )
    figure.subplots_adjust(left=0.10, right=0.96, top=0.87, bottom=0.13)
    return figure


def _heatmap(matrix: pd.DataFrame, lane: str) -> plt.Figure:
    rows = matrix[matrix["lane"].eq(lane)].copy()
    codes = (
        rows[["geo_code", "order_position"]]
        .drop_duplicates()
        .sort_values("order_position", kind="mergesort")["geo_code"]
        .tolist()
    )
    feature_order = (
        rows[["feature_id", "feature_label", "feature_order"]]
        .drop_duplicates()
        .sort_values("feature_order", kind="mergesort")
    )
    features = feature_order["feature_id"].tolist()
    values = rows.pivot(index="geo_code", columns="feature_id", values="display_value").reindex(
        index=codes, columns=features
    )
    names = rows.drop_duplicates("geo_code").set_index("geo_code")["geography_name"]
    figure, axis = plt.subplots(figsize=(16, 11))
    _style_figure(figure)
    condition = lane == "measured_condition"
    loss_years = _feature_year_range(rows, LOSS_SLUG)
    title = (
        "How do measured-condition profiles compare when missing cells remain unfilled?"
        if condition
        else "Where is official evidence visible—and where is it not returned?"
    )
    subtitle = (
        f"Within-indicator percentiles (0–100) for display/order only; {len(codes)} places; "
        "latest years vary."
        if condition
        else (
            f"Binary reporting presence (0/100); source-specific windows; direct loss "
            f"{loss_years}; ordered independently."
        )
    )
    _header(figure, title, subtitle)
    cmap = LinearSegmentedColormap.from_list("regional", [PAPER, SEA, TEAL])
    cmap.set_bad(PALE)
    image = axis.imshow(values.to_numpy(dtype=float), aspect="auto", vmin=0, vmax=100, cmap=cmap)
    axis.set_xticks(
        np.arange(len(features)),
        [_short_label(value) for value in feature_order["feature_label"]],
        rotation=55,
        ha="right",
    )
    axis.set_yticks(np.arange(len(codes)), [names[code] for code in codes])
    for row_index, column_index in np.argwhere(~np.isfinite(values.to_numpy(dtype=float))):
        axis.text(column_index, row_index, "×", ha="center", va="center", color=INK, fontsize=8)
    if not condition:
        for row_index, column_index in np.argwhere(values.to_numpy(dtype=float) == 0):
            axis.text(column_index, row_index, "×", ha="center", va="center", color=INK, fontsize=8)
    colorbar = figure.colorbar(image, ax=axis, fraction=0.025, pad=0.02)
    colorbar.set_label(
        "within-indicator percentile" if condition else "reporting presence (0 / 100)",
        color=MUTED,
    )
    axis.tick_params(colors=MUTED, labelsize=8, length=0)
    caveat = (
        "No condition value is imputed or averaged into a score; row order is exploratory "
        "seriation and does not define public groups."
        if condition
        else "Absence is a value only in this visibility lane; it is not evidence of no event, "
        "no infrastructure, or weak preparedness."
    )
    _footer(figure, caveat)
    figure.subplots_adjust(left=0.22, right=0.93, top=0.86, bottom=0.28)
    return figure


def _relationships(relationships: pd.DataFrame) -> plt.Figure:
    minimum_pairwise_n = int(relationships["minimum_pairwise_n"].max())
    variables = list(
        dict.fromkeys(
            relationships["variable_x"].tolist() + relationships["variable_y"].tolist()
        )
    )
    labels = {}
    for row in relationships.itertuples(index=False):
        labels[row.variable_x] = row.variable_x_label
        labels[row.variable_y] = row.variable_y_label
    size = len(variables)
    values = np.full((size, size), np.nan)
    annotations = np.full((size, size), "", dtype=object)
    np.fill_diagonal(values, 1)
    for index in range(size):
        annotations[index, index] = "same\nfield"
    positions = {variable: index for index, variable in enumerate(variables)}
    for row in relationships.itertuples(index=False):
        left = positions[row.variable_x]
        right = positions[row.variable_y]
        if pd.notna(row.spearman_rho):
            values[left, right] = values[right, left] = float(row.spearman_rho)
            marker = "†" if row.circularity_flag else ""
            text = f"{float(row.spearman_rho):+.2f}{marker}\nn={int(row.pairwise_n)}"
        else:
            text = f"withheld\nn={int(row.pairwise_n)}"
        annotations[left, right] = annotations[right, left] = text

    figure, axis = plt.subplots(figsize=(15, 12))
    _style_figure(figure)
    _header(
        figure,
        "Which regional relationships remain visible after overlap and dependency review?",
        "Spearman rho with pairwise n; latest-year bases vary by field; "
        f"cells with n<{minimum_pairwise_n} are withheld.",
    )
    cmap = LinearSegmentedColormap.from_list("relationships", [CORAL, PAPER, TEAL])
    cmap.set_bad(PALE)
    image = axis.imshow(values, vmin=-1, vmax=1, cmap=cmap)
    axis.set_xticks(
        np.arange(size),
        [_short_label(labels[value]) for value in variables],
        rotation=55,
        ha="right",
    )
    axis.set_yticks(np.arange(size), [_short_label(labels[value]) for value in variables])
    axis.tick_params(colors=MUTED, labelsize=8, length=0)
    for row_index in range(size):
        for column_index in range(size):
            axis.text(
                column_index,
                row_index,
                annotations[row_index, column_index],
                ha="center",
                va="center",
                fontsize=6.5,
                color=INK,
            )
    colorbar = figure.colorbar(image, ax=axis, fraction=0.025, pad=0.02)
    colorbar.set_label("Spearman rho", color=MUTED)
    _footer(
        figure,
        "† Direct or transitive derived-score dependency: do not interpret as independent "
        "confirmation. "
        "All relationships are descriptive and non-causal; see the reviewed table for years/units.",
    )
    figure.subplots_adjust(left=0.24, right=0.93, top=0.85, bottom=0.26)
    return figure


def _maps(
    matrix: pd.DataFrame,
    geographies: dict[str, object] | list[dict[str, object]],
    land_context: dict[str, object],
) -> plt.Figure:
    geography_rows = (
        geographies.get("geographies", []) if isinstance(geographies, dict) else geographies
    )
    centroids = {
        str(row["geo_code"]): (
            float(row["centroid"]["lon"]) % 360,
            float(row["centroid"]["lat"]),
        )
        for row in geography_rows
    }
    rings = _land_rings(land_context)
    loss_years = _feature_year_range(matrix, LOSS_SLUG)
    monitoring_year = int(
        pd.to_numeric(
            matrix.loc[matrix["feature_id"].eq(MONITORING_SLUG), "latest_year"],
            errors="coerce",
        ).max()
    )
    panels = (
        ("measured_condition", WATER_SLUG, "Safely managed water, latest", "%"),
        ("measured_condition", RENEWABLE_SLUG, "Renewable-energy share, latest", "%"),
        (
            "evidence_visibility",
            MONITORING_SLUG,
            f"Monitoring reporting presence (latest row to {monitoring_year})",
            "0 / 100",
        ),
        (
            "evidence_visibility",
            LOSS_SLUG,
            f"Direct-loss reporting presence ({loss_years})",
            "0 / 100",
        ),
    )
    figure, axes = plt.subplots(2, 2, figsize=(16, 10))
    _style_figure(figure)
    _header(
        figure,
        "How does geography change the view of measured conditions and evidence visibility?",
        f"{len(centroids)} equal-presence centroids; latest condition years vary; "
        f"direct-loss presence covers {loss_years}; no area weight.",
    )
    cmap = LinearSegmentedColormap.from_list("maps", [PAPER, SEA, TEAL])
    for axis, (lane, feature_id, title, unit) in zip(axes.flat, panels, strict=True):
        _add_land(axis, rings)
        rows = matrix[matrix["lane"].eq(lane) & matrix["feature_id"].eq(feature_id)].set_index(
            "geo_code"
        )
        plotted = rows.reindex(centroids).copy()
        values = plotted["raw_value" if lane == "measured_condition" else "display_value"]
        finite = values.notna()
        codes = list(centroids)
        longitudes = np.asarray([centroids[code][0] for code in codes])
        latitudes = np.asarray([centroids[code][1] for code in codes])
        scatter = axis.scatter(
            longitudes[finite.to_numpy()],
            latitudes[finite.to_numpy()],
            c=values[finite],
            cmap=cmap,
            s=62,
            edgecolor=INK,
            linewidth=0.7,
            zorder=3,
        )
        if (~finite).any():
            axis.scatter(
                longitudes[(~finite).to_numpy()],
                latitudes[(~finite).to_numpy()],
                s=62,
                color=MUTED,
                marker="x",
                linewidth=1,
                zorder=3,
            )
        colorbar = figure.colorbar(scatter, ax=axis, fraction=0.025, pad=0.02)
        colorbar.set_label(unit, color=MUTED)
        axis.set_title(title, loc="left", color=INK, fontsize=11, fontweight="bold")
        axis.set_xlim(120, 250)
        axis.set_ylim(-36, 26)
        axis.set_aspect("equal", adjustable="box")
        axis.set_xticks([140, 180, 220], ["140°E", "180°", "140°W"])
        axis.set_yticks([-20, 0, 20], ["20°S", "0°", "20°N"])
        axis.tick_params(colors=MUTED, labelsize=7, length=0)
        axis.spines[:].set_visible(False)
    _footer(
        figure,
        "Centroids and Natural Earth land are orientation only—not reviewed boundaries, area, "
        "population weight, interpolation, preparedness, or causal geography.",
    )
    figure.subplots_adjust(left=0.05, right=0.96, top=0.86, bottom=0.10, hspace=0.16, wspace=0.12)
    return figure


def _land_rings(land_context: dict[str, object]) -> list[np.ndarray]:
    rings = []
    for feature in land_context.get("features", []):
        geometry = feature.get("geometry", {})
        coordinates = geometry.get("coordinates", [])
        polygons = [coordinates] if geometry.get("type") == "Polygon" else coordinates
        for polygon in polygons:
            if polygon:
                rings.append(np.asarray(polygon[0], dtype=float))
    return rings


def _feature_year_range(rows: pd.DataFrame, feature_id: str) -> str:
    time_bases = rows.loc[rows["feature_id"].eq(feature_id), "time_basis"].dropna()
    if time_bases.empty:
        return "years unavailable"
    match = re.search(r"\b(\d{4})-(\d{4})\b", str(time_bases.iloc[0]))
    return f"{match.group(1)}–{match.group(2)}" if match else str(time_bases.iloc[0])


def _add_land(axis: plt.Axes, rings: list[np.ndarray]) -> None:
    patches = [Polygon(ring, closed=True) for ring in rings]
    axis.add_collection(
        PatchCollection(
            patches,
            facecolor=PALE,
            edgecolor=GRID,
            linewidth=0.15,
            zorder=1,
        )
    )
    axis.set_facecolor(PAPER)


def _header(figure: plt.Figure, title: str, subtitle: str) -> None:
    figure.suptitle(
        title,
        x=0.05,
        y=0.975,
        ha="left",
        fontsize=20,
        color=INK,
        fontweight="bold",
    )
    figure.text(0.05, 0.93, subtitle, fontsize=10.5, color=MUTED)


def _footer(figure: plt.Figure, caveat: str) -> None:
    figure.text(0.05, 0.02, f"{SOURCE_LINE}\nPrimary caveat: {caveat}", fontsize=8, color=MUTED)


def _style_figure(figure: plt.Figure) -> None:
    figure.patch.set_facecolor(PAPER)
    for axis in figure.axes:
        axis.set_facecolor(PAPER)


def _style_axis(axis: plt.Axes, *, grid_axis: str) -> None:
    axis.set_facecolor(PAPER)
    axis.spines[["top", "right", "left"]].set_visible(False)
    axis.spines["bottom"].set_color(GRID)
    axis.grid(axis=grid_axis, color=GRID, alpha=0.45, linewidth=0.6)
    axis.tick_params(colors=MUTED, labelsize=8, length=0)


def _short_label(value: object) -> str:
    label = str(value)
    replacements = {
        "Mean sea surface temperature anomalies": "Sea-surface temp. anomaly",
        "Mean surface temperature anomalies": "Surface temp. anomaly",
        "Number of directly affected persons attributed to disasters": "Directly affected persons",
        (
            "Fisheries management measures in place and multilateral and bilateral "
            "fisheries management arrangements"
        ): "Fisheries management proxy",
        (
            "Proportion of population using safely managed drinking water services"
        ): "Safely managed water",
    }
    return replacements.get(label, label if len(label) <= 34 else f"{label[:31]}…")


def _fmt(value: object) -> str:
    number = float(value)
    return f"{number:,.1f}" if abs(number) < 1_000 else f"{number:,.0f}"


def _range_position(value: object, low: float, span: float) -> float:
    return 0.5 if span == 0 else (float(value) - low) / span
