import { useState, useCallback } from 'react';
import { Trash2, Clock, Terminal, RefreshCw } from 'lucide-react';
import { useWorkflow } from '../../context/WorkflowContext';

// ─── Cron Expression Generator ────────────────────────────────────────────────
const CRON_PRESETS = [
  { label: 'Every minute',        value: '* * * * *' },
  { label: 'Every 5 minutes',     value: '*/5 * * * *' },
  { label: 'Every hour',          value: '0 * * * *' },
  { label: 'Daily at 9 AM',       value: '0 9 * * *' },
  { label: 'Weekdays 9–17',       value: '0 9-17 * * 1-5' },
  { label: 'Every Sunday midnight',value: '0 0 * * 0' },
  { label: 'Custom…',             value: '__custom__' },
];

function CronGenerator({ value, onChange }) {
  const [showCustom, setShowCustom] = useState(
    !CRON_PRESETS.find((p) => p.value === value && p.value !== '__custom__')
  );
  const [parts, setParts] = useState(() => {
    const [min='*', hr='*', dom='*', mon='*', dow='*'] = (value || '* * * * *').split(' ');
    return { min, hr, dom, mon, dow };
  });

  const handlePreset = (v) => {
    if (v === '__custom__') { setShowCustom(true); return; }
    setShowCustom(false);
    onChange(v);
    const [min='*', hr='*', dom='*', mon='*', dow='*'] = v.split(' ');
    setParts({ min, hr, dom, mon, dow });
  };

  const handlePart = (key, val) => {
    const next = { ...parts, [key]: val || '*' };
    setParts(next);
    onChange(`${next.min} ${next.hr} ${next.dom} ${next.mon} ${next.dow}`);
  };

  return (
    <div className="cron-gen">
      <div className="cron-gen__presets">
        {CRON_PRESETS.map((p) => (
          <button
            key={p.value}
            className={`cron-gen__preset-btn ${(!showCustom && value === p.value) ? 'cron-gen__preset-btn--active' : ''}`}
            onClick={() => handlePreset(p.value)}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="cron-gen__expression">
        <code className="cron-gen__display">{value || '* * * * *'}</code>
      </div>

      {showCustom && (
        <div className="cron-gen__fields">
          {[
            { key: 'min', label: 'Min',   placeholder: '0-59' },
            { key: 'hr',  label: 'Hour',  placeholder: '0-23' },
            { key: 'dom', label: 'Day',   placeholder: '1-31' },
            { key: 'mon', label: 'Month', placeholder: '1-12' },
            { key: 'dow', label: 'Weekday',placeholder: '0-6' },
          ].map(({ key, label, placeholder }) => (
            <div key={key} className="cron-gen__field">
              <label className="cron-gen__field-label">{label}</label>
              <input
                className="prop-input prop-input--sm"
                value={parts[key]}
                onChange={(e) => handlePart(key, e.target.value)}
                placeholder={placeholder}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Timeout Watchdog Control ─────────────────────────────────────────────────
const TIMEOUT_UNITS = [
  { label: 'ms', factor: 1 },
  { label: 's',  factor: 1000 },
  { label: 'm',  factor: 60000 },
];

function TimeoutControl({ value_ms, onChange }) {
  const [unit, setUnit] = useState(() => {
    if (value_ms >= 60000) return 'm';
    if (value_ms >= 1000)  return 's';
    return 'ms';
  });
  const factor = TIMEOUT_UNITS.find((u) => u.label === unit)?.factor || 1;
  const display = value_ms > 0 ? Math.round(value_ms / factor) : '';

  return (
    <div className="timeout-ctrl">
      <input
        type="number"
        className="prop-input prop-input--timeout"
        value={display}
        min={0}
        placeholder="0"
        onChange={(e) => {
          const num = parseFloat(e.target.value) || 0;
          onChange(Math.round(num * factor));
        }}
      />
      <div className="timeout-ctrl__units">
        {TIMEOUT_UNITS.map(({ label }) => (
          <button
            key={label}
            className={`timeout-ctrl__unit-btn ${unit === label ? 'timeout-ctrl__unit-btn--active' : ''}`}
            onClick={() => setUnit(label)}
          >
            {label}
          </button>
        ))}
      </div>
      {value_ms > 0 && (
        <span className="timeout-ctrl__ms-hint">{value_ms.toLocaleString()} ms</span>
      )}
    </div>
  );
}

// ─── Main Properties Panel ────────────────────────────────────────────────────
export default function PropertiesPanel() {
  const { selectedNode, updateNodeData, deleteNode, workflowMeta, setSelectedNode } = useWorkflow();
  const [localScript, setLocalScript] = useState('');

  // Sync local script state when selection changes
  const node = selectedNode;
  const isCustom = node?.data?.nodeKind === 'CUSTOM';
  const isStart = node?.data?.nodeKind === 'START';
  const isEnd = node?.data?.nodeKind === 'END';

  if (!node) {
    return (
      <div className="props-panel props-panel--empty">
        <div className="props-panel__empty-icon">⬡</div>
        <p className="props-panel__empty-title">No element selected</p>
        <p className="props-panel__empty-sub">Click any node on the canvas to inspect and configure its properties.</p>
      </div>
    );
  }

  const update = (patch) => updateNodeData(node.id, patch);

  return (
    <div className="props-panel">
      {/* Node header */}
      <div className="props-panel__header">
        <div className="props-panel__header-left">
          <span className={`props-panel__kind-badge props-panel__kind-badge--${node.data.nodeKind?.toLowerCase()}`}>
            {node.data.nodeKind}
          </span>
          <input
            className="props-panel__label-input"
            value={node.data.label || ''}
            onChange={(e) => update({ label: e.target.value })}
            placeholder="Node label…"
          />
        </div>
        <button className="props-panel__close" onClick={() => setSelectedNode(null)} title="Deselect">✕</button>
      </div>

      <div className="props-panel__body">
        {/* Node ID (read-only) */}
        <div className="prop-group">
          <label className="prop-label">Node ID</label>
          <code className="prop-id">{node.id}</code>
        </div>

        {/* ── GLOBAL SCHEDULE (START node) ─────────────────────────── */}
        {isStart && (
          <div className="prop-group prop-group--section">
            <div className="prop-group__section-header">
              <Clock size={12} />
              <span>Global Schedule</span>
            </div>
            <p className="prop-hint">Root cron expression synced to the workflow <code>schedule</code> field.</p>
            <CronGenerator
              value={node.data.schedule || '* * * * *'}
              onChange={(cron) => update({ schedule: cron })}
            />
          </div>
        )}

        {/* ── CUSTOM COMMAND TEXTAREA ───────────────────────────────── */}
        {isCustom && (
          <div className="prop-group prop-group--section">
            <div className="prop-group__section-header">
              <Terminal size={12} />
              <span>Shell Script / Command</span>
            </div>
            <p className="prop-hint">Raw shell string passed directly to the C++ subprocess executor. Supports multi-line scripts, compiler hooks, and chained commands.</p>
            <textarea
              className="prop-script-editor"
              value={node.data.script || ''}
              onChange={(e) => update({ script: e.target.value })}
              placeholder={`# Examples:\necho "Hello Automation Engine"\nmkdir -p build && g++ main.cpp -o app\nbash ./deploy.sh --env production`}
              rows={8}
              spellCheck={false}
            />
          </div>
        )}

        {/* ── COMMAND (non-custom, non-start/end) ──────────────────── */}
        {!isCustom && !isStart && !isEnd && (
          <div className="prop-group">
            <label className="prop-label">Command</label>
            <input
              className="prop-input"
              value={node.data.command || ''}
              onChange={(e) => update({ command: e.target.value })}
              placeholder="e.g. echo 'step complete'"
            />
          </div>
        )}

        {/* ── TASK WATCHDOG TIMEOUT ─────────────────────────────────── */}
        {!isEnd && (
          <div className="prop-group prop-group--section">
            <div className="prop-group__section-header">
              <RefreshCw size={12} />
              <span>Watchdog Timeout</span>
            </div>
            <p className="prop-hint">C++ thread pool kills this subprocess if it exceeds the duration. Set to <code>0</code> to disable.</p>
            <TimeoutControl
              value_ms={node.data.timeout_ms || 0}
              onChange={(ms) => update({ timeout_ms: ms })}
            />
          </div>
        )}

        {/* ── DELETE NODE ───────────────────────────────────────────── */}
        {!isStart && !isEnd && (
          <div className="prop-group prop-group--danger">
            <button
              className="prop-delete-btn"
              onClick={() => deleteNode(node.id)}
            >
              <Trash2 size={13} />
              Remove Node
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
