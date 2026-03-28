import { useStore } from "../store/useStore";

export function Header() {
  const hasCycle = useStore((s) => s.hasCycle);
  const linkingFromId = useStore((s) => s.linkingFromId);
  const setLinkingFrom = useStore((s) => s.setLinkingFrom);

  return (
    <header className="header">
      <div className="header-brand">
        <div className="header-logo">LF</div>
        <span className="header-title">Logic Flow Mapper</span>
        <span className="header-subtitle">/ recursive logic engine</span>
      </div>

      <div className="header-actions">
        {linkingFromId && (
          <div
            className="status-banner warning"
            style={{ margin: 0, padding: "4px 10px" }}
          >
            <span>⇢</span>
            <span style={{ fontSize: 11 }}>
              Click any node to create a link
            </span>
            <button
              className="btn btn-ghost btn-sm"
              style={{ padding: "2px 6px", marginLeft: 4 }}
              onClick={() => setLinkingFrom(null)}
            >
              Cancel
            </button>
          </div>
        )}

        {hasCycle && !linkingFromId && (
          <div className="cycle-warning">
            <span>⚠</span>
            <span>Logic loop detected</span>
          </div>
        )}
      </div>
    </header>
  );
}
