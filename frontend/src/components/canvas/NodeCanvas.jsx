import { useCallback, useEffect, useRef } from 'react';
import { ReactFlow, Background, Controls, MiniMap, BackgroundVariant, Panel } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useWorkflow } from '../../context/WorkflowContext';
import { useTheme } from '../../context/ThemeContext';
import { nodeTypes } from './NodeTypes';
import NodeDrawer from './NodeDrawer';

export default function NodeCanvas() {
  const {
    nodes, edges, selectedNode,
    onNodesChange, onEdgesChange, onConnect,
    setSelectedNode, addNode, initSchema,
  } = useWorkflow();
  const { isDark } = useTheme();
  const reactFlowWrapper = useRef(null);
  const rfInstance = useRef(null);

  // Compile initial schema on mount
  useEffect(() => { initSchema(); }, []);

  // Clear selection when clicking canvas background
  const onPaneClick = useCallback(() => setSelectedNode(null), [setSelectedNode]);

  // Handle drop from NodeDrawer
  const onDrop = useCallback((event) => {
    event.preventDefault();
    const kind = event.dataTransfer.getData('application/ae-node-kind');
    if (!kind || !rfInstance.current) return;

    const bounds = reactFlowWrapper.current.getBoundingClientRect();
    const position = rfInstance.current.screenToFlowPosition({
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
    });
    addNode(kind, position);
  }, [addNode]);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  }, []);

  return (
    <div className="canvas-wrapper" ref={reactFlowWrapper}>
      <NodeDrawer />

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onPaneClick={onPaneClick}
        onInit={(instance) => { rfInstance.current = instance; }}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.25 }}
        deleteKeyCode="Delete"
        colorMode={isDark ? 'dark' : 'light'}
        defaultEdgeOptions={{
          animated: true,
          style: { stroke: isDark ? '#475569' : '#94a3b8', strokeWidth: 1.5 },
        }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1.2}
          color={isDark ? '#334155' : '#d1d5db'}
        />
        <Controls
          showInteractive={false}
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            boxShadow: 'var(--shadow-sm)',
          }}
        />
        <MiniMap
          nodeColor={(n) => {
            const colorMap = {
              startEnd: '#22c55e',
              parser: '#3b82f6',
              worker: '#8b5cf6',
              security: '#22c55e',
              custom: '#f59e0b',
            };
            return colorMap[n.type] || '#94a3b8';
          }}
          maskColor={isDark ? 'rgba(15,23,42,0.7)' : 'rgba(249,250,251,0.7)'}
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 8,
          }}
        />
        <Panel position="top-right" className="canvas-panel-info">
          <span>{nodes.length} nodes</span>
          <span className="canvas-panel-info__sep">·</span>
          <span>{edges.length} connections</span>
          {selectedNode && (
            <>
              <span className="canvas-panel-info__sep">·</span>
              <span className="canvas-panel-info__selected">
                ⬤ {selectedNode.data.label} selected
              </span>
            </>
          )}
        </Panel>
      </ReactFlow>
    </div>
  );
}
