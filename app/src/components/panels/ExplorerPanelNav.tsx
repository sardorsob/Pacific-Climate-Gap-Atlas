import { ArrowLeft, ChevronUp, X } from "lucide-react";

type ExplorerPanelNavProps = {
  title: string;
  backLabel?: string;
  expanded: boolean;
  onBack?: () => void;
  onClose: () => void;
  onToggleExpanded: () => void;
};

export function ExplorerPanelNav({
  title,
  backLabel,
  expanded,
  onBack,
  onClose,
  onToggleExpanded,
}: ExplorerPanelNavProps) {
  return (
    <nav className="panel-nav" aria-label="Panel navigation">
      {backLabel && onBack && (
        <button type="button" className="panel-nav__back" onClick={onBack} aria-label={backLabel}>
          <ArrowLeft aria-hidden="true" size={16} /> {backLabel}
        </button>
      )}
      <span className="panel-nav__title">{title}</span>
      <button
        type="button"
        className="panel-nav__toggle"
        aria-label={`Toggle ${title} panel`}
        aria-expanded={expanded}
        onClick={onToggleExpanded}
      >
        <ChevronUp aria-hidden="true" size={16} />
      </button>
      <button type="button" className="panel-nav__close" aria-label="Close panel" onClick={onClose}>
        <X aria-hidden="true" size={16} /> Close
      </button>
    </nav>
  );
}
