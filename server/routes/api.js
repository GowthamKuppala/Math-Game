const express = require('express');
const router = express.Router();
const {
  getProfile, upsertProfile,
  insertSession, getSessionsByUsername,
  getLeaderboard, insertLeaderboard,
} = require('../db');

// ─── Profile ────────────────────────────────────────────────────────────────
router.get('/profile/:username', (req, res) => {
  try {
    const profile = getProfile.get(req.params.username);
    if (!profile) {
      // Auto-create default profile on first visit
      upsertProfile.run({ username: req.params.username, level: 1, xp: 0, total_games: 0 });
      return res.json(getProfile.get(req.params.username));
    }
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/profile', (req, res) => {
  try {
    const { username, level, xp, total_games } = req.body;
    upsertProfile.run({ username, level, xp, total_games });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Sessions ───────────────────────────────────────────────────────────────
router.get('/sessions/:username', (req, res) => {
  try {
    const sessions = getSessionsByUsername.all(req.params.username);
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/sessions', (req, res) => {
  try {
    const {
      username, mode, difficulty, operator,
      correct, total_questions, accuracy, score,
      duration_ms, battle_result, opponent_name,
    } = req.body;

    // Get or create profile
    let profile = getProfile.get(username);
    if (!profile) {
      upsertProfile.run({ username, level: 1, xp: 0, total_games: 0 });
      profile = getProfile.get(username);
    }

    // Insert session
    const info = insertSession.run({
      profile_id: profile.id,
      mode, difficulty, operator,
      correct, total_questions, accuracy, score,
      duration_ms,
      battle_result: battle_result || null,
      opponent_name: opponent_name || null,
    });

    // Update profile XP and game count
    const xpGain = Math.floor(score / 10);
    const newXp = (profile.xp + xpGain) % 100;
    const levelsGained = Math.floor((profile.xp + xpGain) / 100);
    upsertProfile.run({
      username,
      level: profile.level + levelsGained,
      xp: newXp,
      total_games: profile.total_games + 1,
    });

    // Update leaderboard
    insertLeaderboard.run({
      username,
      score,
      accuracy,
      mode,
      level: profile.level + levelsGained,
    });

    res.json({ ok: true, session_id: info.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Leaderboard ─────────────────────────────────────────────────────────────
router.get('/leaderboard', (req, res) => {
  try {
    const board = getLeaderboard.all();
    res.json(board);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
