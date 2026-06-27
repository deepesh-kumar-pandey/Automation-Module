import { useState, useEffect, useRef } from 'react';
import { Shield, X, Eye, EyeOff, AlertTriangle, Loader2, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function SystemAccessModal() {
  const { showSecurityModal, authError, isValidating, submitDaemonKey, dismissModal } = useAuth();
  const [daemonKey, setDaemonKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const inputRef = useRef(null);

  // Focus input when modal opens
  useEffect(() => {
    if (showSecurityModal) {
      setDaemonKey('');
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [showSecurityModal]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!daemonKey.trim() || isValidating) return;
    submitDaemonKey(daemonKey.trim());
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) dismissModal();
  };

  if (!showSecurityModal) return null;

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">

        {/* Close */}
        <button className="modal__close" onClick={dismissModal} aria-label="Dismiss">
          <X size={15} />
        </button>

        {/* Icon */}
        <div className="modal__icon-ring">
          <Shield size={28} strokeWidth={1.5} className="modal__shield-icon" />
        </div>

        {/* Titles */}
        <h2 className="modal__title" id="modal-title">System Access Required</h2>
        <p className="modal__subtitle">
          This action requires a valid Daemon Validation Key to authorize the execution payload.
          The pending workflow will automatically resume upon successful authentication.
        </p>

        {/* Interceptor notice */}
        <div className="modal__intercept-notice">
          <div className="modal__intercept-dot" />
          <span>Execution payload intercepted — cached &amp; awaiting clearance</span>
        </div>

        {/* Form */}
        <form className="modal__form" onSubmit={handleSubmit}>
          <div className="modal__field">
            <label className="modal__label" htmlFor="daemon-key-input">
              Daemon Validation Key
            </label>
            <div className="modal__input-row">
              <input
                id="daemon-key-input"
                ref={inputRef}
                type={showKey ? 'text' : 'password'}
                className={`modal__input ${authError ? 'modal__input--error' : ''}`}
                value={daemonKey}
                onChange={(e) => setDaemonKey(e.target.value)}
                placeholder="Enter your daemon key…"
                autoComplete="off"
                disabled={isValidating}
              />
              <button
                type="button"
                className="modal__eye-btn"
                onClick={() => setShowKey((p) => !p)}
                aria-label={showKey ? 'Hide key' : 'Show key'}
              >
                {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>

            {authError && (
              <div className="modal__error-row">
                <AlertTriangle size={12} />
                <span>{authError}</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="modal__submit-btn"
            disabled={!daemonKey.trim() || isValidating}
          >
            {isValidating ? (
              <><Loader2 size={14} className="modal__spinner" /> Validating…</>
            ) : (
              <><CheckCircle size={14} /> Authorize &amp; Resume Execution</>
            )}
          </button>

          <button type="button" className="modal__cancel-btn" onClick={dismissModal}>
            Cancel — discard pending action
          </button>
        </form>

        {/* Footer note */}
        <p className="modal__footer-note">
          Credentials are validated against the C++ backend security module.
          Your JWT is cached in session storage and never transmitted in plain text.
        </p>
      </div>
    </div>
  );
}
