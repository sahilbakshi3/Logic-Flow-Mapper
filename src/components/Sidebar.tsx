import {
  Activity,
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  FileJson,
  GitBranch,
  Layers,
  PlayCircle,
  RotateCcw,
  Square,
  TrendingUp,
} from "lucide-react";
import { exportGraphToJSON } from "../utils/graph";
import { useStore } from "../store/useStore";

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
      {/* ── Status ── */}
      <div className="sidebar-section">
        <div className="sidebar-label">
          <Activity size={10} style={{ display: "inline", marginRight: 5 }} />
          Status
        </div>
        {hasCycle ? (
          <div className="status-banner error">
            <AlertTriangle size={12} />
            cycle in {cycleNodeIds.size} node
            {cycleNodeIds.size !== 1 ? "s" : ""}
          </div>
        ) : (
          <div className="status-banner success">
            <CheckCircle size={12} />
            no cycles detected
          </div>
        )}
      </div>

      {/* ── Graph Stats ── */}
      <div className="sidebar-section">
        <div className="sidebar-label">
          <GitBranch size={10} style={{ display: "inline", marginRight: 5 }} />
          Graph
        </div>
        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-value">{totalNodes}</div>
            <div className="stat-label">nodes</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{totalEdges}</div>
            <div className="stat-label">edges</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{maxDepth}</div>
            <div className="stat-label">depth</div>
          </div>
          <div className="stat-card">
            <div
              className="stat-value"
              style={{
                fontSize: 12,
                color: hasCycle ? "var(--red)" : "var(--green)",
              }}
            >
              {hasCycle ? "cyclic" : "DAG"}
            </div>
            <div className="stat-label">type</div>
          </div>
        </div>
      </div>

      {/* ── Simulation ── */}
      <div className="sidebar-section">
        <div className="sidebar-label">
          <TrendingUp size={10} style={{ display: "inline", marginRight: 5 }} />
          Simulation
        </div>

        {hasCycle && (
          <div
            className="status-banner error"
            style={{ marginBottom: 8, fontSize: 11 }}
          >
            <AlertTriangle size={11} />
            fix cycles to run
          </div>
        )}

        <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
          <button
            className="btn btn-dark"
            onClick={isRunning ? stopSimulation : runSimulation}
            disabled={hasCycle && !isRunning}
            style={{ flex: 1, justifyContent: "center" }}
          >
            {isRunning ? (
              <>
                <Square size={11} /> stop
              </>
            ) : isComplete ? (
              <>
                <RotateCcw size={11} /> replay
              </>
            ) : (
              <>
                <PlayCircle size={11} /> run DFS
              </>
            )}
          </button>
          {(isRunning || isComplete) && (
            <button className="btn btn-ghost btn-sm" onClick={stopSimulation}>
              reset
            </button>
          )}
        </div>

        {isComplete && (
          <div className="status-banner success" style={{ marginBottom: 8 }}>
            <CheckCircle size={11} />
            {simulation.visitedPath.length} nodes visited
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
                    {node?.condition || "unnamed"}
                  </span>
                  {isActive && (
                    <ChevronRight
                      size={10}
                      style={{ color: "var(--green)", flexShrink: 0 }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Reference ── */}
      <div className="sidebar-section" style={{ flex: 1 }}>
        <div className="sidebar-label">
          <Layers size={10} style={{ display: "inline", marginRight: 5 }} />
          Reference
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            ["+ Child", "add nested condition"],
            ["⇢ Link", "cross-link to existing node"],
            ["✕", "delete node + children"],
            ["▶ run DFS", "animate traversal"],
          ].map(([cmd, desc]) => (
            <div
              key={cmd}
              style={{ display: "flex", gap: 8, alignItems: "baseline" }}
            >
              <code
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: 10,
                  background: "var(--bg-3)",
                  border: "1px solid var(--line)",
                  padding: "1px 5px",
                  borderRadius: 2,
                  color: "var(--txt-2)",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
              >
                {cmd}
              </code>
              <span
                style={{ fontSize: 11, color: "var(--txt-3)", lineHeight: 1.5 }}
              >
                {desc}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Actions ── */}
      <div className="sidebar-section">
        <button
          className="btn"
          style={{
            width: "100%",
            justifyContent: "center",
            marginBottom: 6,
            gap: 7,
          }}
          onClick={handleExport}
        >
          <FileJson size={13} />
          export json
        </button>
        <button
          className="btn"
          style={{
            width: "100%",
            justifyContent: "center",
            color: "var(--red)",
            gap: 7,
          }}
          onClick={resetGraph}
        >
          <RotateCcw size={12} />
          reset graph
        </button>
      </div>
    </aside>
  );
}
