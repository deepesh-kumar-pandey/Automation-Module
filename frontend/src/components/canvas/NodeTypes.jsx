import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { useWorkflow } from '../../context/WorkflowContext';

// ─── Shared handle style ──────────────────────────────────────────────────────
const handleStyle = {
  width: 10,
  height: 10,
  borderRadius: '50%',
  border: '2px solid var(--border)',
  background: 'var(--bg-surface)',
};

// ─── Base node shell ──────────────────────────────────────────────────────────
function NodeShell({ id, children, className, style = {} }) {
  const { selectedNode, setSelectedNode, nodes } = useWorkflow();
  const isSelected = selectedNode?.id === id;
  const nodeData = nodes.find((n) => n.id === id);

  const handleClick = (e) => {
    e.stopPropagation();
    setSelectedNode(isSelected ? null : nodeData);
  };

  return (
    <div
      className={`ae-node ${className || ''} ${isSelected ? 'ae-node--selected' : ''}`}
      style={style}
      onClick={handleClick}
    >
      {children}
    </div>
  );
}

// ─── START / END Hexagonal Node ───────────────────────────────────────────────
export const StartEndNode = memo(({ id, data }) => {
  const isStart = data.nodeKind === 'START';
  return (
    <NodeShell id={id} className="ae-node--hexagon" style={{ '--hex-color': isStart ? '#22c55e' : '#ef4444' }}>
      {!isStart && <Handle type="target" position={Position.Left} style={handleStyle} />}
      <div className="ae-node__hex-inner">
        <span className="ae-node__kind-badge" style={{ background: isStart ? '#dcfce7' : '#fee2e2', color: isStart ? '#15803d' : '#b91c1c' }}>
          {data.nodeKind}
        </span>
        <span className="ae-node__label">{data.label}</span>
      </div>
      {isStart && <Handle type="source" position={Position.Right} style={handleStyle} />}
    </NodeShell>
  );
});

// ─── PARSER Node ──────────────────────────────────────────────────────────────
export const ParserNode = memo(({ id, data }) => (
  <NodeShell id={id} className="ae-node--parser">
    <Handle type="target" position={Position.Left} style={handleStyle} />
    <div className="ae-node__header" style={{ background: '#dbeafe' }}>
      <span className="ae-node__icon">⚙</span>
      <span className="ae-node__kind-badge" style={{ background: '#93c5fd', color: '#1d4ed8' }}>PARSER</span>
    </div>
    <div className="ae-node__body">
      <span className="ae-node__label">{data.label}</span>
      {data.timeout_ms > 0 && (
        <span className="ae-node__meta">⏱ {data.timeout_ms}ms</span>
      )}
    </div>
    <Handle type="source" position={Position.Right} style={handleStyle} />
  </NodeShell>
));

// ─── WORKER Node ──────────────────────────────────────────────────────────────
export const WorkerNode = memo(({ id, data }) => (
  <NodeShell id={id} className="ae-node--worker">
    <Handle type="target" position={Position.Left} style={handleStyle} />
    <div className="ae-node__header" style={{ background: '#ede9fe' }}>
      <span className="ae-node__icon">◈</span>
      <span className="ae-node__kind-badge" style={{ background: '#c4b5fd', color: '#6d28d9' }}>WORKER</span>
    </div>
    <div className="ae-node__body">
      <span className="ae-node__label">{data.label}</span>
      {data.timeout_ms > 0 && (
        <span className="ae-node__meta">⏱ {data.timeout_ms}ms</span>
      )}
    </div>
    <Handle type="source" position={Position.Right} style={handleStyle} />
  </NodeShell>
));

// ─── SECURITY Node ────────────────────────────────────────────────────────────
export const SecurityNode = memo(({ id, data }) => (
  <NodeShell id={id} className="ae-node--security">
    <Handle type="target" position={Position.Left} style={handleStyle} />
    <div className="ae-node__header" style={{ background: '#dcfce7' }}>
      <span className="ae-node__icon">🔒</span>
      <span className="ae-node__kind-badge" style={{ background: '#86efac', color: '#15803d' }}>SECURITY</span>
    </div>
    <div className="ae-node__body">
      <span className="ae-node__label">{data.label}</span>
      {data.timeout_ms > 0 && (
        <span className="ae-node__meta">⏱ {data.timeout_ms}ms</span>
      )}
    </div>
    <Handle type="source" position={Position.Right} style={handleStyle} />
  </NodeShell>
));

// ─── CUSTOM COMMAND Node ──────────────────────────────────────────────────────
export const CustomNode = memo(({ id, data }) => (
  <NodeShell id={id} className="ae-node--custom">
    <Handle type="target" position={Position.Left} style={handleStyle} />
    <div className="ae-node__header ae-node__header--dashed">
      <span className="ae-node__icon">$</span>
      <span className="ae-node__kind-badge" style={{ background: '#fef3c7', color: '#92400e' }}>CUSTOM</span>
    </div>
    <div className="ae-node__body">
      <span className="ae-node__label">{data.label}</span>
      {data.script && (
        <code className="ae-node__script-preview">{data.script.slice(0, 28)}{data.script.length > 28 ? '…' : ''}</code>
      )}
      {data.timeout_ms > 0 && (
        <span className="ae-node__meta">⏱ {data.timeout_ms}ms</span>
      )}
    </div>
    <Handle type="source" position={Position.Right} style={handleStyle} />
  </NodeShell>
));

// ─── Node type registry for React Flow ───────────────────────────────────────
export const nodeTypes = {
  startEnd: StartEndNode,
  parser: ParserNode,
  worker: WorkerNode,
  security: SecurityNode,
  custom: CustomNode,
};
