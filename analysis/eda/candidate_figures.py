"""Static research figures for TASK-067 candidate story discovery."""

from __future__ import annotations

from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt  # noqa: E402
import numpy as np  # noqa: E402
import pandas as pd  # noqa: E402
from matplotlib.colors import LinearSegmentedColormap  # noqa: E402
from matplotlib.patches import FancyBboxPatch  # noqa: E402

from analysis.eda.candidate_datasets import (  # noqa: E402
    CANDIDATE_SLUGS,
    CANDIDATE_SPECS,
    LAND_SLUG,
    LOSS_SLUG,
    POPULATION_SLUG,
    RENEWABLE_SLUG,
    WATER_SLUG,
    build_candidate_coverage,
    first_latest_changes,
    latest_candidate_snapshot,
    normalize_direct_loss_units,
    select_candidate_observations,
)

FIGURE_FILENAMES = (
    "eda_candidate_coverage_alignment.png",
    "eda_candidate_distributions.png",
    "eda_candidate_trends.png",
    "eda_candidate_named_place_contrasts.png",
    "eda_candidate_reporting_visibility.png",
    "eda_candidate_story_auditions.png",
)

PAPER = "#f3efe5"
INK = "#172c33"
MUTED = "#64767a"
GRID = "#c8cec8"
TEAL = "#177f78"
SEA = "#54a8a1"
CORAL = "#d4644d"
GOLD = "#c6922f"
BLUE = "#426b8a"
PALE = "#dfe5df"
SOURCE_LINE = "Source: Pacific Data Hub official SDMX rows, processed in TASK-066."


def render_candidate_research_atlas(
    observations: pd.DataFrame,
    geography_context: pd.DataFrame,
    story_signals: pd.DataFrame,
    output_dir: Path,
) -> dict[str, Path]:
    """Render the five-figure research atlas and separate audition contact sheet."""

    output_dir.mkdir(parents=True, exist_ok=True)
    names = _geography_names(geography_context)
    figures = {
        FIGURE_FILENAMES[0]: _coverage_alignment(observations),
        FIGURE_FILENAMES[1]: _distributions(observations),
        FIGURE_FILENAMES[2]: _trends(observations),
        FIGURE_FILENAMES[3]: _named_place_contrasts(observations, names),
        FIGURE_FILENAMES[4]: _reporting_visibility(observations, geography_context),
        FIGURE_FILENAMES[5]: _story_auditions(observations, story_signals),
    }
    paths: dict[str, Path] = {}
    for file_name, figure in figures.items():
        path = output_dir / file_name
        figure.savefig(path, dpi=180, facecolor=PAPER, bbox_inches="tight")
        plt.close(figure)
        paths[file_name] = path
    return paths


def _coverage_alignment(observations: pd.DataFrame) -> plt.Figure:
    coverage = build_candidate_coverage(observations)
    figure, axes = plt.subplots(
        1,
        2,
        figsize=(14, 7.6),
        gridspec_kw={"width_ratios": [1.65, 1]},
    )
    _style_figure(figure)
    figure.suptitle(
        "Five new lenses. Five different clocks.",
        x=0.06,
        y=0.965,
        ha="left",
        fontsize=24,
        color=INK,
        fontweight="bold",
    )
    figure.text(
        0.06,
        0.91,
        "Coverage and time alignment come before comparison.",
        fontsize=12,
        color=MUTED,
    )

    timeline, coverage_axis = axes
    y_positions = np.arange(len(coverage))[::-1]
    for y, row in zip(y_positions, coverage.itertuples(index=False), strict=True):
        color = CORAL if row.dataset_slug == LOSS_SLUG else TEAL
        timeline.plot(
            [row.year_start, row.year_end], [y, y], color=color, linewidth=7, solid_capstyle="round"
        )
        timeline.scatter(
            [row.year_start, row.year_end],
            [y, y],
            s=36,
            color=PAPER,
            edgecolor=color,
            linewidth=2,
            zorder=3,
        )
        timeline.text(
            row.year_start, y + 0.22, str(row.year_start), ha="center", fontsize=8, color=MUTED
        )
        timeline.text(
            row.year_end, y + 0.22, str(row.year_end), ha="center", fontsize=8, color=MUTED
        )
    timeline.set_yticks(y_positions, coverage["short_label"])
    timeline.set_xlim(1988, 2027)
    timeline.set_xlabel("Returned observation years", color=MUTED)
    timeline.set_title("Time span", loc="left", color=INK, fontsize=13, fontweight="bold")
    _style_axis(timeline)

    colors = [CORAL if slug == LOSS_SLUG else SEA for slug in coverage["dataset_slug"]]
    coverage_axis.barh(y_positions, coverage["geography_coverage_pct"], color=colors, height=0.52)
    coverage_axis.scatter(
        coverage["geography_year_coverage_pct"],
        y_positions,
        s=46,
        color=INK,
        zorder=3,
        label="geography-year coverage",
    )
    for y, row in zip(y_positions, coverage.itertuples(index=False), strict=True):
        coverage_axis.text(
            104,
            y,
            f"{row.geography_count}/22",
            va="center",
            fontsize=9,
            color=INK,
        )
    coverage_axis.set_xlim(0, 112)
    coverage_axis.set_yticks([])
    coverage_axis.set_xlabel("Coverage (%)", color=MUTED)
    coverage_axis.set_title(
        "Places / possible place-years", loc="left", color=INK, fontsize=13, fontweight="bold"
    )
    _style_axis(coverage_axis)
    figure.text(
        0.06,
        0.035,
        f"{SOURCE_LINE}  Bars = geography coverage; dots = returned geography-year coverage.\n"
        "Missing geography-years are not zero values. Direct loss is a sparse reporting "
        "record, not a continuous series.",
        fontsize=8.7,
        color=MUTED,
    )
    figure.subplots_adjust(left=0.22, right=0.96, top=0.84, bottom=0.15, wspace=0.3)
    return figure


def _distributions(observations: pd.DataFrame) -> plt.Figure:
    latest = latest_candidate_snapshot(observations)
    figure, axes = plt.subplots(len(CANDIDATE_SLUGS), 1, figsize=(14, 10), sharey=False)
    _style_figure(figure)
    figure.suptitle(
        "The latest values do not share a scale—or a meaning.",
        x=0.06,
        y=0.975,
        ha="left",
        fontsize=23,
        color=INK,
        fontweight="bold",
    )
    figure.text(
        0.06,
        0.935,
        "Each strip is a separate within-indicator distribution; none is a score component.",
        fontsize=11.5,
        color=MUTED,
    )
    for axis, slug in zip(axes, CANDIDATE_SLUGS, strict=True):
        group = latest[latest["dataset_slug"].eq(slug)].sort_values("comparison_value")
        values = group["comparison_value"].astype(float).to_numpy()
        jitter = np.linspace(-0.15, 0.15, len(group))
        color = CORAL if slug == LOSS_SLUG else TEAL
        axis.scatter(values, jitter, s=42, color=color, edgecolor=PAPER, linewidth=0.8, zorder=3)
        axis.axvline(float(np.median(values)), color=INK, linewidth=1.3, linestyle="--")
        low = group.iloc[0]
        high = group.iloc[-1]
        axis.annotate(
            str(low["geo_code"]),
            (low["comparison_value"], -0.15),
            xytext=(0, -14),
            textcoords="offset points",
            ha="center",
            fontsize=8,
            color=INK,
        )
        axis.annotate(
            str(high["geo_code"]),
            (high["comparison_value"], 0.15),
            xytext=(0, 8),
            textcoords="offset points",
            ha="center",
            fontsize=8,
            color=INK,
        )
        if slug == LOSS_SLUG:
            axis.set_xscale("log")
            unit_label = "recorded USD (log scale; latest returned year varies)"
        else:
            year_min, year_max = int(group["year"].min()), int(group["year"].max())
            year_label = str(year_min) if year_min == year_max else f"{year_min}-{year_max}"
            unit_label = f"{group['comparison_unit'].iloc[0]} · latest {year_label}"
        axis.set_title(
            CANDIDATE_SPECS[slug]["short_label"],
            loc="left",
            fontsize=11.5,
            color=INK,
            fontweight="bold",
        )
        axis.set_xlabel(unit_label, fontsize=8.8, color=MUTED)
        axis.set_yticks([])
        axis.set_ylim(-0.35, 0.35)
        _style_axis(axis)
    figure.text(
        0.06,
        0.02,
        f"{SOURCE_LINE}  Dashed line = median; endpoint labels identify observed minima/maxima.\n"
        "Population rows are a published projection/estimated series, not realized change. "
        "Loss units are converted only where the source explicitly says USD_MILLIONS; "
        "no population or GDP normalization is available.",
        fontsize=8.7,
        color=MUTED,
    )
    figure.subplots_adjust(left=0.08, right=0.96, top=0.89, bottom=0.11, hspace=0.9)
    return figure


def _trends(observations: pd.DataFrame) -> plt.Figure:
    candidates = select_candidate_observations(observations)
    panels = [
        (POPULATION_SLUG, ["CK", "MH", "TK"], [-8, 0, 8]),
        (RENEWABLE_SLUG, ["PG", "WS", "TV"], [-8, 0, 8]),
        (WATER_SLUG, ["PG", "SB", "TV"], [-8, 0, 8]),
        (LAND_SLUG, ["VU", "SB", "WS"], [-10, 8, -12]),
    ]
    highlight_colors = [CORAL, TEAL, GOLD]
    figure, axes = plt.subplots(2, 2, figsize=(14, 9))
    _style_figure(figure)
    figure.suptitle(
        "Trajectories refuse a single direction.",
        x=0.06,
        y=0.965,
        ha="left",
        fontsize=24,
        color=INK,
        fontweight="bold",
    )
    figure.text(
        0.06,
        0.92,
        "Every thin line is a geography. Named lines are contrasts, not winners.",
        fontsize=11.5,
        color=MUTED,
    )
    for axis, (slug, highlights, label_offsets) in zip(axes.flat, panels, strict=True):
        group = candidates[candidates["dataset_slug"].eq(slug)]
        for _, geography in group.groupby("geo_code", sort=True):
            axis.plot(geography["year"], geography["value"], color=MUTED, alpha=0.18, linewidth=0.8)
        for label_offset, color, code in zip(
            label_offsets, highlight_colors, highlights, strict=True
        ):
            geography = group[group["geo_code"].eq(code)].sort_values("year")
            axis.plot(geography["year"], geography["value"], color=color, linewidth=2.2)
            if not geography.empty:
                last = geography.iloc[-1]
                axis.annotate(
                    code,
                    (last["year"], last["value"]),
                    xytext=(4, label_offset),
                    textcoords="offset points",
                    va="center",
                    fontsize=8.5,
                    color=color,
                    fontweight="bold",
                )
        axis.set_title(
            CANDIDATE_SPECS[slug]["short_label"],
            loc="left",
            color=INK,
            fontsize=12,
            fontweight="bold",
        )
        axis.set_ylabel("published value (%)", fontsize=8.5, color=MUTED)
        _style_axis(axis)
    figure.text(
        0.06,
        0.025,
        f"{SOURCE_LINE}  Annual source values; no smoothing or imputation.\n"
        "Population is a published projection/estimated growth rate; renewable and water are "
        "shares; land cover is a published index whose direction still needs source review.",
        fontsize=8.7,
        color=MUTED,
    )
    figure.subplots_adjust(left=0.08, right=0.95, top=0.86, bottom=0.12, hspace=0.36, wspace=0.22)
    return figure


def _named_place_contrasts(observations: pd.DataFrame, names: dict[str, str]) -> plt.Figure:
    latest = latest_candidate_snapshot(observations)
    slugs = [POPULATION_SLUG, RENEWABLE_SLUG, WATER_SLUG, LAND_SLUG]
    codes = ["PG", "WS", "SB", "TV", "NR", "FJ"]
    pivot = latest[latest["dataset_slug"].isin(slugs)].pivot(
        index="geo_code", columns="dataset_slug", values="value"
    )
    years = latest[latest["dataset_slug"].isin(slugs)].pivot(
        index="geo_code", columns="dataset_slug", values="year"
    )
    ranks = pivot.rank(pct=True) * 100
    matrix = ranks.reindex(index=codes, columns=slugs).to_numpy(dtype=float)
    cmap = LinearSegmentedColormap.from_list("pacific_rank", ["#d7e7e2", "#f2d89d", CORAL])
    figure, axis = plt.subplots(figsize=(14, 8))
    _style_figure(figure)
    image = axis.imshow(matrix, vmin=0, vmax=100, cmap=cmap, aspect="auto")
    aligned_values = pivot.reindex(index=codes, columns=slugs)
    aligned_years = years.reindex(index=codes, columns=slugs)
    for row_index in range(len(codes)):
        for column_index in range(len(slugs)):
            value = aligned_values.iloc[row_index, column_index]
            year = aligned_years.iloc[row_index, column_index]
            label = "no row" if pd.isna(value) else f"{value:.1f}\n{int(year)}"
            axis.text(
                column_index, row_index, label, ha="center", va="center", fontsize=9, color=INK
            )
    axis.set_xticks(
        np.arange(len(slugs)),
        [
            "Projected population\ngrowth",
            "Renewable\nshare",
            "Safe water\nshare",
            "Land-cover\nindex",
        ],
    )
    axis.set_yticks(
        np.arange(len(codes)),
        [f"{names.get(code, code)}  ·  {code}" for code in codes],
    )
    axis.tick_params(axis="both", length=0, labelcolor=INK, labelsize=10)
    axis.set_title(
        "Six places. No single profile.",
        loc="left",
        pad=28,
        fontsize=24,
        color=INK,
        fontweight="bold",
    )
    axis.text(
        0,
        1.04,
        "Color shows position within each indicator only. Cell text keeps the raw value "
        "and latest year visible.",
        transform=axis.transAxes,
        fontsize=11,
        color=MUTED,
    )
    colorbar = figure.colorbar(image, ax=axis, fraction=0.025, pad=0.03)
    colorbar.set_label("within-indicator percentile (not a score)", color=MUTED, fontsize=9)
    colorbar.outline.set_visible(False)
    figure.text(
        0.11,
        0.035,
        f"{SOURCE_LINE}  Population is a published projection/estimated rate; other percent "
        "values retain different denominators and meanings; land cover is an index.\n"
        "The cells are not summed, averaged, or interpreted as better/worse across columns.",
        fontsize=8.7,
        color=MUTED,
    )
    figure.subplots_adjust(left=0.25, right=0.91, top=0.82, bottom=0.16)
    return figure


def _reporting_visibility(
    observations: pd.DataFrame, geography_context: pd.DataFrame
) -> plt.Figure:
    candidates = select_candidate_observations(observations)
    loss = normalize_direct_loss_units(candidates[candidates["dataset_slug"].eq(LOSS_SLUG)])
    years = list(range(int(loss["year"].min()), int(loss["year"].max()) + 1))
    context = geography_context[["geo_code", "geography_name"]].drop_duplicates("geo_code").copy()
    context["has_record"] = context["geo_code"].isin(loss["geo_code"])
    context = context.sort_values(
        ["has_record", "geography_name"], ascending=[False, True], kind="mergesort"
    )
    codes = context["geo_code"].tolist()
    names = dict(zip(context["geo_code"], context["geography_name"], strict=True))
    matrix = np.full((len(codes), len(years)), np.nan)
    for row in loss.itertuples(index=False):
        matrix[codes.index(row.geo_code), years.index(int(row.year))] = np.log10(
            row.comparison_value
        )

    figure, (count_axis, raster_axis) = plt.subplots(
        2,
        1,
        figsize=(14, 10),
        gridspec_kw={"height_ratios": [1, 4.8], "hspace": 0.08},
    )
    _style_figure(figure)
    counts = loss.groupby("year").size().reindex(years, fill_value=0)
    count_axis.bar(years, counts, color=CORAL, width=0.7)
    count_axis.set_ylabel("rows", color=MUTED, fontsize=9)
    count_axis.set_xticks([])
    count_axis.set_title(
        "Blank cells are not zero-loss years.",
        loc="left",
        fontsize=24,
        color=INK,
        fontweight="bold",
        pad=18,
    )
    count_axis.text(
        0,
        1.02,
        "Only 39 recorded geography-years appear across a 14-year window.",
        transform=count_axis.transAxes,
        fontsize=11,
        color=MUTED,
    )
    _style_axis(count_axis)

    cmap = plt.get_cmap("YlOrRd").copy()
    cmap.set_bad(PALE)
    image = raster_axis.imshow(matrix, aspect="auto", cmap=cmap)
    raster_axis.set_xticks(np.arange(len(years)), years, rotation=45, ha="right")
    raster_axis.set_yticks(
        np.arange(len(codes)),
        [f"{names.get(code, code)} · {code}" for code in codes],
    )
    raster_axis.tick_params(axis="both", length=0, labelsize=8.5, colors=INK)
    raster_axis.set_xlabel("Returned event-year records", color=MUTED)
    colorbar = figure.colorbar(image, ax=raster_axis, fraction=0.025, pad=0.02)
    colorbar.set_label("recorded loss (log₁₀ USD)", color=MUTED, fontsize=9)
    colorbar.outline.set_visible(False)
    figure.text(
        0.17,
        0.02,
        f"{SOURCE_LINE}  USD_MILLIONS is converted to USD; no per-capita or GDP "
        "denominator is available.\n"
        "A blank cell means no returned record. It does not establish that no disaster "
        "or no loss occurred.",
        fontsize=8.7,
        color=MUTED,
    )
    figure.subplots_adjust(left=0.2, right=0.94, top=0.88, bottom=0.12)
    return figure


def _story_auditions(observations: pd.DataFrame, signals: pd.DataFrame) -> plt.Figure:
    coverage = build_candidate_coverage(observations)
    coverage_by_slug = coverage.set_index("dataset_slug")
    loss_coverage = coverage_by_slug.loc[LOSS_SLUG]
    candidates = select_candidate_observations(observations)
    changes = first_latest_changes(candidates).set_index(["dataset_slug", "geo_code"])
    latest = latest_candidate_snapshot(candidates)
    signal_map = signals.set_index("signal_id")
    figure = plt.figure(figsize=(16, 9), facecolor=PAPER)
    figure.text(
        0.04,
        0.94,
        "Three stories the evidence could tell",
        fontsize=25,
        color=INK,
        fontweight="bold",
    )
    figure.text(
        0.04,
        0.9,
        "Rough evidence boards—not final scenes, not a selected winner.",
        fontsize=11.5,
        color=MUTED,
    )
    panels = [
        (0.035, "A", "The Pacific has\ndifferent clocks", TEAL),
        (0.355, "B", "Progress moves in\ncross-currents", CORAL),
        (0.675, "C", "One rank hides\nfive profiles", GOLD),
    ]
    for left, letter, title, color in panels:
        box = FancyBboxPatch(
            (left, 0.12),
            0.29,
            0.72,
            boxstyle="round,pad=0.012,rounding_size=0.012",
            transform=figure.transFigure,
            facecolor="#fbf8f0",
            edgecolor=color,
            linewidth=1.8,
            zorder=-10,
        )
        figure.patches.append(box)
        figure.text(
            left + 0.02,
            0.79,
            letter,
            fontsize=11,
            color=PAPER,
            fontweight="bold",
            bbox={"boxstyle": "circle,pad=0.4", "facecolor": color, "edgecolor": "none"},
        )
        figure.text(
            left + 0.02, 0.69, title, fontsize=18, color=INK, fontweight="bold", linespacing=1.05
        )

    # Audition A: coverage clocks.
    left = panels[0][0]
    mini = figure.add_axes([left + 0.03, 0.46, 0.24, 0.15], facecolor="#fbf8f0")
    for index, row in enumerate(coverage.itertuples(index=False)):
        mini.plot(
            [row.year_start, row.year_end],
            [index, index],
            color=CORAL if row.dataset_slug == LOSS_SLUG else TEAL,
            linewidth=4,
            solid_capstyle="round",
        )
    mini.set_xlim(1988, 2027)
    mini.set_yticks(
        np.arange(len(coverage)),
        ["pop proj.", "energy", "water", "loss", "land"],
        fontsize=6,
    )
    mini.set_xticks([1990, 2000, 2010, 2020], ["1990", "2000", "2010", "2020"], fontsize=7)
    mini.set_xlabel("returned year span · 22-place frame", fontsize=6.5, color=MUTED)
    _style_axis(mini)
    figure.text(left + 0.02, 0.38, "CLAIM CHAIN", fontsize=8, color=TEAL, fontweight="bold")
    figure.text(
        left + 0.02,
        0.29,
        "Different time windows\n→ uneven reporting\n→ visibility becomes the story",
        fontsize=11,
        color=INK,
        linespacing=1.35,
    )
    figure.text(
        left + 0.02,
        0.2,
        (
            "Anchor: direct loss covers "
            f"{loss_coverage['geography_year_coverage_pct']:.1f}%\n"
            "of possible geography-years "
            f"({int(loss_coverage['geography_count'])} places; "
            f"{int(loss_coverage['observed_geography_years'])}/"
            f"{int(loss_coverage['possible_geography_years'])})."
        ),
        fontsize=9,
        color=MUTED,
    )
    figure.text(
        left + 0.02,
        0.145,
        "Risk: a metadata story may feel distant\nfrom lived conditions.",
        fontsize=8.5,
        color=CORAL,
    )

    # Audition B: separate percentage-point changes.
    left = panels[1][0]
    change_values = [
        float(changes.loc[(WATER_SLUG, "PG"), "change"]),
        float(changes.loc[(WATER_SLUG, "WS"), "change"]),
        float(changes.loc[(RENEWABLE_SLUG, "PG"), "change"]),
        float(changes.loc[(RENEWABLE_SLUG, "WS"), "change"]),
    ]
    change_rows = changes.loc[
        [(WATER_SLUG, "PG"), (WATER_SLUG, "WS"), (RENEWABLE_SLUG, "PG"), (RENEWABLE_SLUG, "WS")]
    ]
    mini = figure.add_axes([left + 0.02, 0.46, 0.25, 0.15], facecolor="#fbf8f0")
    mini.axhline(0, color=GRID, linewidth=1)
    water_bars = mini.bar([0, 1], change_values[:2], width=0.32, color=TEAL, label="water")
    renewable_bars = mini.bar(
        [0.34, 1.34], change_values[2:], width=0.32, color=CORAL, label="renewable"
    )
    mini.bar_label(water_bars, fmt="%+.1f", fontsize=6, padding=2)
    mini.bar_label(renewable_bars, fmt="%+.1f", fontsize=6, padding=2)
    mini.set_xticks([0.17, 1.17], ["PG", "WS"], fontsize=8)
    mini.set_ylabel("percentage-point change", fontsize=7, color=MUTED)
    mini.set_xlabel(
        f"{int(change_rows['first_year'].min())}–{int(change_rows['latest_year'].max())} · "
        "PG + WS · separate % shares",
        fontsize=6.5,
        color=MUTED,
    )
    mini.legend(frameon=False, fontsize=7, ncol=2, loc="lower left")
    _style_axis(mini)
    figure.text(left + 0.02, 0.38, "CLAIM CHAIN", fontsize=8, color=CORAL, fontweight="bold")
    figure.text(
        left + 0.02,
        0.29,
        "Water access can rise\nwhile renewable share falls\n→ progress has cross-currents",
        fontsize=11,
        color=INK,
        linespacing=1.35,
    )
    figure.text(
        left + 0.02,
        0.2,
        signal_map.loc["service_and_energy_move_in_different_directions", "named_geographies"],
        fontsize=8.4,
        color=MUTED,
        wrap=True,
    )
    figure.text(
        left + 0.02,
        0.145,
        "Risk: descriptive movement cannot be\nturned into climate or policy causality.",
        fontsize=8.5,
        color=CORAL,
    )

    # Audition C: mini rank profile, explicitly not summed.
    left = panels[2][0]
    slugs = [POPULATION_SLUG, RENEWABLE_SLUG, WATER_SLUG, LAND_SLUG]
    codes = ["PG", "WS", "SB", "TV"]
    pivot = latest[latest["dataset_slug"].isin(slugs)].pivot(
        index="geo_code", columns="dataset_slug", values="value"
    )
    matrix = (pivot.rank(pct=True) * 100).reindex(index=codes, columns=slugs).to_numpy(dtype=float)
    mini = figure.add_axes([left + 0.02, 0.46, 0.25, 0.15], facecolor="#fbf8f0")
    mini.imshow(
        matrix,
        vmin=0,
        vmax=100,
        cmap=LinearSegmentedColormap.from_list("audition_rank", ["#d7e7e2", "#f2d89d", CORAL]),
        aspect="auto",
    )
    mini.set_yticks(np.arange(len(codes)), codes, fontsize=8)
    mini.set_xticks(np.arange(4), ["pop proj.", "energy", "water", "land"], fontsize=7, rotation=25)
    overlap = pivot[[WATER_SLUG, RENEWABLE_SLUG]].dropna()
    latest_for_matrix = latest[latest["dataset_slug"].isin(slugs)]
    mini.set_xlabel(
        f"latest {int(latest_for_matrix['year'].min())}–{int(latest_for_matrix['year'].max())} "
        "· within-indicator ranks",
        fontsize=6.5,
        color=MUTED,
    )
    mini.tick_params(length=0)
    figure.text(left + 0.02, 0.38, "CLAIM CHAIN", fontsize=8, color=GOLD, fontweight="bold")
    figure.text(
        left + 0.02,
        0.29,
        "No place stays high or low\nacross every measure\n→ profiles replace the ladder",
        fontsize=11,
        color=INK,
        linespacing=1.35,
    )
    figure.text(
        left + 0.02,
        0.2,
        (
            "Water ↔ renewable latest-rank\ncorrelation: "
            f"{overlap.rank().corr().iloc[0, 1]:.2f} (n={len(overlap)} overlapping places)."
        ),
        fontsize=9,
        color=MUTED,
    )
    figure.text(
        left + 0.02,
        0.145,
        "Risk: the matrix must never look like\na new composite score.",
        fontsize=8.5,
        color=CORAL,
    )

    figure.text(
        0.04,
        0.055,
        f"{SOURCE_LINE}  Each board keeps units, years, missingness, and causal limits "
        "visible.  TASK-068 selects, merges, or rejects them.",
        fontsize=9,
        color=MUTED,
    )
    return figure


def _geography_names(context: pd.DataFrame) -> dict[str, str]:
    return dict(
        zip(
            context["geo_code"].astype(str),
            context["geography_name"].astype(str),
            strict=True,
        )
    )


def _style_figure(figure: plt.Figure) -> None:
    figure.patch.set_facecolor(PAPER)
    for axis in figure.axes:
        axis.set_facecolor(PAPER)


def _style_axis(axis: plt.Axes) -> None:
    axis.set_facecolor(PAPER)
    axis.spines[["top", "right", "left"]].set_visible(False)
    axis.spines["bottom"].set_color(GRID)
    axis.grid(axis="x", color=GRID, alpha=0.5, linewidth=0.6)
    axis.tick_params(colors=MUTED, labelsize=8.5, length=0)
