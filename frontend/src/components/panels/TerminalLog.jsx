import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, ChevronUp, Terminal, Trash2, X } from 'lucide-react';
import { useWorkflow } from '../../context/WorkflowContext';

const MOCK_LOGS = [
  { t: '12:30:01', level: 'INFO',  msg: 'Automation Engine: ONLINE' },
  { t: '12:30:01', level: 'INFO',  msg: 'Security module initialized with engine key.' },
  { t: '12:30:02', level: 'INFO',  msg: 'VariableManager ready. user=Deepesh, engine_mode=High-Performance' },
  { t: '12:30:02', level: 'INFO',  msg: 'Parsing workflow from shared/workflow_schema.json …' },
  { t: '12:30:02', level: 'INFO',  msg: 'Found 4 steps. Running Static Security Audit…' },
  { t: '12:30:03', level: 'OK',    msg: 'Security audit passed cleanly. Initializing Worker…' },
  { t: '12:30:03', level: 'EXEC',  msg: '[Step 1] Executing: echo \'Workflow started at\' && date' },
  { t: '12:30:03', level: 'OUT',   msg: 'Workflow started at Sun Jun  8 12:30:03 IST 2026' },
  { t: '12:30:04', level: 'EXEC',  msg: '[Step 2] Executing: mkdir -p output_folder' },
  { t: '12:30:04', level: 'OK',    msg: '[Step 2] Completed in 12ms' },
  { t: '12:30:04', level: 'EXEC',  msg: '[Step 3] Executing: echo \'=== Automation Engine Output ==\'' },
  { t: '12:30:05', level: 'OK',    msg: 'Engine sequence execution loop completed.' },
  { t: '12:30:05', level: 'INFO',  msg: 'Automation Engine: OFFLINE' },
];

const LEVEL_COLORS = {
  INFO:  { fg: '#94a3b8', label: 'INFO ' },
  OK:    { fg: '#4ade80', label: ' OK  ' },
  EXEC:  { fg: '#60a5fa', label: 'EXEC ' },
  OUT:   { fg: '#e2e8f0', label: ' OUT ' },
  WARN:  { fg: '#fbbf24', label: 'WARN ' },
  ERROR: { fg: '#f87171', label: 'ERROR' },
};

export default function TerminalLog({ isExecuting }) {
  const [collapsed, setCollapsed] = useState(false);
  const [logs, setLogs] = useState(MOCK_LOGS);
  const [filter, setFilter] = useState('ALL');
  const bottomRef = useRef(null);
  const intervalRef = useRef(null);

  const { nodes } = useWorkflow();

  // Simulate live log streaming when executing
  useEffect(() => {
    if (!isExecuting) {
      clearInterval(intervalRef.current);
      return;
    }
    
    // Generate dynamic mock logs based on actual canvas nodes
    const execLines = [
      { level: 'EXEC', msg: 'Starting workflow execution sequence…' },
      { level: 'INFO', msg: `Thread pool spawned. Analyzed ${nodes.length} nodes.` },
    ];

    nodes.forEach((n, idx) => {
      if (n.data.nodeKind !== 'START' && n.data.nodeKind !== 'END') {
        const cmd = n.data.script || n.data.command || 'internal operation';
        execLines.push({ level: 'EXEC', msg: `[Step ${idx}] Dispatching: ${cmd}` });
        
        // Give a fake output if it's uname
        if (cmd.includes('uname')) {
          execLines.push({ level: 'OUT', msg: 'stdout: Linux 6.2.0-generic x86_64' });
        } else {
          execLines.push({ level: 'OUT', msg: 'stdout: task completed successfully' });
        }
        execLines.push({ level: 'OK', msg: `Watchdog cleared. Node '${n.data.label}' finished.` });
      }
    });
    
    execLines.push({ level: 'INFO', msg: 'Automation Engine execution loop complete.' });

    let i = 0;
    intervalRef.current = setInterval(() => {
      if (i >= execLines.length) { clearInterval(intervalRef.current); return; }
      const now = new Date().toTimeString().slice(0, 8);
      setLogs((prev) => [...prev, { t: now, ...execLines[i] }]);
      i++;
    }, 400);
    return () => clearInterval(intervalRef.current);
  }, [isExecuting, nodes]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (!collapsed && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, collapsed]);

  const clearLogs = useCallback(() => setLogs([]), []);

  const filteredLogs = filter === 'ALL' ? logs : logs.filter((l) => l.level === filter);

  return (
    <div className={`terminal ${collapsed ? 'terminal--collapsed' : ''}`}>
      {/* Header bar */}
      <div className="terminal__header">
        <div className="terminal__header-left">
          <Terminal size={13} />
          <span className="terminal__title">Engine stdout</span>
          <div className="terminal__dots">
            <span className="terminal__dot terminal__dot--red" />
            <span className="terminal__dot terminal__dot--yellow" />
            <span className="terminal__dot terminal__dot--green" />
          </div>
          {isExecuting && <span className="terminal__live-badge">● LIVE</span>}
        </div>

        <div className="terminal__header-right">
          {/* Level filter */}
          {['ALL','OK','EXEC','WARN','ERROR'].map((lvl) => (
            <button
              key={lvl}
              className={`terminal__filter-btn ${filter === lvl ? 'terminal__filter-btn--active' : ''}`}
              onClick={() => setFilter(lvl)}
            >
              {lvl}
            </button>
          ))}
          <button className="terminal__icon-btn" onClick={clearLogs} title="Clear logs">
            <Trash2 size={12} />
          </button>
          <button
            className="terminal__icon-btn"
            onClick={() => setCollapsed((p) => !p)}
            title={collapsed ? 'Expand terminal' : 'Collapse terminal'}
          >
            {collapsed ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        </div>
      </div>

      {/* Log body */}
      {!collapsed && (
        <div className="terminal__body">
          {filteredLogs.length === 0 ? (
            <div className="terminal__empty">— no output —</div>
          ) : (
            filteredLogs.map((log, i) => {
              const meta = LEVEL_COLORS[log.level] || LEVEL_COLORS.INFO;
              return (
                <div key={i} className="terminal__line">
                  <span className="terminal__ts">{log.t}</span>
                  <span className="terminal__level" style={{ color: meta.fg }}>[{meta.label}]</span>
                  <span className="terminal__msg">{log.msg}</span>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>
      )}
    </div>
  );
}
