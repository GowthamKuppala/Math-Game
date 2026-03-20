import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  fetchProfile, saveProfile as apiSaveProfile,
  fetchSessions, fetchLeaderboard, checkBackend,
} from '../utils/api';

// Fallback defaults when backend is offline
const DEFAULT_PROFILE = { username: 'PLAYER01', level: 1, xp: 0, total_games: 0 };
const DEFAULT_LEADERBOARD = [
  { username: 'ROBOTFELIX', score: 2840, accuracy: 95, mode: 'Time Attack', level: 12 },
  { username: 'CYBERMATH',  score: 2610, accuracy: 88, mode: 'Classic',    level: 10 },
  { username: 'N3UROHACK',  score: 2400, accuracy: 91, mode: 'Battle',      level:  9 },
];

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [currentPage, setCurrentPage]   = useState('home');
  const [profile, setProfile]           = useState(DEFAULT_PROFILE);
  const [sessions, setSessions]         = useState([]);
  const [leaderboard, setLeaderboard]   = useState(DEFAULT_LEADERBOARD);
  const [backendOnline, setBackendOnline] = useState(false);
  const [loading, setLoading]           = useState(true);

  // Game setup
  const [gameSetup, setGameSetup] = useState({
    mode: 'classic',
    operator: '+',
    difficulty: 'medium',
    // battle sub-mode: 'computer' | 'friend'
    battleOpponent: 'computer',
  });

  // Active game / room state
  const [gameState, setGameState]   = useState(null);
  const [roomState, setRoomState]   = useState(null); // { code, questions, opponent }

  // ── Load everything from backend on mount ──────────────────────────────────
  useEffect(() => {
    async function init() {
      const online = await checkBackend();
      setBackendOnline(online);

      if (online) {
        const storedUsername = localStorage.getItem('mathgame_username') || 'PLAYER01';
        const [profileData, sessionsData, leaderboardData] = await Promise.all([
          fetchProfile(storedUsername),
          fetchSessions(storedUsername),
          fetchLeaderboard(),
        ]);
        if (profileData) setProfile(profileData);
        if (sessionsData) setSessions(sessionsData);
        if (leaderboardData) setLeaderboard(leaderboardData);
      }
      setLoading(false);
    }
    init();
  }, []);

  // ── Update profile ─────────────────────────────────────────────────────────
  const updateProfile = useCallback(async (updates) => {
    const newProfile = { ...profile, ...updates };
    setProfile(newProfile);
    localStorage.setItem('mathgame_username', newProfile.username);
    if (backendOnline) await apiSaveProfile(newProfile);
  }, [profile, backendOnline]);

  // ── Refresh data from backend ─────────────────────────────────────────────
  const refreshSessions = useCallback(async () => {
    if (!backendOnline) return;
    const data = await fetchSessions(profile.username);
    if (data) setSessions(data);
  }, [backendOnline, profile.username]);

  const refreshLeaderboard = useCallback(async () => {
    if (!backendOnline) return;
    const data = await fetchLeaderboard();
    if (data) setLeaderboard(data);
  }, [backendOnline]);

  return (
    <AppContext.Provider value={{
      currentPage, setCurrentPage,
      profile, setProfile, updateProfile,
      sessions, setSessions, refreshSessions,
      leaderboard, setLeaderboard, refreshLeaderboard,
      backendOnline,
      loading,
      gameSetup, setGameSetup,
      gameState, setGameState,
      roomState, setRoomState,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
