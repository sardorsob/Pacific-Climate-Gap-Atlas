import type { CSSProperties } from "react";
import type { EvidenceMarkModel } from "./evidenceMarkModel";

type EvidenceMarkProps = {
  model: EvidenceMarkModel;
  size?: number;
  label?: string;
  decorative?: boolean;
  scoreFill?: string;
  className?: string;
  neutral?: boolean;
  dataCode?: string;
  x?: number;
  y?: number;
};

const VIEWBOX_SIZE = 44;

function edgeProps(edge: EvidenceMarkModel["reportingEdge"]): {
  className: string;
  dasharray?: string;
  linecap: "round" | "butt";
} {
  if (edge === "open-dash") {
    return { className: "evidence-mark__edge evidence-mark__edge--open-dash", dasharray: "11 9", linecap: "round" };
  }
  if (edge === "broken-dot") {
    return { className: "evidence-mark__edge evidence-mark__edge--broken-dot", dasharray: "1 5", linecap: "round" };
  }
  return { className: "evidence-mark__edge evidence-mark__edge--solid", linecap: "round" };
}

export function EvidenceMark({
  model,
  size = VIEWBOX_SIZE,
  label,
  decorative = false,
  scoreFill = "#e8895a",
  className = "",
  neutral = false,
  dataCode,
  x,
  y,
}: EvidenceMarkProps) {
  const ariaProps = decorative
    ? { "aria-hidden": true as const }
    : { role: "img" as const, "aria-label": label ?? "Evidence portrait" };

  if (neutral) {
    return (
      <svg
        {...ariaProps}
        className={`evidence-mark evidence-mark--neutral ${className}`.trim()}
        width={size}
        height={size}
        x={x}
        y={y}
        viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`}
        focusable="false"
        data-scoreless="true"
        data-code={dataCode}
        style={{ "--evidence-score": "var(--accent-2)" } as CSSProperties}
      >
        <circle className="evidence-mark__edge evidence-mark__edge--neutral" cx="22" cy="22" r="19" strokeLinecap="round" />
        <circle className="evidence-mark__field" cx="22" cy="22" r="10" fill="var(--accent-2)">
          <title>{label ?? "Stable geography identity"}</title>
        </circle>
        <g className="evidence-mark__anchor-rays">
          {Array.from({ length: 8 }, (_, index) => (
            <line
              key={index}
              className="evidence-mark__tick evidence-mark__anchor-ray"
              x1="22"
              y1="2.5"
              x2="22"
              y2="7"
              transform={`rotate(${index * 45} 22 22)`}
            />
          ))}
        </g>
      </svg>
    );
  }

  const edge = edgeProps(model.reportingEdge);

  return (
    <svg
      {...ariaProps}
      className={`evidence-mark ${className}`.trim()}
      width={size}
      height={size}
      x={x}
      y={y}
      viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`}
      focusable="false"
      data-selected={model.selected ? "true" : "false"}
      data-reporting-edge={model.reportingEdge}
      data-code={dataCode}
      style={{ "--evidence-score": scoreFill } as CSSProperties}
    >
      {model.selected && <circle className="evidence-mark__bloom" cx="22" cy="22" r="21" />}
      <circle
        className={edge.className}
        cx="22"
        cy="22"
        r="19"
        strokeDasharray={edge.dasharray}
        strokeLinecap={edge.linecap}
      />
      <circle className="evidence-mark__field" cx="22" cy="22" r="10" fill={scoreFill}>
        <title>{label ?? "Active score"}</title>
      </circle>
      <text className="evidence-mark__score" x="22" y="24.3" textAnchor="middle">
        {Math.round(model.score)}
      </text>

      <g className="evidence-mark__inputs">
        {model.inputs.map((input) => (
          <line
            key={`${input.datasetSlug}-${input.index}`}
            className={`evidence-mark__tick ${input.present ? "evidence-mark__tick--present" : "evidence-mark__tick--missing"}`}
            x1="22"
            y1="2.5"
            x2="22"
            y2="7"
            transform={`rotate(${input.angle + 90} 22 22)`}
            data-kind="score-input"
            data-index={input.index}
            data-present={input.present ? "true" : "false"}
          />
        ))}
      </g>

      <line
        className={`evidence-mark__context ${model.context.present ? "evidence-mark__context--present" : "evidence-mark__context--missing"}`}
        x1="22"
        y1="1"
        x2="22"
        y2="5"
        transform={`rotate(${model.context.angle + 90} 22 22)`}
        data-kind="context-only"
        data-present={model.context.present ? "true" : "false"}
      />
    </svg>
  );
}

export { VIEWBOX_SIZE };
