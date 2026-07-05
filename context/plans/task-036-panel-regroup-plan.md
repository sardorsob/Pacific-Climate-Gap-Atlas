# TASK-036 Panel Regroup Plan

Owner-approved direction (2026-07-04): thematic regroup plus spoken-voice copy.
Fable drafts; Codex runs evidence QA; no commits by Fable.

## Approved Structure

Three reading groups replace seven equal-weight sections. Every caveat, count,
trace row, and hash stays visible; nothing moves behind an extra click.

1. **The score** (no header; the place name and story label lead)
   - score block, rank band chip, panel caveat rewritten in tour voice
   - at-a-glance strip with clearer cell labels (Rank band, Indicators)
2. **"The two sides of the score"**
   - pressure/capacity bars with the existing proxy caveat verbatim
   - strongest pressure/capacity signals beside them, with one added line
     explaining the parenthetical numbers as 0-100 percentile positions within
     the Pacific (sourced from the method drawer's score method)
3. **"What the record shows"**
   - monitoring status block unchanged (labels/caveats from encoding.ts)
   - indicator count and thin-evidence caution as visible text, not hidden
   - trace drawer summary carries the row count; note rewritten plainly

Empty state keeps the thesis line; the lede is rewritten in the tour's spoken
register. Compare/method actions unchanged.

## Guardrails

- No causal language for signals ("strongest signals", not drivers/causes).
- Monitoring caveat stays at surface level per the task edge-case rule.
- No changes to atlasData.ts, encoding.ts, or generated data.
- STORY_BRIEF.md untouched: panel field order lives in DESIGN_BRIEF.md, which
  gets a short regroup note instead.

## Verification

`npm --prefix app run test`, `npm --prefix app run build`, task-status
validation, secret scan, `git diff --check`, plus DOM smoke of the rendered
panel copy for NR (warn tone, reports 0) and FJ (ok tone) through the
data-quiet chips path, which works even when the WebGL canvas is starved.
No new unit tests: the change is presentational JSX and copy with no new logic
branches (existing tests already cover the data adapter and map model).
