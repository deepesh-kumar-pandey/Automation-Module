import { useState, useCallback } from 'react';
import { Sun, Moon, Square, Zap, Save } from 'lucide-react';
import { useTheme } from './context/ThemeContext';
import { useAuth } from './context/AuthContext';
import { useWorkflow } from './context/WorkflowContext';
import { executeWorkflow } from './services/api';

import NavRail from './components/panels/NavRail';
import NodeCanvas from './components/canvas/NodeCanvas';
import TerminalLog from './components/panels/TerminalLog';
import SchemaViewer from './components/panels/SchemaViewer';
import PropertiesPanel from './components/panels/PropertiesPanel';
import SystemAccessModal from './components/modals/SystemAccessModal';
import SaveWorkflowModal from './components/modals/SaveWorkflowModal';

import './App.css';

// ─── Dashboard Placeholder ────────────────────────────────────────────────────
function DashboardView() {
  const { nodes, edges } = useWorkflow();
  const stats = [
    { label: 'Total Nodes', value: nodes.length, color: '#3b82f6' },
    { label: 'Connections', value: edges.length, color: '#8b5cf6' },
    { label: 'Engine Status', value: 'ONLINE', color: '#22c55e' },
    { label: 'Uptime', value: '00:00:00', color: '#f59e0b' },
  ];
  return (
    <div className="placeholder-view">
      <h2 className="placeholder-view__title">Dashboard</h2>
      <div className="stat-grid">
        {stats.map((s) => (
          <div key={s.label} className="stat-card" style={{ '--stat-color': s.color }}>
            <span className="stat-card__value">{s.value}</span>
            <span className="stat-card__label">{s.label}</span>
          </div>
        ))}
      </div>
      <p className="placeholder-view__hint">Metrics will stream from the C++ backend in production.</p>
    </div>
  );
}

function LogsView() {
  return (
    <div className="placeholder-view">
      <h2 className="placeholder-view__title">Logs</h2>
      <p className="placeholder-view__hint">Persistent log archive from <code>engine_runtime.log</code> will be streamed here via the <code>/api/v1/logs</code> endpoint.</p>
    </div>
  );
}

function IntegrationsView() {
  const integrations = [
    { name: 'GitHub Actions', status: 'connected', icon: '⬡' },
    { name: 'Slack Webhooks', status: 'disconnected', icon: '⬡' },
    { name: 'AWS S3 Sink', status: 'connected', icon: '⬡' },
    { name: 'Docker Registry', status: 'pending', icon: '⬡' },
  ];
  return (
    <div className="placeholder-view">
      <h2 className="placeholder-view__title">Integrations</h2>
      <div className="integration-list">
        {integrations.map((ig) => (
          <div key={ig.name} className="integration-item">
            <span className="integration-item__icon">{ig.icon}</span>
            <span className="integration-item__name">{ig.name}</span>
            <span className={`integration-item__badge integration-item__badge--${ig.status}`}>{ig.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function HealthView() {
  const metrics = [
    { label: 'CPU Load', value: '12%', ok: true },
    { label: 'Memory', value: '340 MB', ok: true },
    { label: 'Thread Pool', value: '4 / 8 active', ok: true },
    { label: 'Queue Depth', value: '0 pending', ok: true },
    { label: 'Last Heartbeat', value: '< 1s ago', ok: true },
    { label: 'Security Module', value: 'Operational', ok: true },
  ];
  return (
    <div className="placeholder-view">
      <h2 className="placeholder-view__title">System Health</h2>
      <div className="health-grid">
        {metrics.map((m) => (
          <div key={m.label} className="health-card">
            <div className={`health-card__dot ${m.ok ? 'health-card__dot--ok' : 'health-card__dot--err'}`} />
            <span className="health-card__label">{m.label}</span>
            <span className="health-card__value">{m.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Workflow Canvas View (main) ──────────────────────────────────────────────
function WorkflowView() {
  const { isExecuting } = useWorkflow();
  return (
    <div className="workflow-view">
      <div className="canvas-region">
        <NodeCanvas />
      </div>
      <div className="terminal-region">
        <TerminalLog isExecuting={isExecuting} />
      </div>
    </div>
  );
}

// ─── View Router ──────────────────────────────────────────────────────────────
const VIEW_MAP = {
  dashboard:    <DashboardView />,
  workflows:    <WorkflowView />,
  logs:         <LogsView />,
  integrations: <IntegrationsView />,
  health:       <HealthView />,
};

// ─── App Root ─────────────────────────────────────────────────────────────────
export default function App() {
  const { isDark, toggleTheme } = useTheme();
  const { requireAuth, isAuthenticated } = useAuth();
  const { activeView, schemaText, isExecuting, setIsExecuting, workflowMeta } = useWorkflow();

  const [saveModalOpen, setSaveModalOpen] = useState(false);

  // ── Execute Workflow with interceptor ──
  const handleExecute = useCallback(() => {
    requireAuth(async () => {
      try {
        setIsExecuting(true);
        const schema = JSON.parse(schemaText || '{}');
        await executeWorkflow(schema);
      } catch (err) {
        console.error('Execution error:', err.message);
      } finally {
        setTimeout(() => setIsExecuting(false), 4000);
      }
    });
  }, [requireAuth, schemaText, setIsExecuting]);

  const handleAbort = useCallback(() => {
    setIsExecuting(false);
  }, [setIsExecuting]);

  const showRightPanel = activeView === 'workflows';

  return (
    <div className="ae-workspace">
      {/* ── Security Modal ── */}
      <SystemAccessModal />

      {/* ── Workflow Manager Modal ── */}
      <SaveWorkflowModal
        isOpen={saveModalOpen}
        onClose={() => setSaveModalOpen(false)}
      />

      {/* ── Left Nav Rail ── */}
      <NavRail />

      {/* ── Main Content ── */}
      <div className="ae-workspace__main">

        {/* Top Header Bar */}
        <header className="ae-header">
          <div className="ae-header__left">
            <span className="ae-header__breadcrumb">
              <span className="ae-header__breadcrumb-root">Automation Engine</span>
              <span className="ae-header__breadcrumb-sep">/</span>
              <span className="ae-header__breadcrumb-page">
                {activeView.charAt(0).toUpperCase() + activeView.slice(1)}
              </span>
            </span>
            {/* Current workflow name badge */}
            {activeView === 'workflows' && workflowMeta?.name && (
              <span style={{
                marginLeft: '12px',
                fontSize: '11px',
                color: 'var(--text-dim)',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                padding: '2px 8px',
                fontWeight: '500',
              }}>
                {workflowMeta.name}
              </span>
            )}
          </div>

          <div className="ae-header__right">
            {/* Workflow Manager Button */}
            {activeView === 'workflows' && (
              <button
                id="workflow-manager-btn"
                onClick={() => setSaveModalOpen(true)}
                style={{
                  padding: '6px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  color: 'var(--text-main)',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '500',
                  marginRight: '8px',
                  transition: 'border-color 0.2s',
                }}
                onMouseOver={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                title="Save / Load / New workflow"
              >
                <Save size={13} />
                Workflows
              </button>
            )}

            {/* Execute / Abort */}
            {activeView === 'workflows' && (
              isExecuting ? (
                <button className="ae-btn ae-btn--abort" onClick={handleAbort}>
                  <Square size={13} />
                  Abort
                </button>
              ) : (
                <button className="ae-btn ae-btn--execute" onClick={handleExecute}>
                  <Zap size={13} />
                  Execute Workflow
                  {!isAuthenticated && <span className="ae-btn__auth-hint">🔒</span>}
                </button>
              )
            )}

            {/* Theme toggle */}
            <button
              className="ae-header__theme-btn"
              onClick={toggleTheme}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              title={isDark ? 'Light mode' : 'Dark mode'}
            >
              {isDark
                ? <Sun size={15} strokeWidth={1.75} />
                : <Moon size={15} strokeWidth={1.75} />
              }
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="ae-content">
          {/* Center Panel */}
          <div className="ae-center-panel">
            {VIEW_MAP[activeView] || <WorkflowView />}
          </div>

          {/* Right Panel — only on workflows view */}
          {showRightPanel && (
            <aside className="ae-right-panel">
              <div className="ae-right-panel__schema">
                <SchemaViewer />
              </div>
              <div className="ae-right-panel__props">
                <PropertiesPanel />
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
