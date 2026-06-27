import { useState, useEffect, useRef } from 'react';
import { Save, X, Trash2, FolderOpen, FilePlus } from 'lucide-react';
import { useWorkflow } from '../../context/WorkflowContext';

export default function SaveWorkflowModal({ isOpen, onClose, mode }) {
  const { workflowMeta, savedWorkflows, saveCurrentWorkflow, loadWorkflow, createNewWorkflow } = useWorkflow();
  const [name, setName] = useState('');
  const [toast, setToast] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setName(workflowMeta?.name || 'My Workflow');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, workflowMeta?.name]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    saveCurrentWorkflow(trimmed);
    showToast(`✓ Workflow "${trimmed}" saved`);
    setTimeout(onClose, 800);
  };

  const handleLoad = (wfName) => {
    loadWorkflow(wfName);
    showToast(`✓ Loaded "${wfName}"`);
    setTimeout(onClose, 600);
  };

  const handleDelete = (wfName) => {
    const stored = JSON.parse(localStorage.getItem('ae_saved_workflows') || '{}');
    delete stored[wfName];
    localStorage.setItem('ae_saved_workflows', JSON.stringify(stored));
    // force reload of savedWorkflows by dispatching a storage event workaround
    window.dispatchEvent(new Event('storage'));
    showToast(`Deleted "${wfName}"`, 'warn');
  };

  const handleNew = () => {
    createNewWorkflow();
    showToast('✓ New blank workflow created');
    setTimeout(onClose, 600);
  };

  if (!isOpen) return null;

  const savedNames = Object.keys(savedWorkflows || {});

  return (
    <div
      className="swm-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div style={{
        background: 'var(--bg-surface, #1e2130)',
        border: '1px solid var(--border, #2d3148)',
        borderRadius: '12px',
        width: '420px',
        maxHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px', borderBottom: '1px solid var(--border, #2d3148)',
        }}>
          <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: 'var(--text-main, #e2e8f0)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Save size={15} style={{ color: '#3b82f6' }} /> Workflow Manager
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim, #94a3b8)', padding: '4px' }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
          {/* Save section */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: 'var(--text-dim, #94a3b8)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
              Save Current Workflow
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                ref={inputRef}
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                placeholder="Workflow name..."
                style={{
                  flex: 1,
                  background: 'var(--bg-base, #141622)',
                  border: '1px solid var(--border, #2d3148)',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  color: 'var(--text-main, #e2e8f0)',
                  fontSize: '13px',
                  outline: 'none',
                }}
              />
              <button
                onClick={handleSave}
                style={{
                  background: '#3b82f6',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Save size={13} /> Save
              </button>
            </div>
          </div>

          {/* New Workflow */}
          <div style={{ marginBottom: '24px' }}>
            <button
              onClick={handleNew}
              style={{
                width: '100%',
                background: 'var(--bg-base, #141622)',
                border: '1px dashed var(--border, #2d3148)',
                borderRadius: '6px',
                padding: '10px',
                cursor: 'pointer',
                color: 'var(--text-dim, #94a3b8)',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'border-color 0.2s, color 0.2s',
              }}
              onMouseOver={(e) => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.color = '#3b82f6'; }}
              onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--border, #2d3148)'; e.currentTarget.style.color = 'var(--text-dim, #94a3b8)'; }}
            >
              <FilePlus size={14} /> New Blank Workflow
            </button>
          </div>

          {/* Saved workflows list */}
          {savedNames.length > 0 && (
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: 'var(--text-dim, #94a3b8)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
                Saved Workflows ({savedNames.length})
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {savedNames.map((wfName) => (
                  <div
                    key={wfName}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      background: 'var(--bg-base, #141622)',
                      border: '1px solid var(--border, #2d3148)',
                      borderRadius: '6px',
                      padding: '8px 12px',
                    }}
                  >
                    <span style={{ fontSize: '13px', color: 'var(--text-main, #e2e8f0)', fontWeight: '500' }}>{wfName}</span>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => handleLoad(wfName)}
                        title="Load this workflow"
                        style={{ background: 'none', border: '1px solid var(--border, #2d3148)', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer', color: '#3b82f6', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <FolderOpen size={11} /> Load
                      </button>
                      <button
                        onClick={() => handleDelete(wfName)}
                        title="Delete"
                        style={{ background: 'none', border: '1px solid var(--border, #2d3148)', borderRadius: '4px', padding: '4px 6px', cursor: 'pointer', color: '#ef4444' }}
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {savedNames.length === 0 && (
            <p style={{ fontSize: '12px', color: 'var(--text-dim, #94a3b8)', textAlign: 'center', margin: '8px 0 0' }}>
              No saved workflows yet. Save one above!
            </p>
          )}
        </div>

        {/* Toast */}
        {toast && (
          <div style={{
            position: 'absolute',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: toast.type === 'warn' ? '#f59e0b' : '#22c55e',
            color: '#000',
            padding: '8px 18px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '600',
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
          }}>
            {toast.msg}
          </div>
        )}
      </div>
    </div>
  );
}
