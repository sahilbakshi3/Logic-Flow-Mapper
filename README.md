# Logic Flow Mapper

A real-time recursive "If-Then" logic tree builder with cycle detection and DFS simulation.

---

## Data Structure: Normalised Graph (Flat Map)

This project uses a **normalised flat map** (`Record<NodeId, LogicNode>`) rather than a recursive/nested tree. Here's why:

### Why Not Nested?

A nested structure (`{ id, children: [{ id, children: [...] }] }`) has real problems at scale:

- **Deep updates are expensive**: To update a node 10 levels deep, you need to reconstruct the entire path from root → clone every ancestor. Immer helps, but the cost is still O(depth).
- **Graph operations are awkward**: Linking a node to another (cross-edge) requires either storing a reference or an ID — at that point you're basically doing normalisation anyway.
- **Cycle detection requires full traversal from root** with no shortcut.

### Why Normalised?

```ts
interface GraphState {
  nodes: Record<NodeId, LogicNode>; // flat map
  rootId: NodeId;
}

interface LogicNode {
  id: NodeId;
  condition: string;
  childIds: NodeId[]; // structural children (tree edges)
  linkedToId: NodeId | null; // cross-edge (can create cycles)
  parentId: NodeId | null;
  depth: number;
  hasCycle: boolean;
}
```

Benefits:

- **O(1) node lookup** by ID — no tree traversal needed.
- **O(1) node update** — mutate one entry in the flat map.
- **Clean graph semantics** — children + links are just ID references.
- **Easy garbage collection** — deleting a subtree is just removing IDs from the map.
- **Natural fit for Immer** — mutations stay local, no deep cloning needed.

---

## Cycle Detection: Depth-First Search (DFS)

### The Algorithm

Standard **DFS with three-color marking** (white/grey/black):

```
DETECT_CYCLES(nodes):
  visiting = Set()   // grey: currently in DFS call stack
  visited  = Set()   // black: fully processed
  cycles   = Set()   // nodes involved in a cycle

  for each node in nodes:
    if node not in visited:
      DFS(node, path=[])

DFS(nodeId, path):
  if nodeId in visiting:
    → CYCLE FOUND
    mark all nodes from cycle_start to end of path
    return

  if nodeId in visited:
    → already processed, skip
    return

  visiting.add(nodeId)
  path.push(nodeId)

  for each neighbor (childIds + linkedToId):
    DFS(neighbor, path.copy())

  visiting.remove(nodeId)
  visited.add(nodeId)
```

### Edge Types Considered

| Edge Type   | Source       | Notes                                     |
| ----------- | ------------ | ----------------------------------------- |
| Tree edges  | `childIds`   | Structural parent→child                   |
| Cross-edges | `linkedToId` | User-defined links — primary cycle source |

### Complexity

- **Time**: O(V + E) — each node and edge visited once
- **Space**: O(V) — call stack + three sets

### When Recomputed

After **every mutation**:

- Adding a child (`addChild`)
- Deleting a node (`deleteNode`)
- Creating or removing a link (`linkNode`)

This keeps the UI in sync without stale state.

---

## Architecture

```
src/
├── types/
│   └── index.ts          # LogicNode, GraphState, SimulationState types
├── utils/
│   └── graph.ts          # DFS cycle detection, graph helpers, ID gen
├── store/
│   └── useStore.ts       # Zustand + Immer store — all graph mutations
|   └── useTheme.ts       # Light/Dark Mode
├── components/
│   ├── Header.tsx         # Top bar with status
│   ├── Sidebar.tsx        # Stats, simulation controls
│   ├── LogicNode.tsx      # Recursive node card + tree rendering
│   └── LinkNodeModal.tsx  # Modal for creating cross-edges
├── styles/
│   └── global.css        # Vanilla CSS with CSS variables
├── App.tsx
└── main.tsx
```

### State Management

**Zustand + Immer** was chosen over `useReducer` + Context because:

- Immer gives free structural sharing (only changed nodes are re-allocated)
- Zustand's `(s) => s.nodes[id]` selectors ensure components only re-render when _their_ node changes
- No Provider boilerplate

### Performance

- Each `LogicNodeCard` is wrapped in `React.memo` — only re-renders when its specific node slice changes
- Components subscribe to `(s) => s.nodes[nodeId]` (single node), not the entire nodes map
- `recomputeGraph` runs O(V+E) DFS after each mutation — acceptable since mutations are user-driven (not bulk)

---

## Running Locally

```bash
npm install
npm run dev
```

Build:

```bash
npm run build
```
