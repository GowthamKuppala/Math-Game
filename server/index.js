const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const apiRouter = require('./routes/api');
const setupSocket = require('./socket');

const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: FRONTEND_URL,
    methods: ['GET', 'POST'],
  },
});

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({ origin: FRONTEND_URL }));
app.use(express.json());

// ─── Routes ──────────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ app: 'MATHZONE Backend', status: 'running', api: '/api' });
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
