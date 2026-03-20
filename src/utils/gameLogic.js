// Game Logic Utilities

/**
 * Generate a math question based on operator and difficulty
 */
export function generateQuestion(operator, difficulty) {
  const ranges = {
    easy: [1, 10],
    medium: [1, 50],
    hard: [1, 100],
  };
  const [min, max] = ranges[difficulty] || ranges.easy;

  const ops = operator === 'random' ? ['+', '-', '*', '/'] : [operator];
  const op = ops[Math.floor(Math.random() * ops.length)];

  let a = randInt(min, max);
  let b = randInt(min, max);

  if (op === '/') {
    // Ensure clean division
    b = randInt(1, difficulty === 'easy' ? 10 : difficulty === 'medium' ? 12 : 12);
    a = b * randInt(1, difficulty === 'easy' ? 10 : difficulty === 'medium' ? 10 : 12);
  }
  if (op === '-') {
    // Ensure non-negative result
    if (a < b) [a, b] = [b, a];
  }

  const answer = compute(a, b, op);
  const question = formatQuestion(a, b, op);
  const choices = generateChoices(answer, difficulty);

  return { question, answer, choices, operator: op };
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function compute(a, b, op) {
  switch (op) {
    case '+': return a + b;
    case '-': return a - b;
    case '*': return a * b;
    case '/': return a / b;
    default: return a + b;
  }
}

function formatQuestion(a, b, op) {
  const symbols = { '+': '+', '-': '−', '*': '×', '/': '÷' };
  return `${a} ${symbols[op]} ${b} = ?`;
}

function generateChoices(answer, difficulty) {
  const spread = difficulty === 'easy' ? 5 : difficulty === 'medium' ? 15 : 30;
  const choices = new Set([answer]);
  while (choices.size < 4) {
    const delta = randInt(1, spread) * (Math.random() > 0.5 ? 1 : -1);
    const fake = answer + delta;
    if (fake !== answer) choices.add(fake);
  }
  return shuffle([...choices]);
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Sound effects using Web Audio API
 */
let audioCtx = null;

function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

export function playCorrect() {
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(523, ctx.currentTime);
    osc.frequency.setValueAtTime(659, ctx.currentTime + 0.1);
    osc.frequency.setValueAtTime(784, ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.4);
  } catch (e) {}
}

export function playWrong() {
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.setValueAtTime(150, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.25);
  } catch (e) {}
}

export function playClick() {
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.05);
  } catch (e) {}
}

/**
 * LocalStorage helpers
 */
export function saveSession(session) {
  const prev = loadSessions();
  const updated = [session, ...prev].slice(0, 20); // keep last 20
  localStorage.setItem('mathgame_sessions', JSON.stringify(updated));
}

export function loadSessions() {
  try {
    return JSON.parse(localStorage.getItem('mathgame_sessions')) || [];
  } catch { return []; }
}

export function saveProfile(profile) {
  localStorage.setItem('mathgame_profile', JSON.stringify(profile));
}

export function loadProfile() {
  try {
    return JSON.parse(localStorage.getItem('mathgame_profile')) || {
      username: 'PLAYER01',
      level: 1,
      xp: 0,
      totalGames: 0,
    };
  } catch {
    return { username: 'PLAYER01', level: 1, xp: 0, totalGames: 0 };
  }
}

export function getLeaderboard() {
  try {
    return JSON.parse(localStorage.getItem('mathgame_leaderboard')) || getDefaultLeaderboard();
  } catch { return getDefaultLeaderboard(); }
}

export function updateLeaderboard(entry) {
  const board = getLeaderboard();
  board.push(entry);
  board.sort((a, b) => b.score - a.score);
  const trimmed = board.slice(0, 10);
  localStorage.setItem('mathgame_leaderboard', JSON.stringify(trimmed));
  return trimmed;
}

function getDefaultLeaderboard() {
  return [
    { username: 'ROBOTFELIX', score: 2840, accuracy: 95, mode: 'Time Attack', level: 12 },
    { username: 'CYBERMATH', score: 2610, accuracy: 88, mode: 'Classic', level: 10 },
    { username: 'N3UROHACK', score: 2400, accuracy: 91, mode: 'Battle', level: 9 },
    { username: 'QUANTUMX', score: 2200, accuracy: 84, mode: 'Time Attack', level: 8 },
    { username: 'ZEROC0DE', score: 1980, accuracy: 79, mode: 'Classic', level: 7 },
  ];
}

export function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export function calcScore(correct, total, timeMs, mode) {
  const accuracy = total > 0 ? (correct / total) * 100 : 0;
  const avgTime = total > 0 ? timeMs / total / 1000 : 0;
  let base = correct * 100;
  let speedBonus = avgTime < 3 ? 50 : avgTime < 5 ? 25 : 0;
  let modeMultiplier = mode === 'time-attack' ? 1.5 : mode === 'battle' ? 1.3 : 1;
  return Math.round((base + speedBonus * correct) * modeMultiplier);
}
