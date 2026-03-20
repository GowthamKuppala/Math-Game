/**
 * Socket.io multiplayer room management.
 * Handles: create-room, join-room, answer-submitted, game-over
 */

// Generate a random 6-character alphanumeric room code
function makeCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// Generate a battle question set (same for both players)
function generateBattleQuestions(operator, difficulty, count = 10) {
  const ranges = { easy: [1, 10], medium: [1, 50], hard: [1, 100] };
  const [min, max] = ranges[difficulty] || ranges.medium;
  const ops = operator === 'random' ? ['+', '-', '*', '/'] : [operator];
  const questions = [];

  for (let i = 0; i < count; i++) {
    const op = ops[Math.floor(Math.random() * ops.length)];
    let a = randInt(min, max);
    let b = randInt(min, max);

    if (op === '/') {
      b = randInt(1, 12);
      a = b * randInt(1, difficulty === 'easy' ? 10 : 12);
    }
    if (op === '-' && a < b) [a, b] = [b, a];

    const answer = compute(a, b, op);
    const symbols = { '+': '+', '-': '−', '*': '×', '/': '÷' };
    const question = `${a} ${symbols[op]} ${b} = ?`;
    const choices = makeChoices(answer, difficulty);

    questions.push({ question, answer, choices, operator: op });
  }
  return questions;
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

function makeChoices(answer, difficulty) {
  const spread = difficulty === 'easy' ? 5 : difficulty === 'medium' ? 15 : 30;
  const set = new Set([answer]);
  while (set.size < 4) {
    const d = randInt(1, spread) * (Math.random() > 0.5 ? 1 : -1);
    if (d !== 0) set.add(answer + d);
  }
  const arr = [...set];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Active rooms map: code → { players: [], questions: [], scores: {}, answers: {} }
const rooms = new Map();

module.exports = function setupSocket(io) {
  io.on('connection', (socket) => {
    console.log(`[socket] connected: ${socket.id}`);

    // ── CREATE ROOM ──────────────────────────────────────────────────────────
    socket.on('create-room', ({ username, operator, difficulty }) => {
      let code = makeCode();
      while (rooms.has(code)) code = makeCode(); // ensure unique

      rooms.set(code, {
        code,
        players: [{ id: socket.id, username }],
        operator,
        difficulty,
        questions: [],
        scores: { [socket.id]: 0 },
        correctCounts: { [socket.id]: 0 },
        finished: {},
        startTime: null,
      });

      socket.join(code);
      socket.emit('room-created', { code });
      console.log(`[room] ${code} created by ${username}`);
    });

    // ── JOIN ROOM ────────────────────────────────────────────────────────────
    socket.on('join-room', ({ code, username }) => {
      code = code.toUpperCase().trim();
      const room = rooms.get(code);

      if (!room) {
        socket.emit('room-error', { message: 'Room not found. Check the code and try again.' });
        return;
      }
      if (room.players.length >= 2) {
        socket.emit('room-error', { message: 'Room is full. Game already started.' });
        return;
      }

      room.players.push({ id: socket.id, username });
      room.scores[socket.id] = 0;
      room.correctCounts[socket.id] = 0;
      socket.join(code);

      // Generate questions now (same for both players)
      room.questions = generateBattleQuestions(room.operator, room.difficulty, 10);
      room.startTime = Date.now();

      // Notify both players — game is ready
      const player1 = room.players[0];
      const player2 = room.players[1];

      io.to(player1.id).emit('room-ready', {
        code,
        questions: room.questions,
        opponent: { username: player2.username },
        you: player1.username,
      });
      io.to(player2.id).emit('room-ready', {
        code,
        questions: room.questions,
        opponent: { username: player1.username },
        you: player2.username,
      });

      console.log(`[room] ${code} ready: ${player1.username} vs ${player2.username}`);
    });

    // ── ANSWER SUBMITTED ─────────────────────────────────────────────────────
    socket.on('answer-submitted', ({ code, questionIndex, isCorrect, points }) => {
      const room = rooms.get(code);
      if (!room) return;

      if (isCorrect) {
        room.scores[socket.id] = (room.scores[socket.id] || 0) + points;
        room.correctCounts[socket.id] = (room.correctCounts[socket.id] || 0) + 1;
      }

      // Broadcast opponent's progress to the other player
      const opponent = room.players.find(p => p.id !== socket.id);
      if (opponent) {
        io.to(opponent.id).emit('opponent-answered', {
          questionIndex,
          isCorrect,
          opponentScore: room.scores[socket.id],
          opponentCorrect: room.correctCounts[socket.id],
        });
      }
    });

    // ── PLAYER FINISHED ──────────────────────────────────────────────────────
    socket.on('player-finished', ({ code }) => {
      const room = rooms.get(code);
      if (!room) return;

      room.finished[socket.id] = true;

      // Both done → send final results
      if (Object.keys(room.finished).length === 2) {
        const [p1, p2] = room.players;
        const s1 = room.scores[p1.id] || 0;
        const s2 = room.scores[p2.id] || 0;

        const resultFor = (myId, oppId) => ({
          myScore: room.scores[myId] || 0,
          myCorrect: room.correctCounts[myId] || 0,
          opponentScore: room.scores[oppId] || 0,
          opponentCorrect: room.correctCounts[oppId] || 0,
          opponentUsername: room.players.find(p => p.id === oppId)?.username,
          result: room.scores[myId] > room.scores[oppId] ? 'win'
            : room.scores[myId] < room.scores[oppId] ? 'loss' : 'draw',
          durationMs: Date.now() - room.startTime,
        });

        io.to(p1.id).emit('game-results', resultFor(p1.id, p2.id));
        io.to(p2.id).emit('game-results', resultFor(p2.id, p1.id));

        // Clean up room after 30s
        setTimeout(() => rooms.delete(code), 30000);
        console.log(`[room] ${code} finished: ${p1.username}(${s1}) vs ${p2.username}(${s2})`);
      }
    });

    // ── DISCONNECT ───────────────────────────────────────────────────────────
    socket.on('disconnect', () => {
      // Notify opponent if in a room
      for (const [code, room] of rooms.entries()) {
        const idx = room.players.findIndex(p => p.id === socket.id);
        if (idx !== -1) {
          const opponent = room.players.find(p => p.id !== socket.id);
          if (opponent) {
            io.to(opponent.id).emit('opponent-left', {
              message: 'Your opponent disconnected.',
            });
          }
          rooms.delete(code);
          break;
        }
      }
      console.log(`[socket] disconnected: ${socket.id}`);
    });
  });
};
