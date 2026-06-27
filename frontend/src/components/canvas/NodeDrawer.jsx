import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const NODE_PALETTE = [
  {
    kind: 'START',
    label: 'Start',
    description: 'Workflow entry point',
    color: '#22c55e',
    bg: '#dcfce7',
    icon: '▶',
  },
  {
    kind: 'END',
    label: 'End',
    description: 'Workflow terminator',
    color: '#ef4444',
    bg: '#fee2e2',
    icon: '■',
  },
  {
    kind: 'PARSER',
    label: 'Parser',
    description: 'JSON/data parser step',
    color: '#3b82f6',
    bg: '#dbeafe',
    icon: '⚙',
  },
  {
    kind: 'WORKER',
    label: 'Worker',
    description: 'Thread pool task',
    color: '#8b5cf6',
    bg: '#ede9fe',
    icon: '◈',
  },
  {
    kind: 'SECURITY',
    label: 'Security',
    description: 'Access clearance gate',
    color: '#22c55e',
    bg: '#dcfce7',
    icon: '🔒',
  },
  {
    kind: 'CUSTOM',
    label: 'Custom Cmd',
    description: 'Raw shell command block',
    color: '#f59e0b',
    bg: '#fef3c7',
    icon: '$',
    dashed: true,
  },
];

export default function NodeDrawer({ onNodeDragStart }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`node-drawer ${collapsed ? 'node-drawer--collapsed' : ''}`}>
      <button
        className="node-drawer__toggle"
        onClick={() => setCollapsed((p) => !p)}
        title={collapsed ? 'Expand palette' : 'Collapse palette'}
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {!collapsed && (
        <>
          <div className="node-drawer__title">Nodes</div>
          <div className="node-drawer__list">
            {NODE_PALETTE.map((node) => (
              <div
                key={node.kind}
                className={`node-drawer__item ${node.dashed ? 'node-drawer__item--dashed' : ''}`}
                style={{ '--item-color': node.color, '--item-bg': node.bg }}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('application/ae-node-kind', node.kind);
                  e.dataTransfer.effectAllowed = 'copy';
                  if (onNodeDragStart) onNodeDragStart(node.kind);
                }}
                title={`Drag to add ${node.label} node`}
              >
                <span className="node-drawer__item-icon">{node.icon}</span>
                <div className="node-drawer__item-text">
                  <span className="node-drawer__item-label">{node.label}</span>
                  <span className="node-drawer__item-desc">{node.description}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="node-drawer__hint">
            <span>Drag nodes onto the canvas to build your workflow</span>
          </div>
        </>
      )}
    </div>
  );
}
