import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, ArrowLeft, Users, Cpu, Loader } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { connectSocket, disconnectSocket } from '../utils/socket';

export default function BattleLobby({ onClose }) {
  const { profile, gameSetup, setGameSetup, setCurrentPage, setRoomState } = useApp();

  const handleClose = () => {
    if (onClose) onClose();
    else setCurrentPage('home');
  };

  const [view, setView]         = useState('choice');   // choice | create | join | waiting | error
  const [roomCode, setRoomCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [copied, setCopied]     = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [socket, setSocket]     = useState(null);

  useEffect(() => {
    const s = connectSocket();
    setSocket(s);

    s.on('room-created', ({ code }) => {
      setRoomCode(code);
      setView('waiting');
    });

    s.on('room-ready', (data) => {
      // Store room state then go to game
      setRoomState(data);
      setCurrentPage('game');
    });

    s.on('room-error', ({ message }) => {
      setErrorMsg(message);
      setView('error');
    });

    return () => {
      s.off('room-created');
      s.off('room-ready');
      s.off('room-error');
    };
  }, []);

  const handleCreateRoom = () => {
    setErrorMsg('');
    setView('create');
    socket.emit('create-room', {
      username: profile.username,
      operator: gameSetup.operator,
      difficulty: gameSetup.difficulty,
    });
  };

  const handleJoinRoom = () => {
    const code = inputCode.toUpperCase().trim();
    if (code.length < 4) { setErrorMsg('Please enter the full room code.'); return; }
    setErrorMsg('');
    socket.emit('join-room', { code, username: profile.username });
    setView('waiting');
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const goBack = () => {
    setView('choice');
    setRoomCode('');
    setInputCode('');
    setErrorMsg('');
  };

  // ── vs Computer → straight to game ────────────────────────────────────────
  const handleVsComputer = () => {
    setGameSetup(g => ({ ...g, battleOpponent: 'computer' }));
    setCurrentPage('game');
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,0.92)',
      backdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px',
    }}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
        style={{
          width: '100%', maxWidth: '420px',
          background: '#111',
          border: '1px solid rgba(255,107,0,0.3)',
          borderRadius: '8px',
          padding: '28px 24px',
          position: 'relative',
          boxShadow: '0 0 60px rgba(255,107,0,0.15)',
        }}
      >
        {/* Corner accents */}
        <span style={{ position:'absolute', top:0, left:0, width:16, height:16, borderTop:'2px solid #ff6b00', borderLeft:'2px solid #ff6b00' }} />
        <span style={{ position:'absolute', bottom:0, right:0, width:16, height:16, borderBottom:'2px solid #ff6b00', borderRight:'2px solid #ff6b00' }} />

        {/* Close / back */}
        <button onClick={handleClose} style={{
          position:'absolute', top:12, right:12,
          background:'transparent', border:'none', color:'#555', cursor:'pointer', fontSize:'1.1rem',
          zIndex: 10,
        }}>✕</button>

        <h2 style={{ fontFamily:'Orbitron, sans-serif', fontSize:'1rem', color:'#ff6b00', letterSpacing:'0.15em', marginBottom:'6px' }}>
          ⚔ BATTLE MODE
        </h2>
        <p style={{ color:'#444', fontSize:'0.7rem', fontFamily:'Share Tech Mono, monospace', marginBottom:'24px' }}>
          {gameSetup.difficulty?.toUpperCase()} · {
            gameSetup.operator === 'random' ? 'RANDOM OPS' :
            gameSetup.operator === '+' ? 'ADDITION' :
            gameSetup.operator === '-' ? 'SUBTRACTION' :
            gameSetup.operator === '*' ? 'MULTIPLICATION' : 'DIVISION'
          }
        </p>

        <AnimatePresence mode="wait">

          {/* ── CHOICE ────────────────────────────────────────────────────── */}
          {view === 'choice' && (
            <motion.div key="choice" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
              <p style={{ color:'#888', fontSize:'0.75rem', fontFamily:'Share Tech Mono, monospace', marginBottom:'16px' }}>
                Choose your opponent:
              </p>
              <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                <motion.button
                  whileHover={{ scale:1.02, x:4 }}
                  whileTap={{ scale:0.98 }}
                  onClick={handleVsComputer}
                  style={{
                    display:'flex', alignItems:'center', gap:'14px',
                    padding:'16px 18px', borderRadius:'6px',
                    background:'rgba(255,107,0,0.08)',
                    border:'1px solid rgba(255,107,0,0.3)',
                    cursor:'pointer', textAlign:'left', width:'100%',
                  }}
                >
                  <Cpu size={24} color="#ff6b00" />
                  <div>
                    <p style={{ fontFamily:'Orbitron, sans-serif', fontSize:'0.8rem', color:'#fff' }}>VS COMPUTER</p>
                    <p style={{ color:'#666', fontSize:'0.65rem', fontFamily:'Share Tech Mono, monospace', marginTop:'2px' }}>AI opponent simulated locally</p>
                  </div>
                </motion.button>

                <motion.button
                  whileHover={{ scale:1.02, x:4 }}
                  whileTap={{ scale:0.98 }}
                  onClick={() => setView('join-or-create')}
                  style={{
                    display:'flex', alignItems:'center', gap:'14px',
                    padding:'16px 18px', borderRadius:'6px',
                    background:'rgba(0,100,255,0.06)',
                    border:'1px solid rgba(100,150,255,0.25)',
                    cursor:'pointer', textAlign:'left', width:'100%',
                  }}
                >
                  <Users size={24} color="#7099ff" />
                  <div>
                    <p style={{ fontFamily:'Orbitron, sans-serif', fontSize:'0.8rem', color:'#fff' }}>VS FRIEND</p>
                    <p style={{ color:'#666', fontSize:'0.65rem', fontFamily:'Share Tech Mono, monospace', marginTop:'2px' }}>Real-time multiplayer via room code</p>
                  </div>
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ── JOIN OR CREATE ────────────────────────────────────────────── */}
          {view === 'join-or-create' && (
            <motion.div key="jc" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0 }}>
              <button onClick={goBack} style={{ display:'flex', alignItems:'center', gap:'6px', color:'#555', background:'none', border:'none', cursor:'pointer', marginBottom:'18px', fontSize:'0.7rem', fontFamily:'Share Tech Mono, monospace' }}>
                <ArrowLeft size={12} /> BACK
              </button>
              <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                <motion.button
                  whileHover={{ scale:1.02 }}
                  whileTap={{ scale:0.98 }}
                  onClick={handleCreateRoom}
                  style={{
                    padding:'16px', borderRadius:'6px',
                    background:'rgba(255,107,0,0.1)',
                    border:'1px solid rgba(255,107,0,0.4)',
                    color:'#fff', cursor:'pointer',
                    fontFamily:'Orbitron, sans-serif', fontSize:'0.8rem',
                    letterSpacing:'0.12em',
                  }}
                >
                  CREATE ROOM
                  <p style={{ color:'#666', fontSize:'0.6rem', fontFamily:'Share Tech Mono, monospace', marginTop:'4px', letterSpacing:'0.05em' }}>
                    Get a code and share with friend
                  </p>
                </motion.button>

                <div style={{ padding:'16px', borderRadius:'6px', background:'rgba(20,20,20,0.9)', border:'1px solid rgba(50,50,50,0.8)' }}>
                  <p style={{ fontFamily:'Orbitron, sans-serif', fontSize:'0.8rem', color:'#fff', marginBottom:'12px', letterSpacing:'0.08em' }}>JOIN ROOM</p>
                  <div style={{ display:'flex', gap:'8px' }}>
                    <input
                      value={inputCode}
                      onChange={e => setInputCode(e.target.value.toUpperCase())}
                      onKeyDown={e => e.key === 'Enter' && handleJoinRoom()}
                      placeholder="ENTER CODE"
                      maxLength={6}
                      style={{
                        flex:1, background:'rgba(10,10,10,0.9)',
                        border:'1px solid rgba(60,60,60,0.8)',
                        borderRadius:'4px', padding:'10px 12px',
                        color:'#ff6b00', fontFamily:'Orbitron, sans-serif',
                        fontSize:'0.9rem', letterSpacing:'0.2em',
                        outline:'none', textTransform:'uppercase',
                      }}
                    />
                    <button
                      onClick={handleJoinRoom}
                      style={{
                        padding:'10px 16px', borderRadius:'4px',
                        background:'linear-gradient(135deg, #ff6b00, #cc4400)',
                        border:'none', color:'#fff',
                        fontFamily:'Orbitron, sans-serif', fontSize:'0.65rem',
                        letterSpacing:'0.1em', cursor:'pointer',
                      }}
                    >JOIN</button>
                  </div>
                  {errorMsg && <p style={{ color:'#ff4444', fontSize:'0.65rem', marginTop:'8px', fontFamily:'Share Tech Mono, monospace' }}>{errorMsg}</p>}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── WAITING (created room) ─────────────────────────────────────── */}
          {view === 'waiting' && (
            <motion.div key="waiting" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              style={{ textAlign:'center' }}>
              <div style={{ marginBottom:'20px' }}>
                <p style={{ color:'#888', fontSize:'0.7rem', fontFamily:'Share Tech Mono, monospace', marginBottom:'8px' }}>
                  ROOM CODE
                </p>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'10px' }}>
                  <span style={{
                    fontFamily:'Orbitron, sans-serif', fontSize:'2rem', fontWeight:900,
                    color:'#ff6b00', letterSpacing:'0.3em',
                    textShadow:'0 0 20px rgba(255,107,0,0.6)',
                  }}>
                    {roomCode || '......'}
                  </span>
                  {roomCode && (
                    <button onClick={handleCopyCode} style={{
                      background:'transparent', border:'none', cursor:'pointer', color: copied ? '#00ff80' : '#555',
                    }}>
                      {copied ? <Check size={18} /> : <Copy size={18} />}
                    </button>
                  )}
                </div>
              </div>

              <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'10px', marginBottom:'12px' }}>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
                >
                  <Loader size={16} color="#ff6b00" />
                </motion.div>
                <p style={{ color:'#666', fontSize:'0.7rem', fontFamily:'Share Tech Mono, monospace' }}>
                  Waiting for opponent to join...
                </p>
              </div>

              <p style={{ color:'#444', fontSize:'0.65rem', fontFamily:'Share Tech Mono, monospace' }}>
                Share the code with your friend. The game starts automatically when they join.
              </p>

              <button onClick={handleClose} style={{
                marginTop:'20px', padding:'8px 20px',
                background:'transparent', border:'1px solid rgba(60,60,60,0.8)',
                borderRadius:'4px', color:'#555', cursor:'pointer',
                fontFamily:'Orbitron, sans-serif', fontSize:'0.65rem', letterSpacing:'0.1em',
              }}>
                CANCEL
              </button>
            </motion.div>
          )}

          {/* ── CREATE (generating code...) ──────────────────────────────── */}
          {view === 'create' && (
            <motion.div key="create" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              style={{ textAlign:'center', padding:'20px 0' }}>
              <motion.div animate={{ rotate: 360 }} transition={{ repeat:Infinity, duration:1, ease:'linear' }}>
                <Loader size={24} color="#ff6b00" />
              </motion.div>
              <p style={{ color:'#666', fontSize:'0.7rem', fontFamily:'Share Tech Mono, monospace', marginTop:'12px' }}>
                Creating room...
              </p>
            </motion.div>
          )}

          {/* ── ERROR ─────────────────────────────────────────────────────── */}
          {view === 'error' && (
            <motion.div key="error" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              style={{ textAlign:'center' }}>
              <p style={{ color:'#ff4444', fontSize:'0.9rem', marginBottom:'12px' }}>⚠ Error</p>
              <p style={{ color:'#888', fontSize:'0.75rem', fontFamily:'Share Tech Mono, monospace', marginBottom:'20px' }}>
                {errorMsg}
              </p>
              <button onClick={goBack} style={{
                padding:'10px 24px', borderRadius:'4px',
                background:'rgba(255,107,0,0.1)', border:'1px solid rgba(255,107,0,0.4)',
                color:'#ff6b00', cursor:'pointer',
                fontFamily:'Orbitron, sans-serif', fontSize:'0.7rem', letterSpacing:'0.1em',
              }}>
                TRY AGAIN
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </motion.div>
    </div>
  );
}
