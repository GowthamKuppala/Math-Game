const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api';

async function apiFetch(path, options = {}) {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    if (!res.ok) throw new Error(`API error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[api] fetch failed, using fallback:', err.message);
    return null;
  }
}

// ─── Profile ─────────────────────────────────────────────────────────────────
export async function fetchProfile(username) {
  return apiFetch(`/profile/${encodeURIComponent(username)}`);
}

export async function saveProfile(profile) {
  return apiFetch('/profile', {
    method: 'POST',
    body: JSON.stringify(profile),
  });
}

// ─── Sessions ────────────────────────────────────────────────────────────────
export async function fetchSessions(username) {
  return apiFetch(`/sessions/${encodeURIComponent(username)}`);
}

export async function saveSession(session) {
  return apiFetch('/sessions', {
    method: 'POST',
    body: JSON.stringify(session),
  });
}

// ─── Leaderboard ─────────────────────────────────────────────────────────────
export async function fetchLeaderboard() {
  return apiFetch('/leaderboard');
}

// ─── Health check ────────────────────────────────────────────────────────────
export async function checkBackend() {
  const result = await apiFetch('/health');
  return result !== null;
}
