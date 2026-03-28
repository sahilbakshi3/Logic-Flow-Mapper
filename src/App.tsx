import { useCallback } from "react";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { LogicNodeTree } from "./components/LogicNode";
import { LinkNodeModal } from "./components/LinkNodeModal";
import { useStore } from "./store/useStore";

function App() {
  const rootId = useStore((s) => s.rootId);
  const setSelectedNode = useStore((s) => s.setSelectedNode);
  const setLinkingFrom = useStore((s) => s.setLinkingFrom);
  const linkingFromId = useStore((s) => s.linkingFromId);

  const handleCanvasClick = useCallback(() => {
    setSelectedNode(null);
    if (linkingFromId) setLinkingFrom(null);
  }, [setSelectedNode, setLinkingFrom, linkingFromId]);

  return (
    <div className="app">
      <Header />

      <main className="canvas-wrapper" onClick={handleCanvasClick}>
        <div className="canvas-inner">
          <LogicNodeTree nodeId={rootId} isRoot />
        </div>
      </main>

      <Sidebar />
      <LinkNodeModal />
    </div>
  );
}

export default App;
