export type NodeId = string;

export interface LogicNode {
  id: NodeId;
  condition: string;
  childIds: NodeId[];
  linkedToId: NodeId | null;
  hasCycle: boolean;
  depth: number;
  parentId: NodeId | null;
}

export interface GraphState {
  nodes: Record<NodeId, LogicNode>;
  rootId: NodeId;
  cycleNodeIds: Set<NodeId>;
  hasCycle: boolean;
}

export interface EdgeInfo {
  from: NodeId;
  to: NodeId;
  isLink: boolean;
}

export type SimulationStatus = "idle" | "running" | "complete" | "blocked";

export interface SimulationState {
  status: SimulationState;
  visitedPath: NodeId[];
  currentNodeId: NodeId | null;
}
