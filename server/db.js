const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'mathgame.db');
const db = new Database(DB_PATH);

// Enable WAL mode for better concurrent performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    level INTEGER DEFAULT 1,
    xp INTEGER DEFAULT 0,
    total_games INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    profile_id INTEGER,
    mode TEXT NOT NULL,
    difficulty TEXT,
    operator TEXT,
    correct INTEGER DEFAULT 0,
    total_questions INTEGER DEFAULT 0,
    accuracy REAL DEFAULT 0,
    score INTEGER DEFAULT 0,
    duration_ms INTEGER DEFAULT 0,
    battle_result TEXT,
    opponent_name TEXT,
    date TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (profile_id) REFERENCES profiles(id)
  );

  CREATE TABLE IF NOT EXISTS leaderboard (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    score INTEGER NOT NULL,
    accuracy REAL DEFAULT 0,
    mode TEXT,
    level INTEGER DEFAULT 1,
    date TEXT DEFAULT (datetime('now'))
  );
`);

// Insert default leaderboard entries if empty
const count = db.prepare('SELECT COUNT(*) as c FROM leaderboard').get();
if (count.c === 0) {
  const insert = db.prepare(`
    INSERT INTO leaderboard (username, score, accuracy, mode, level)
    VALUES (?, ?, ?, ?, ?)
  `);
  [
    ['ROBOTFELIX', 2840, 95, 'Time Attack', 12],
    ['CYBERMATH',  2610, 88, 'Classic',    10],
    ['N3UROHACK',  2400, 91, 'Battle',      9],
    ['QUANTUMX',   2200, 84, 'Time Attack',  8],
    ['ZEROC0DE',   1980, 79, 'Classic',      7],
  ].forEach(r => insert.run(...r));
}

// ─── Profile helpers ────────────────────────────────────────────────────────
const getProfile = db.prepare('SELECT * FROM profiles WHERE username = ?');
const upsertProfile = db.prepare(`
  INSERT INTO profiles (username, level, xp, total_games)
  VALUES (@username, @level, @xp, @total_games)
  ON CONFLICT(username) DO UPDATE SET
    level = excluded.level,
    xp = excluded.xp,
    total_games = excluded.total_games
`);

// ─── Session helpers ─────────────────────────────────────────────────────────
const insertSession = db.prepare(`
  INSERT INTO sessions
    (profile_id, mode, difficulty, operator, correct, total_questions,
     accuracy, score, duration_ms, battle_result, opponent_name)
  VALUES
    (@profile_id, @mode, @difficulty, @operator, @correct, @total_questions,
     @accuracy, @score, @duration_ms, @battle_result, @opponent_name)
`);

const getSessionsByUsername = db.prepare(`
  SELECT s.* FROM sessions s
  JOIN profiles p ON p.id = s.profile_id
  WHERE p.username = ?
  ORDER BY s.date DESC
  LIMIT 30
`);

// ─── Leaderboard helpers ─────────────────────────────────────────────────────
const getLeaderboard = db.prepare(`
  SELECT username, MAX(score) as score, accuracy, mode, level
  FROM leaderboard
  GROUP BY username
  ORDER BY score DESC
  LIMIT 10
`);

const insertLeaderboard = db.prepare(`
  INSERT INTO leaderboard (username, score, accuracy, mode, level)
  VALUES (@username, @score, @accuracy, @mode, @level)
`);

module.exports = {
  db,
  getProfile,
  upsertProfile,
  insertSession,
  getSessionsByUsername,
  getLeaderboard,
  insertLeaderboard,
};
