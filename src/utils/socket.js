import { io } from 'socket.io-client';

// Singleton socket connection — created once, reused everywhere
let socket = null;

export function getSocket() {
  if (!socket) {
    socket = io('http://localhost:3001', {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 5,
    });
  }
  return socket;
}

export function connectSocket() {
  const s = getSocket();
  if (!s.connected) s.connect();
  return s;
}

export function disconnectSocket() {
  if (socket && socket.connected) {
    socket.disconnect();
  }
}
