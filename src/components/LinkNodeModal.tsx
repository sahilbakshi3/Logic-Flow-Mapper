import { useCallback } from "react";
import { useStore } from "../store/useStore";
import { getValidLinkTargets } from "../utils/graph";

export function LinkNodeModal() {
  const { linkingFromId, nodes, setLinkingFrom, linkNode } = useStore();

  const handleClose = useCallback(() => setLinkingFrom(null), [setLinkingFrom]);

  const handleSelect = useCallback(
    (toId: string) => linkNode(linkingFromId!, toId),
    [linkingFromId, linkNode],
  );

  const handleRemoveLink = useCallback(() => {
    linkNode(linkingFromId!, null);
  }, [linkingFromId, linkNode]);

  if (!linkingFromId) return null;

  const fromNode = nodes[linkingFromId];
  if (!fromNode) return null;

  const validTargets = getValidLinkTargets(nodes, linkingFromId);

  return (
    <div className="overlay" onClick={handleClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-title">Link Node</div>
        <div className="modal-desc">
          Select a target node to create a cross-edge from{" "}
          <span
            style={{
              fontFamily: "var(--font-mono)",
              color: "var(--accent-blue)",
              fontSize: 12,
            }}
          >
            {fromNode.condition || "unnamed"}
          </span>
          . Links can create cycles — the engine will detect them in real-time.
        </div>

        {fromNode.linkedToId && (
          <div style={{ marginBottom: 12 }}>
            <button
              className="btn btn-danger btn-sm"
              onClick={handleRemoveLink}
            >
              ✕ Remove current link →{" "}
              {nodes[fromNode.linkedToId]?.condition || fromNode.linkedToId}
            </button>
          </div>
        )}

        <div className="link-target-list">
          {validTargets.length === 0 ? (
            <div
              style={{
                color: "var(--text-muted)",
                fontSize: 12,
                padding: 12,
                textAlign: "center",
              }}
            >
              No valid link targets available
            </div>
          ) : (
            validTargets.map((id) => {
              const node = nodes[id];
              if (!node) return null;
              const isCurrentLink = fromNode.linkedToId === id;
              return (
                <div
                  key={id}
                  className={`link-target-item ${isCurrentLink ? "active" : ""}`}
                  onClick={() => handleSelect(id)}
                >
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: isCurrentLink
                        ? "var(--accent-amber)"
                        : "var(--border-accent)",
                      flexShrink: 0,
                    }}
                  />
                  <span className="link-target-condition">
                    {node.condition || (
                      <em style={{ color: "var(--text-muted)" }}>unnamed</em>
                    )}
                  </span>
                  <span className="link-target-id">
                    {id === "root" ? "root" : id.slice(-6)}
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      fontFamily: "var(--font-mono)",
                      color: "var(--text-muted)",
                    }}
                  >
                    depth:{node.depth}
                  </span>
                </div>
              );
            })
          )}
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button className="btn btn-ghost" onClick={handleClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
