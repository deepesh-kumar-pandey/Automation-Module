import { LayoutDashboard, GitBranch, ScrollText, Plug, Activity, LogOut, ShieldCheck, ShieldOff } from 'lucide-react';
import { useWorkflow } from '../../context/WorkflowContext';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  { id: 'dashboard',   label: 'Dashboard',      icon: LayoutDashboard },
  { id: 'workflows',   label: 'Workflows',       icon: GitBranch },
  { id: 'logs',        label: 'Logs',            icon: ScrollText },
  { id: 'integrations',label: 'Integrations',   icon: Plug },
  { id: 'health',      label: 'System Health',  icon: Activity },
];

export default function NavRail() {
  const { activeView, setActiveView } = useWorkflow();
  const { isAuthenticated, logout } = useAuth();

  return (
    <nav className="nav-rail">
      {/* Logo / Brand */}
      <div className="nav-rail__brand">
        <div className="nav-rail__logo">
          <span className="nav-rail__logo-mark">AE</span>
        </div>
        <div className="nav-rail__brand-text">
          <span className="nav-rail__brand-name">AutoEngine</span>
          <span className="nav-rail__brand-sub">v1.0.0</span>
        </div>
      </div>

      <div className="nav-rail__divider" />

      {/* Nav Links */}
      <ul className="nav-rail__list">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
          <li key={id}>
            <button
              className={`nav-rail__item ${activeView === id ? 'nav-rail__item--active' : ''}`}
              onClick={() => setActiveView(id)}
              title={label}
            >
              <Icon size={16} strokeWidth={1.75} />
              <span className="nav-rail__item-label">{label}</span>
            </button>
          </li>
        ))}
      </ul>

      <div className="nav-rail__spacer" />
      <div className="nav-rail__divider" />

      {/* Auth Status */}
      <div className="nav-rail__auth">
        <div className={`nav-rail__auth-status ${isAuthenticated ? 'nav-rail__auth-status--ok' : 'nav-rail__auth-status--warn'}`}>
          {isAuthenticated
            ? <><ShieldCheck size={13} /> <span>Daemon Active</span></>
            : <><ShieldOff size={13} /> <span>No Token</span></>
          }
        </div>
        {isAuthenticated && (
          <button className="nav-rail__logout" onClick={logout} title="Log out">
            <LogOut size={14} />
            <span>Logout</span>
          </button>
        )}
      </div>
    </nav>
  );
}
