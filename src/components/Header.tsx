import { AlertTriangle, GitBranch, Link2 } from "lucide-react";
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
        <span className="header-sep"> / </span>
        <span className="header-sub">if-then tree builder</span>
      </div>

      <div className="header-actions">
        {linkingFromId && (
          <div
            className="status-banner warning"
            style={{ margin: 0, padding: "4px 10px" }}
          >
            <Link2 size={11} />
            <span>click a node to link</span>
            <button
              className="btn btn-ghost btn-sm"
              style={{ marginLeft: 4, padding: "1px 6px" }}
              onClick={() => setLinkingFrom(null)}
            >
              cancel
            </button>
          </div>
        )}
        {hasCycle && !linkingFromId && (
          <div className="cycle-warning">
            <AlertTriangle size={11} />
            logic loop detected
          </div>
        )}
        {!hasCycle && !linkingFromId && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              fontSize: 11,
              fontFamily: "var(--mono)",
              color: "var(--txt-3)",
            }}
          >
            <GitBranch size={11} />
            valid DAG
          </div>
        )}
      </div>
    </header>
  );
}
