import { AlertTriangle, Link2, Moon, Sun } from "lucide-react";
import { useStore } from "../store/useStore";
import { useTheme } from "../store/useTheme";

export function Header() {
  const hasCycle = useStore((s) => s.hasCycle);
  const linkingFromId = useStore((s) => s.linkingFromId);
  const setLinkingFrom = useStore((s) => s.setLinkingFrom);
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="header">
      <div className="header-brand">
        <span className="header-title">Logic Flow Mapper</span>
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
              style={{
                marginLeft: 4,
                padding: "1px 6px",
                color: "rgba(255,255,255,0.75)",
                borderColor: "rgba(255,255,255,0.25)",
              }}
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

        <button
          className="theme-toggle"
          onClick={toggleTheme}
          title={
            theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
          }
        >
          {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
        </button>
      </div>
    </header>
  );
}
