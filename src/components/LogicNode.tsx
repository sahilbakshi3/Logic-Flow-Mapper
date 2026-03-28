import { memo, useCallback, useRef } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CheckCheck,
  Link2,
  Link2Off,
  Plus,
  X,
} from "lucide-react";
import type { NodeId } from "../types";
import { useStore } from "../store/useStore";

interface LogicNodeProps {
  nodeId: NodeId;
  isRoot?: boolean;
}

export const LogicNodeCard = memo(function LogicNodeCard({
  nodeId,
  isRoot = false,
}: LogicNodeProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const node = useStore((s) => s.nodes[nodeId]);
  const selectedNodeId = useStore((s) => s.selectedNodeId);
  const linkingFromId = useStore((s) => s.linkingFromId);
  const simulation = useStore((s) => s.simulation);
  const nodes = useStore((s) => s.nodes);

  const addChild = useStore((s) => s.addChild);
  const deleteNode = useStore((s) => s.deleteNode);
  const updateCondition = useStore((s) => s.updateCondition);
  const setSelectedNode = useStore((s) => s.setSelectedNode);
  const setLinkingFrom = useStore((s) => s.setLinkingFrom);
  const linkNode = useStore((s) => s.linkNode);

  const handleCardClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (linkingFromId && linkingFromId !== nodeId) {
        linkNode(linkingFromId, nodeId);
        return;
      }
      setSelectedNode(nodeId === selectedNodeId ? null : nodeId);
    },
    [linkingFromId, nodeId, linkNode, setSelectedNode, selectedNodeId],
  );

  const handleConditionChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) =>
      updateCondition(nodeId, e.target.value),
    [nodeId, updateCondition],
  );

  const handleAddChild = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      addChild(nodeId);
    },
    [nodeId, addChild],
  );

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      deleteNode(nodeId);
    },
    [nodeId, deleteNode],
  );

  const handleLinkClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setLinkingFrom(linkingFromId === nodeId ? null : nodeId);
    },
    [nodeId, linkingFromId, setLinkingFrom],
  );

  const handleRemoveLink = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      linkNode(nodeId, null);
    },
    [nodeId, linkNode],
  );

  if (!node) return null;

  const isSelected = selectedNodeId === nodeId;
  const isCurrentlySimulating = simulation.currentNodeId === nodeId;
  const isVisited = simulation.visitedPath.includes(nodeId);
  const isLinkingFrom = linkingFromId === nodeId;
  const isLinkingTarget = linkingFromId !== null && linkingFromId !== nodeId;
  const linkedNode = node.linkedToId ? nodes[node.linkedToId] : null;
  const shortId = nodeId === "root" ? "root" : nodeId.slice(-8);

  const cardClasses = [
    "node-card",
    isRoot ? "is-root" : "",
    node.hasCycle ? "has-cycle" : "",
    isSelected ? "is-selected" : "",
    isCurrentlySimulating ? "is-simulating" : "",
    isVisited && !isCurrentlySimulating ? "is-visited" : "",
    isLinkingTarget && !isLinkingFrom ? "linking-target" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={cardClasses} onClick={handleCardClick}>
      {/* Header */}
      <div className="node-header">
        <span className={`node-type-badge ${isRoot ? "root" : "child"}`}>
          {isRoot ? "ROOT" : "IF"}
        </span>
        <span className="node-id">{shortId}</span>

        <div className="node-status-icons">
          {node.hasCycle && (
            <div className="node-status-icon cycle" title="Part of a cycle">
              <AlertTriangle size={9} />
            </div>
          )}
          {node.linkedToId && (
            <div className="node-status-icon linked" title="Has outgoing link">
              <Link2 size={9} />
            </div>
          )}
          {isVisited && simulation.status !== "idle" && (
            <div className="node-status-icon visited" title="Visited">
              <CheckCheck size={9} />
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="node-body" onClick={(e) => e.stopPropagation()}>
        <input
          ref={inputRef}
          className="node-condition-input"
          type="text"
          value={node.condition}
          onChange={handleConditionChange}
          placeholder={isRoot ? "entry condition..." : "if this is true..."}
          onClick={(e) => e.stopPropagation()}
        />

        {linkedNode && (
          <div
            className={`node-link-badge ${node.hasCycle ? "is-cycle" : ""}`}
            onClick={handleRemoveLink}
            title="Click to remove link"
          >
            {node.hasCycle ? (
              <AlertTriangle size={9} />
            ) : (
              <ArrowRight size={9} />
            )}
            {linkedNode.condition || "unnamed"}
            <Link2Off size={9} style={{ opacity: 0.5 }} />
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="node-footer" onClick={(e) => e.stopPropagation()}>
        <button
          className="btn btn-ghost btn-sm"
          onClick={handleAddChild}
          data-tooltip="Add child node"
          style={{ gap: 4 }}
        >
          <Plus size={11} /> Child
        </button>

        <button
          className={`btn btn-sm ${isLinkingFrom ? "btn-amber" : "btn-ghost"}`}
          onClick={handleLinkClick}
          data-tooltip="Link to another node"
          style={{ gap: 4 }}
        >
          <Link2 size={11} />
          {isLinkingFrom ? "linking..." : "Link"}
        </button>

        {!isRoot && (
          <button
            className="btn btn-danger btn-icon"
            onClick={handleDelete}
            data-tooltip="Delete node"
            style={{ marginLeft: "auto" }}
          >
            <X size={12} />
          </button>
        )}
      </div>
    </div>
  );
});

export const LogicNodeTree = memo(function LogicNodeTree({
  nodeId,
  isRoot = false,
}: LogicNodeProps) {
  const node = useStore((s) => s.nodes[nodeId]);
  if (!node) return null;

  return (
    <div className="node-wrapper">
      <LogicNodeCard nodeId={nodeId} isRoot={isRoot} />
      {node.childIds.length > 0 && (
        <div className="node-children">
          {node.childIds.map((childId) => (
            <div key={childId} className="node-child-entry">
              <div className="node-row">
                <div className="node-connector-line" />
                <LogicNodeTree nodeId={childId} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});
