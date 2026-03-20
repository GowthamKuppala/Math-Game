import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { playClick } from '../utils/gameLogic';

const operators = [
  { id: '+', symbol: '+', label: 'Addition' },
  { id: '-', symbol: '−', label: 'Subtraction' },
  { id: '*', symbol: '×', label: 'Multiplication' },
  { id: '/', symbol: '÷', label: 'Division' },
  { id: 'random', symbol: '%', label: 'Random' },
];

const difficulties = [
  { id: 'easy', label: 'Easy', range: '1–10', color: '#00ff80' },
  { id: 'medium', label: 'Medium', range: '1–50', color: '#ff9a00' },
  { id: 'hard', label: 'Hard', range: '1–100', color: '#ff4444' },
  { id: 'random', label: 'Free', range: 'Random', color: '#ff6b00' },
];

export default function GameSetupPanel({ onPlay }) {
  const { gameSetup, setGameSetup } = useApp();

  const setOp = (id) => { playClick(); setGameSetup(p => ({ ...p, operator: id })); };
  const setDiff = (id) => { playClick(); setGameSetup(p => ({ ...p, difficulty: id })); };

  return (
    <div className="mb-8">
      {/* Panel header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '10px',
        padding: '10px 14px',
        borderRadius: '6px',
        background: 'rgba(20,20,20,0.9)',
        border: '1px solid rgba(255,107,0,0.2)',
        flexWrap: 'wrap',
        gap: '6px',
      }}>
        <span style={{
          fontFamily: 'Orbitron, sans-serif',
          fontSize: 'clamp(0.6rem, 2vw, 0.8rem)',
          color: '#fff',
          letterSpacing: '0.1em',
        }}>
          SELECT OPERATORS
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: '#ff6b00' }}>✳</span>
          <span style={{
            color: '#ff6b00',
            fontSize: '0.7rem',
            fontFamily: 'Share Tech Mono, monospace',
          }}>
            {gameSetup.mode === 'classic' ? 'Classic' : gameSetup.mode === 'time-attack' ? 'Time Attack' : 'Battle'}
          </span>
        </div>
      </div>

      {/* Operator + Difficulty grid — responsive */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '10px',
        marginBottom: '12px',
      }}
        className="operator-grid"
      >
        {/* Operators column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: 0 }}>
          {operators.map(({ id, symbol, label }) => {
            const sel = gameSetup.operator === id;
            return (
              <motion.button
                key={id}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setOp(id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 12px',
                  borderRadius: '5px',
                  background: sel ? 'rgba(255,107,0,0.1)' : 'rgba(18,18,18,0.9)',
                  border: sel ? '1px solid rgba(255,107,0,0.7)' : '1px solid rgba(40,40,40,0.8)',
                  boxShadow: sel ? '0 0 12px rgba(255,107,0,0.2)' : 'none',
                  cursor: 'pointer',
                  position: 'relative',
                  minWidth: 0,
                  width: '100%',
                  textAlign: 'left',
                }}
              >
                {sel && (
                  <>
                    <span style={{ position: 'absolute', top: 0, left: 0, width: '8px', height: '8px', borderTop: '1px solid #ff6b00', borderLeft: '1px solid #ff6b00' }} />
                    <span style={{ position: 'absolute', bottom: 0, right: 0, width: '8px', height: '8px', borderBottom: '1px solid #ff6b00', borderRight: '1px solid #ff6b00' }} />
                  </>
                )}
                <span style={{
                  color: '#ff6b00', fontFamily: 'Share Tech Mono, monospace',
                  fontWeight: 700, fontSize: '0.85rem', flexShrink: 0, width: '16px', textAlign: 'center',
                }}>
                  {symbol}
                </span>
                <span style={{
                  fontFamily: 'Share Tech Mono, monospace',
                  fontSize: 'clamp(0.6rem, 1.5vw, 0.75rem)',
                  color: sel ? '#fff' : '#666',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {label}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Difficulty column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: 0 }}>
          {difficulties.map(({ id, label, range, color }) => {
            const sel = gameSetup.difficulty === id;
            return (
              <motion.button
                key={id}
                whileHover={{ x: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setDiff(id)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  padding: '10px 12px',
                  borderRadius: '5px',
                  background: sel ? `rgba(${id === 'easy' ? '0,255,128' : id === 'medium' ? '255,154,0' : id === 'hard' ? '255,68,68' : '255,107,0'},0.08)` : 'rgba(18,18,18,0.9)',
                  border: sel ? `1px solid ${color}80` : '1px solid rgba(40,40,40,0.8)',
                  boxShadow: sel ? `0 0 12px ${color}25` : 'none',
                  cursor: 'pointer',
                  position: 'relative',
                  minWidth: 0,
                  width: '100%',
                }}
              >
                {sel && (
                  <>
                    <span style={{ position: 'absolute', top: 0, left: 0, width: '8px', height: '8px', borderTop: `1px solid ${color}`, borderLeft: `1px solid ${color}` }} />
                    <span style={{ position: 'absolute', bottom: 0, right: 0, width: '8px', height: '8px', borderBottom: `1px solid ${color}`, borderRight: `1px solid ${color}` }} />
                  </>
                )}
                <span style={{
                  fontFamily: 'Share Tech Mono, monospace',
                  fontSize: 'clamp(0.65rem, 1.5vw, 0.8rem)',
                  fontWeight: 500,
                  color: sel ? color : '#666',
                }}>
                  {label}
                </span>
                <span style={{ color: '#444', fontSize: '0.6rem', marginTop: '1px' }}>{range}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Play Now button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onPlay}
        style={{
          display: 'block',
          width: '100%',
          padding: '16px',
          color: '#fff',
          fontFamily: 'Orbitron, sans-serif',
          fontSize: 'clamp(0.75rem, 2vw, 0.9rem)',
          fontWeight: 900,
          letterSpacing: '0.15em',
          background: 'linear-gradient(135deg, rgba(255,107,0,0.9), rgba(200,60,0,0.9))',
          boxShadow: '0 0 30px rgba(255,107,0,0.5), 0 0 60px rgba(255,107,0,0.15)',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
          textTransform: 'uppercase',
        }}
      >
        <motion.div
          animate={{ x: ['-100%', '200%'] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
          style={{
            position: 'absolute', inset: 0, width: '33%',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
          }}
        />
        <span style={{ position: 'relative', zIndex: 1, textShadow: '0 0 10px rgba(255,107,0,0.8)' }}>
          PLAY NOW
        </span>
      </motion.button>

      {/* Responsive stacking for very small screens */}
      <style>{`
        @media (max-width: 480px) {
          .operator-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
