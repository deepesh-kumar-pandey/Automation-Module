import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { tokenCache, validateDaemonKey, logout as apiLogout } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => tokenCache.isAuthenticated());
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [isValidating, setIsValidating] = useState(false);

  // Pending action cache — stores the function to resume after successful auth
  const pendingActionRef = useRef(null);

  /**
   * Intercepts any action that requires a valid token.
   * If no token present, caches the action and opens the security modal.
   * After auth succeeds, automatically re-runs the cached action.
   */
  const requireAuth = useCallback((action) => {
    if (tokenCache.isAuthenticated()) {
      action();
    } else {
      pendingActionRef.current = action;
      setShowSecurityModal(true);
    }
  }, []);

  /**
   * Validate daemon key against backend; on success resume pending action.
   */
  const submitDaemonKey = useCallback(async (daemonKey) => {
    setIsValidating(true);
    setAuthError(null);
    try {
      await validateDaemonKey(daemonKey);
      setIsAuthenticated(true);
      setShowSecurityModal(false);

      // Auto-resume the cached pending action
      if (pendingActionRef.current) {
        const pendingAction = pendingActionRef.current;
        pendingActionRef.current = null;
        // Small delay to let modal close animation finish
        setTimeout(() => pendingAction(), 350);
      }
    } catch (err) {
      setAuthError(err.message || 'Validation failed. Check your Daemon Key.');
    } finally {
      setIsValidating(false);
    }
  }, []);

  const dismissModal = useCallback(() => {
    setShowSecurityModal(false);
    setAuthError(null);
    pendingActionRef.current = null;
  }, []);

  const logout = useCallback(() => {
    apiLogout();
    setIsAuthenticated(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        showSecurityModal,
        authError,
        isValidating,
        requireAuth,
        submitDaemonKey,
        dismissModal,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
