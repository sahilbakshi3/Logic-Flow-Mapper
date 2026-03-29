import {
  Activity,
  AlertTriangle,
  BookOpen,
  CheckCircle,
  ChevronRight,
  FileJson,
  GitBranch,
  PlayCircle,
  RotateCcw,
  Square,
  TrendingUp,
  Zap,
} from "lucide-react";
import { exportGraphToJSON } from "../utils/graph";
import { useStore } from "../store/useStore";
import type { LogicNode } from "../types";

const TUTORIAL_NODES: Record<string, LogicNode> = {
  root: {
    id: "root",
    condition: "User submits form",
    childIds: ["node_tut_1", "node_tut_2"],
    linkedToId: null,
    hasCycle: false,
    depth: 0,
    parentId: null,
  },
  node_tut_1: {
    id: "node_tut_1",
    condition: "Input is valid",
    childIds: ["node_tut_3", "node_tut_4"],
    linkedToId: null,
    hasCycle: false,
    depth: 1,
    parentId: "root",
  },
  node_tut_2: {
    id: "node_tut_2",
    condition: "Input has errors",
    childIds: ["node_tut_5"],
    linkedToId: null,
    hasCycle: false,
    depth: 1,
    parentId: "root",
  },
  node_tut_3: {
    id: "node_tut_3",
    condition: "User is authenticated",
    childIds: [],
    linkedToId: null,
    hasCycle: false,
    depth: 2,
    parentId: "node_tut_1",
  },
  node_tut_4: {
    id: "node_tut_4",
    condition: "User is a guest → redirect",
    childIds: [],
    linkedToId: null,
    hasCycle: false,
    depth: 2,
    parentId: "node_tut_1",
  },
  node_tut_5: {
    id: "node_tut_5",
    condition: "Show validation message",
    childIds: [],
    linkedToId: null,
    hasCycle: false,
    depth: 2,
    parentId: "node_tut_2",
  },
};

export function Sidebar() {
  const nodes = useStore((s) => s.nodes);
  const hasCycle = useStore((s) => s.hasCycle);
  const cycleNodeIds = useStore((s) => s.cycleNodeIds);
  const simulation = useStore((s) => s.simulation);
  const runSimulation = useStore((s) => s.runSimulation);
  const stopSimulation = useStore((s) => s.stopSimulation);
  const resetGraph = useStore((s) => s.resetGraph);

  const loadTutorial = () => {
    useStore.setState({
      nodes: TUTORIAL_NODES,
      rootId: "root",
      cycleNodeIds: new Set<string>(),
      hasCycle: false,
      selectedNodeId: null,
      linkingFromId: null,
      simulation: { status: "idle", visitedPath: [], currentNodeId: null },
    });
  };

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
          <Activity size={10} />
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
          <GitBranch size={10} />
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
          <TrendingUp size={10} />
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
                <PlayCircle size={11} /> Simulate
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

      {/* ── Tutorial ── */}
      <div className="sidebar-section">
        <div className="sidebar-label">
          <BookOpen size={10} />
          Try This
        </div>

        <div className="tutorial-card">
          <div className="tutorial-card-header">
            <Zap size={11} color="#fff" />
            <span className="tutorial-card-title">Form Validation Flow</span>
          </div>
          <div className="tutorial-steps">
            <div className="tutorial-step">
              <div className="tutorial-step-num">1</div>
              <div className="tutorial-step-text">
                Click <strong>Load Example</strong> to fill the canvas with a
                real if-then scenario.
              </div>
            </div>
            <div className="tutorial-step">
              <div className="tutorial-step-num">2</div>
              <div className="tutorial-step-text">
                Click any node to <strong>select</strong> it and edit its
                condition inline.
              </div>
            </div>
            <div className="tutorial-step">
              <div className="tutorial-step-num">3</div>
              <div className="tutorial-step-text">
                Press <strong>+ Child</strong> to branch logic deeper from any
                node.
              </div>
            </div>
            <div className="tutorial-step">
              <div className="tutorial-step-num">4</div>
              <div className="tutorial-step-text">
                Use <strong>⇢ Link</strong> to cross-connect nodes — try linking
                a child back to root to trigger the cycle detector.
              </div>
            </div>
            <div className="tutorial-step">
              <div className="tutorial-step-num">5</div>
              <div className="tutorial-step-text">
                Hit <strong>Simulate</strong> above to animate the traversal
                path.
              </div>
            </div>
          </div>
        </div>

        <button className="btn tutorial-load-btn" onClick={loadTutorial}>
          <Zap size={11} />
          Load Example
        </button>
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
