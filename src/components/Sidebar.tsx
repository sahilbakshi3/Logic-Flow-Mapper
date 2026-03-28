import { useStore } from "../store/useStore";
import { exportGraphToJSON } from "../utils/graph";

export function Sidebar() {
  const nodes = useStore((s) => s.nodes);
  const hasCycle = useStore((s) => s.hasCycle);
  const cycleNodeIds = useStore((s) => s.cycleNodeIds);
  const simulation = useStore((s) => s.simulation);
  const runSimulation = useStore((s) => s.runSimulation);
  const stopSimulation = useStore((s) => s.stopSimulation);
  const resetGraph = useStore((s) => s.resetGraph);

  const totalNodes = Object.keys(nodes).length;
  const totalEdges = Object.values(nodes).reduce(
    (acc, n) => acc + n.childIds.length + (n.linkedToId ? 1 : 0),
    0,
  );
  const maxDepth = Object.values(nodes).reduce(
    (acc, n) => Math.max(acc, n.depth),
    0,
  );

  const isRunning = simulation.status === "running";
  const isComplete = simulation.status === "complete";

  const handleExport = () => {
    const json = exportGraphToJSON(nodes, "root");
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  return (
    <aside className="sidebar">
      {/* ── Graph Health ── */}
      <div className="sidebar-section">
        <div className="sidebar-label">Graph Health</div>

        {hasCycle ? (
          <div className="status-banner error">
            <span>⚠</span>
            <span>
              Cycle detected in {cycleNodeIds.size} node
              {cycleNodeIds.size !== 1 ? "s" : ""}
            </span>
          </div>
        ) : (
          <div className="status-banner success">
            <span>✓</span>
            <span>No cycles — graph is valid</span>
          </div>
        )}
      </div>

      {/* ── Stats ── */}
      <div className="sidebar-section">
        <div className="sidebar-label">Graph Stats</div>
        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-value">{totalNodes}</div>
            <div className="stat-label">Nodes</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{totalEdges}</div>
            <div className="stat-label">Edges</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{maxDepth}</div>
            <div className="stat-label">Max Depth</div>
          </div>
          <div className="stat-card">
            <div
              className="stat-value"
              style={{
                color: hasCycle ? "var(--accent-red)" : "var(--accent-green)",
              }}
            >
              {hasCycle ? "CYCLIC" : "DAG"}
            </div>
            <div className="stat-label">Type</div>
          </div>
        </div>
      </div>

      {/* ── Simulation ── */}
      <div className="sidebar-section">
        <div className="sidebar-label">DFS Simulation</div>

        {hasCycle && (
          <div
            className="status-banner error"
            style={{ marginBottom: 10, fontSize: 11 }}
          >
            Fix cycles to enable simulation
          </div>
        )}

        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <button
            className={`btn ${isRunning ? "btn-amber" : "btn-primary"}`}
            onClick={isRunning ? stopSimulation : runSimulation}
            disabled={hasCycle && !isRunning}
            style={{ flex: 1 }}
          >
            {isRunning ? "■ Stop" : isComplete ? "↺ Replay" : "▶ Simulate"}
          </button>

          {(isRunning || isComplete) && (
            <button className="btn btn-ghost" onClick={stopSimulation}>
              Reset
            </button>
          )}
        </div>

        {isComplete && (
          <div className="status-banner success" style={{ marginBottom: 10 }}>
            ✓ Traversal complete — {simulation.visitedPath.length} nodes visited
          </div>
        )}

        {simulation.visitedPath.length > 0 && (
          <div className="sim-path-list">
            {simulation.visitedPath.map((id, i) => {
              const node = nodes[id];
              const isActive = id === simulation.currentNodeId;
              return (
                <div
                  key={`${id}-${i}`}
                  className={`sim-path-item ${isActive ? "active" : ""}`}
                >
                  <span className="sim-path-index">{i + 1}</span>
                  <span className="sim-path-condition">
                    {node?.condition || <em>unnamed</em>}
                  </span>
                  {isActive && (
                    <span
                      style={{ color: "var(--accent-green)", fontSize: 10 }}
                    >
                      ●
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Instructions ── */}
      <div className="sidebar-section" style={{ flex: 1 }}>
        <div className="sidebar-label">How to Use</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            ["+ Child", "Add a nested child node"],
            ["⇢ Link", "Create a cross-edge (can form cycles)"],
            ["✕", "Delete node and all its descendants"],
            ["▶ Simulate", "Run DFS traversal animation"],
          ].map(([action, desc]) => (
            <div
              key={action}
              style={{
                display: "flex",
                gap: 8,
                alignItems: "flex-start",
                fontSize: 11,
              }}
            >
              <code
                style={{
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border)",
                  borderRadius: 3,
                  padding: "1px 5px",
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  color: "var(--accent-blue)",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
              >
                {action}
              </code>
              <span style={{ color: "var(--text-secondary)", lineHeight: 1.5 }}>
                {desc}
              </span>
            </div>
          ))}
        </div>
      </div>

      <button
        className="btn"
        style={{ width: "100%", justifyContent: "center", marginBottom: 6 }}
        onClick={handleExport}
      >
        ↓ export json
      </button>

      {/* ── Reset ── */}
      <div className="sidebar-section">
        <button
          className="btn btn-danger"
          style={{ width: "100%" }}
          onClick={resetGraph}
        >
          ↺ Reset Graph
        </button>
      </div>
    </aside>
  );
}
