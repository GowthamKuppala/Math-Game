const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const apiRouter = require('./routes/api');
const setupSocket = require('./socket');

const PORT = process.env.PORT || 3001;

const app = express();
const server = http.createServer(app);

// Allow ALL origins — this is a public game app with no sensitive data
const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors(corsOptions));
app.use(express.json());


// ─── Routes ──────────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    app: 'MATHZONE Backend',
    status: 'running',
    api: '/api',
    endpoints: ['/api/health', '/api/leaderboard', '/api/profile/:username', '/api/sessions/:username'],
  });
});

app.use('/api', apiRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// ─── Socket.io ────────────────────────────────────────────────────────────────
setupSocket(io);

// ─── Start ────────────────────────────────────────────────────────────────────
server.listen(PORT, () => {
  console.log(`\n  ⚡ MATHZONE Backend running at http://localhost:${PORT}\n`);
});
