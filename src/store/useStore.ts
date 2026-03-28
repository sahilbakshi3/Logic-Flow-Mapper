import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { NodeId, LogicNode, GraphState, SimulationState } from "../types";
import {
  generateId,
  recomputeGraph,
  collectSubtreeIds,
  computeDepths,
} from "../utils/graph";

function createRootNode(): LogicNode {
  return {
    id: "root",
    condition: "Start",
    childIds: [],
    linkedToId: null,
    hasCycle: false,
    depth: 0,
    parentId: null,
  };
}

function buildInitialGraph(): GraphState {
  const root = createRootNode();
  return {
    nodes: { [root.id]: root },
    rootId: root.id,
    cycleNodeIds: new Set(),
    hasCycle: false,
  };
}

interface StoreActions {
  addChild: (parentId: NodeId) => void;
  deleteNode: (nodeId: NodeId) => void;
  updateCondition: (nodeId: NodeId, condition: string) => void;
  linkNode: (fromId: NodeId, toId: NodeId | null) => void;
  resetGraph: () => void;

  simulation: SimulationState;
  runSimulation: () => void;
  stopSimulation: () => void;

  selectedNodeId: NodeId | null;
  setSelectedNode: (id: NodeId | null) => void;
  linkingFromId: NodeId | null;
  setLinkingFrom: (id: NodeId | null) => void;
}

type Store = GraphState & StoreActions;

function applyRecompute(
  nodes: Record<NodeId, LogicNode>,
  rootId: NodeId,
): Pick<GraphState, "nodes" | "hasCycle" | "cycleNodeIds"> {
  const result = recomputeGraph(nodes, rootId);
  // Re-stamp depths after any structural change
  const depths = computeDepths(result.nodes, rootId);
  const nodesWithDepth: Record<NodeId, LogicNode> = {};
  for (const [id, node] of Object.entries(result.nodes)) {
    nodesWithDepth[id] = { ...node, depth: depths[id] ?? 0 };
  }
  return {
    nodes: nodesWithDepth,
    hasCycle: result.hasCycle,
    cycleNodeIds: result.cycleNodeIds,
  };
}

export const useStore = create<Store>()(
  immer((set, get) => ({
    ...buildInitialGraph(),

    selectedNodeId: null,
    linkingFromId: null,
    simulation: { status: "idle", visitedPath: [], currentNodeId: null },

    setSelectedNode: (id) =>
      set((s) => {
        s.selectedNodeId = id;
      }),
    setLinkingFrom: (id) =>
      set((s) => {
        s.linkingFromId = id;
      }),

    addChild: (parentId) => {
      set((s) => {
        const newNode: LogicNode = {
          id: generateId(),
          condition: "",
          childIds: [],
          linkedToId: null,
          hasCycle: false,
          depth: (s.nodes[parentId]?.depth ?? 0) + 1,
          parentId,
        };
        s.nodes[newNode.id] = newNode;
        s.nodes[parentId].childIds.push(newNode.id);

        const recomputed = applyRecompute(
          s.nodes as Record<NodeId, LogicNode>,
          s.rootId,
        );
        s.nodes = recomputed.nodes as typeof s.nodes;
        s.hasCycle = recomputed.hasCycle;
        s.cycleNodeIds = recomputed.cycleNodeIds;
      });
    },

    deleteNode: (nodeId) => {
      if (nodeId === get().rootId) return; // can't delete root

      set((s) => {
        const subtree = collectSubtreeIds(
          s.nodes as Record<NodeId, LogicNode>,
          nodeId,
        );

        // Remove from parent's childIds
        const node = s.nodes[nodeId];
        if (node.parentId && s.nodes[node.parentId]) {
          s.nodes[node.parentId].childIds = s.nodes[
            node.parentId
          ].childIds.filter((id) => id !== nodeId);
        }

        // Remove all nodes in subtree
        for (const id of subtree) {
          delete s.nodes[id];
        }

        // Remove any links pointing into the deleted subtree
        for (const n of Object.values(s.nodes)) {
          if (n.linkedToId && subtree.has(n.linkedToId)) {
            n.linkedToId = null;
          }
        }

        const recomputed = applyRecompute(
          s.nodes as Record<NodeId, LogicNode>,
          s.rootId,
        );
        s.nodes = recomputed.nodes as typeof s.nodes;
        s.hasCycle = recomputed.hasCycle;
        s.cycleNodeIds = recomputed.cycleNodeIds;

        if (s.selectedNodeId && subtree.has(s.selectedNodeId)) {
          s.selectedNodeId = null;
        }
      });
    },

    updateCondition: (nodeId, condition) => {
      set((s) => {
        if (s.nodes[nodeId]) {
          s.nodes[nodeId].condition = condition;
        }
      });
    },

    linkNode: (fromId, toId) => {
      set((s) => {
        if (s.nodes[fromId]) {
          s.nodes[fromId].linkedToId = toId;
        }

        const recomputed = applyRecompute(
          s.nodes as Record<NodeId, LogicNode>,
          s.rootId,
        );
        s.nodes = recomputed.nodes as typeof s.nodes;
        s.hasCycle = recomputed.hasCycle;
        s.cycleNodeIds = recomputed.cycleNodeIds;

        s.linkingFromId = null;
      });
    },

    resetGraph: () => {
      set(() => ({
        ...buildInitialGraph(),
        selectedNodeId: null,
        linkingFromId: null,
        simulation: { status: "idle", visitedPath: [], currentNodeId: null },
      }));
    },

    runSimulation: () => {
      if (get().hasCycle) return;

      set((s) => {
        s.simulation = {
          status: "running",
          visitedPath: [],
          currentNodeId: s.rootId,
        };
      });

      // Animate traversal step by step
      const nodes = get().nodes;
      const visited: NodeId[] = [];
      const stack = [get().rootId];
      const seen = new Set<NodeId>();

      const step = () => {
        if (stack.length === 0) {
          set((s) => {
            s.simulation.status = "complete";
            s.simulation.currentNodeId = null;
          });
          return;
        }

        const id = stack.pop()!;
        if (seen.has(id)) {
          setTimeout(step, 150);
          return;
        }
        seen.add(id);
        visited.push(id);

        const node = nodes[id];
        if (node) {
          // Push children in reverse so left-most is processed first
          for (let i = node.childIds.length - 1; i >= 0; i--) {
            stack.push(node.childIds[i]);
          }
          if (node.linkedToId) stack.push(node.linkedToId);
        }

        set((s) => {
          s.simulation.visitedPath = [...visited];
          s.simulation.currentNodeId = id;
        });

        setTimeout(step, 400);
      };

      setTimeout(step, 200);
    },

    stopSimulation: () => {
      set((s) => {
        s.simulation = { status: "idle", visitedPath: [], currentNodeId: null };
      });
    },
  })),
);
