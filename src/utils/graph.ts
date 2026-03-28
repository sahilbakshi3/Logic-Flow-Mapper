import type { NodeId, LogicNode } from "../types";



export function generateId(): NodeId {
  return `node_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}


export function detectCycles(nodes: Record<NodeId, LogicNode>): {
  hasCycle: boolean;
  cycleNodeIds: Set<NodeId>;
} {
  const visiting = new Set<NodeId>();
  const visited = new Set<NodeId>();
  const cycleNodeIds = new Set<NodeId>();

  function dfs(nodeId: NodeId, path: NodeId[]): boolean {
    if (!nodes[nodeId]) return false;

    if (visiting.has(nodeId)) {
      const cycleStart = path.indexOf(nodeId);
      if (cycleStart !== -1) {
        for (let i = cycleStart; i < path.length; i++)
          cycleNodeIds.add(path[i]);
        cycleNodeIds.add(nodeId);
      }
      return true;
    }

    if (visited.has(nodeId)) return false;

    visiting.add(nodeId);
    path.push(nodeId);

    const node = nodes[nodeId];
    let foundCycle = false;

    for (const childId of node.childIds) {
      if (dfs(childId, [...path])) foundCycle = true;
    }

    if (node.linkedToId && nodes[node.linkedToId]) {
      if (dfs(node.linkedToId, [...path])) foundCycle = true;
    }

    visiting.delete(nodeId);
    visited.add(nodeId);
    return foundCycle;
  }

  for (const nodeId of Object.keys(nodes)) {
    if (!visited.has(nodeId)) dfs(nodeId, []);
  }

  return { hasCycle: cycleNodeIds.size > 0, cycleNodeIds };
}


export function recomputeGraph(
  nodes: Record<NodeId, LogicNode>,
  rootId: NodeId,
): {
  nodes: Record<NodeId, LogicNode>;
  rootId: NodeId;
  hasCycle: boolean;
  cycleNodeIds: Set<NodeId>;
} {
  const { hasCycle, cycleNodeIds } = detectCycles(nodes);

  const updatedNodes: Record<NodeId, LogicNode> = {};
  for (const [id, node] of Object.entries(nodes)) {
    updatedNodes[id] = { ...node, hasCycle: cycleNodeIds.has(id) };
  }

  return { nodes: updatedNodes, rootId, hasCycle, cycleNodeIds };
}

export function collectSubtreeIds(
  nodes: Record<NodeId, LogicNode>,
  rootId: NodeId,
): Set<NodeId> {
  const result = new Set<NodeId>();
  const stack = [rootId];

  while (stack.length > 0) {
    const id = stack.pop()!;
    if (result.has(id)) continue;
    result.add(id);
    const node = nodes[id];
    if (node) {
      for (const childId of node.childIds) stack.push(childId);
    }
  }

  return result;
}

export function getValidLinkTargets(
  nodes: Record<NodeId, LogicNode>,
  fromNodeId: NodeId,
): NodeId[] {
  return Object.keys(nodes).filter((id) => id !== fromNodeId);
}

export function computeDepths(
  nodes: Record<NodeId, LogicNode>,
  rootId: NodeId,
): Record<NodeId, number> {
  const depths: Record<NodeId, number> = {};
  const queue: Array<{ id: NodeId; depth: number }> = [
    { id: rootId, depth: 0 },
  ];
  const seen = new Set<NodeId>();

  while (queue.length > 0) {
    const { id, depth } = queue.shift()!;
    if (seen.has(id) || !nodes[id]) continue;
    seen.add(id);
    depths[id] = depth;
    for (const childId of nodes[id].childIds) {
      queue.push({ id: childId, depth: depth + 1 });
    }
  }

  return depths;
}


export function exportGraphToJSON(
  nodes: Record<NodeId, LogicNode>,
  rootId: NodeId,
): string {
  const exportData = {
    exportedAt: new Date().toISOString(),
    rootId,
    nodeCount: Object.keys(nodes).length,
    nodes: Object.values(nodes).map((node) => ({
      id: node.id,
      condition: node.condition,
      depth: node.depth,
      parentId: node.parentId,
      childIds: node.childIds,
      linkedToId: node.linkedToId,
    })),
  };
  return JSON.stringify(exportData, null, 2);
}
