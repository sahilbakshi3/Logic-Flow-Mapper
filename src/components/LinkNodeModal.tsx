import { useCallback } from "react";
import { ArrowRight, Link2Off, X } from "lucide-react";
import { useStore } from "../store/useStore";
import { getValidLinkTargets } from "../utils/graph";

export function LinkNodeModal() {
  const { linkingFromId, nodes, setLinkingFrom, linkNode } = useStore();

  const handleClose = useCallback(() => setLinkingFrom(null), [setLinkingFrom]);
  const handleSelect = useCallback(
    (toId: string) => linkNode(linkingFromId!, toId),
    [linkingFromId, linkNode],
  );
  const handleRemoveLink = useCallback(
    () => linkNode(linkingFromId!, null),
    [linkingFromId, linkNode],
  );

  if (!linkingFromId) return null;

  const fromNode = nodes[linkingFromId];
  if (!fromNode) return null;

  const validTargets = getValidLinkTargets(nodes, linkingFromId);

  return (
    <div className="overlay" onClick={handleClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 6,
          }}
        >
          <div
            className="modal-title"
            style={{ display: "flex", alignItems: "center", gap: 7 }}
          >
            <ArrowRight size={15} style={{ color: "var(--blue)" }} />
            Link Node
          </div>
          <button className="btn btn-ghost btn-icon" onClick={handleClose}>
            <X size={14} />
          </button>
        </div>

        <div className="modal-desc">
          Creating a cross-edge from{" "}
          <code
            style={{
              fontFamily: "var(--mono)",
              fontSize: 11,
              background: "var(--bg-3)",
              border: "1px solid var(--line)",
              padding: "1px 5px",
              borderRadius: 2,
              color: "var(--blue)",
            }}
          >
            {fromNode.condition || "unnamed"}
          </code>
          . Linking to an ancestor will create a cycle — the engine will detect
          it.
        </div>

        {fromNode.linkedToId && (
          <div style={{ marginBottom: 10 }}>
            <button
              className="btn btn-danger btn-sm"
              onClick={handleRemoveLink}
              style={{ gap: 5 }}
            >
              <Link2Off size={11} />
              remove link →{" "}
              {nodes[fromNode.linkedToId]?.condition || fromNode.linkedToId}
            </button>
          </div>
        )}

        <div className="link-target-list">
          {validTargets.length === 0 ? (
            <div
              style={{
                color: "var(--txt-3)",
                fontSize: 12,
                padding: 12,
                textAlign: "center",
                fontFamily: "var(--mono)",
              }}
            >
              no valid targets
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
                  <ArrowRight
                    size={12}
                    style={{
                      color: isCurrentLink ? "var(--amber)" : "var(--txt-4)",
                      flexShrink: 0,
                    }}
                  />
                  <span className="link-target-condition">
                    {node.condition || (
                      <em style={{ color: "var(--txt-3)" }}>unnamed</em>
                    )}
                  </span>
                  <span className="link-target-id">
                    {id === "root" ? "root" : id.slice(-6)}
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      fontFamily: "var(--mono)",
                      color: "var(--txt-4)",
                    }}
                  >
                    d:{node.depth}
                  </span>
                </div>
              );
            })
          )}
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button className="btn btn-ghost" onClick={handleClose}>
            cancel
          </button>
        </div>
      </div>
    </div>
  );
}
