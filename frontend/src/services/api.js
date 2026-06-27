/**
 * api.js — Automation Engine API Client
 * Automatically attaches cached Bearer JWT tokens to every request.
 * Exposes helpers for auth, workflow execution, schema sync, and log streaming.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

// ─── Token Cache ───────────────────────────────────────────────────────────────
const TOKEN_KEY = 'ae_access_token';
const DAEMON_KEY = 'ae_daemon_key';

export const tokenCache = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token) => localStorage.setItem(TOKEN_KEY, token),
  clearToken: () => localStorage.removeItem(TOKEN_KEY),
  getDaemonKey: () => localStorage.getItem(DAEMON_KEY),
  setDaemonKey: (key) => localStorage.setItem(DAEMON_KEY, key),
  clearDaemonKey: () => localStorage.removeItem(DAEMON_KEY),
  isAuthenticated: () => !!localStorage.getItem(TOKEN_KEY),
};

// ─── Core Fetch Client ─────────────────────────────────────────────────────────
async function apiFetch(endpoint, options = {}) {
  const token = tokenCache.getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Auto-clear stale token on 401
  if (response.status === 401) {
    tokenCache.clearToken();
    throw new APIError('Unauthorized — token expired or invalid.', 401);
  }

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ message: response.statusText }));
    throw new APIError(errorBody.message || 'Request failed', response.status);
  }

  // Return raw response for streaming endpoints
  if (options._raw) return response;

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  return response.text();
}

class APIError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
    this.name = 'APIError';
  }
}

// ─── Auth Endpoints ────────────────────────────────────────────────────────────

/**
 * Validate a daemon key against the C++ backend security module.
 * On 200 OK, caches the returned JWT and daemon key.
 */
export async function validateDaemonKey(daemonKey) {
  // MOCK VALIDATION: Simulating C++ backend for UI testing
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (daemonKey.length > 3) {
        const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock_token';
        tokenCache.setToken(fakeToken);
        tokenCache.setDaemonKey(daemonKey);
        resolve({ token: fakeToken, status: 'success' });
      } else {
        reject(new APIError('Invalid Daemon Key. Must be at least 4 characters.', 401));
      }
    }, 800);
  });
}

/**
 * Refresh the current JWT using the cached daemon key.
 */
export async function refreshToken() {
  const daemonKey = tokenCache.getDaemonKey();
  if (!daemonKey) throw new APIError('No daemon key cached for refresh.', 400);
  return validateDaemonKey(daemonKey);
}

/**
 * Logout — clears all cached credentials.
 */
export function logout() {
  tokenCache.clearToken();
  tokenCache.clearDaemonKey();
}

// ─── Workflow Endpoints ────────────────────────────────────────────────────────

/**
 * Fetch the current workflow schema from the backend.
 */
export async function fetchWorkflowSchema() {
  return apiFetch('/workflow/schema');
}

/**
 * Push an updated workflow schema to the backend.
 * Triggers the C++ parser to reload.
 */
export async function pushWorkflowSchema(schema) {
  return apiFetch('/workflow/schema', {
    method: 'PUT',
    body: JSON.stringify(schema),
  });
}

/**
 * Execute the current workflow.
 * Requires a valid Bearer token — caller must ensure auth before calling.
 */
export async function executeWorkflow(schema) {
  return apiFetch('/workflow/execute', {
    method: 'POST',
    body: JSON.stringify(schema),
  });
}

/**
 * Abort the currently running workflow execution.
 */
export async function abortWorkflow() {
  return apiFetch('/workflow/abort', { method: 'POST' });
}

// ─── Log Streaming ─────────────────────────────────────────────────────────────

/**
 * Open a Server-Sent Events stream for real-time backend stdout logs.
 * Returns an EventSource instance for the caller to manage.
 */
export function openLogStream(onMessage, onError) {
  const token = tokenCache.getToken();
  const url = `${BASE_URL}/logs/stream${token ? `?token=${encodeURIComponent(token)}` : ''}`;

  const source = new EventSource(url);

  source.onmessage = (event) => {
    onMessage(event.data);
  };

  source.onerror = (err) => {
    if (onError) onError(err);
    source.close();
  };

  return source;
}

/**
 * Fetch a snapshot of the recent log buffer (non-streaming).
 */
export async function fetchLogs(limit = 200) {
  return apiFetch(`/logs/recent?limit=${limit}`);
}

// ─── System Health ─────────────────────────────────────────────────────────────

/**
 * Fetch system health metrics from the C++ backend.
 */
export async function fetchSystemHealth() {
  return apiFetch('/system/health');
}

// ─── Integrations ──────────────────────────────────────────────────────────────

/**
 * List registered integrations.
 */
export async function fetchIntegrations() {
  return apiFetch('/integrations');
}

export { APIError };
export default apiFetch;
