import { motion } from 'framer-motion';
import { Home, RotateCcw, Trophy } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function ResultsPage() {
  const { gameState, setCurrentPage, profile } = useApp();

  if (!gameState) { setCurrentPage('home'); return null; }

  const { mode, difficulty, correct, totalQuestions, accuracy, score, durationMs, battleResult } = gameState;
  const avgTime = totalQuestions > 0 ? (durationMs / totalQuestions / 1000).toFixed(2) : '0.00';

  const isWin = mode !== 'battle' || battleResult === 'win';

  const modeLabel = { classic: 'CLASSIC', 'time-attack': 'TIME ATTACK', battle: 'BATTLE' }[mode];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8"
      style={{ background: 'linear-gradient(180deg, #060606 0%, #0d0700 100%)' }}>

      {/* Result label */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
        className="mb-6"
      >
        {mode === 'battle' ? (
          <div className="text-center">
            <p className="text-6xl mb-2">{isWin ? '🏆' : '💀'}</p>
            <h1 className="text-4xl font-black tracking-widest"
              style={{
                fontFamily: 'Orbitron, sans-serif',
                color: isWin ? '#00ff80' : '#ff4444',
                textShadow: `0 0 20px ${isWin ? '#00ff80' : '#ff4444'}60`,
              }}>
              {isWin ? 'VICTORY' : 'DEFEATED'}
            </h1>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-6xl mb-2">⚡</p>
            <h1 className="text-4xl font-black tracking-widest glow-orange-text"
              style={{ fontFamily: 'Orbitron, sans-serif', color: '#ff6b00' }}>
              COMPLETE
            </h1>
          </div>
        )}
      </motion.div>

      {/* Score card */}
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="w-full max-w-md p-6 rounded-lg mb-6 cyber-corner-full"
        style={{
          background: 'rgba(14,14,14,0.95)',
          border: '1px solid rgba(255,107,0,0.25)',
        }}
      >
        <div className="text-center mb-6">
          <p className="text-gray-500 text-xs tracking-widest mb-1"
            style={{ fontFamily: 'Share Tech Mono, monospace' }}>FINAL SCORE</p>
          <p className="text-6xl font-black"
            style={{
              fontFamily: 'Orbitron, sans-serif',
              color: '#ff6b00',
              textShadow: '0 0 30px rgba(255,107,0,0.5)',
            }}>
            {score.toLocaleString()}
          </p>
          <p className="text-gray-500 text-xs mt-1" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
            {modeLabel} · {difficulty?.toUpperCase()}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Accuracy', value: `${Math.round(accuracy)}%`, color: '#ff6b00' },
            { label: 'Correct', value: `${correct}/${totalQuestions}`, color: '#00ff80' },
            { label: 'Avg Time', value: `${avgTime}s`, color: '#ff9a00' },
          ].map(({ label, value, color }) => (
            <div key={label} className="text-center p-3 rounded"
              style={{ background: 'rgba(20,20,20,0.8)', border: '1px solid rgba(40,40,40,0.8)' }}>
              <p className="text-sm font-bold" style={{ color, fontFamily: 'Orbitron, sans-serif' }}>{value}</p>
              <p className="text-gray-600 text-xs mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Buttons */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="w-full max-w-md flex gap-3"
      >
        <button
          onClick={() => setCurrentPage('home')}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded border border-gray-700 text-gray-400 text-sm tracking-widest hover:border-orange-500/40 transition-all"
          style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '0.7rem' }}
        >
          <Home size={14} />
          HOME
        </button>
        <button
          onClick={() => setCurrentPage('game')}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded text-white text-sm tracking-widest transition-all"
          style={{
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '0.7rem',
            background: 'linear-gradient(135deg, rgba(255,107,0,0.8), rgba(200,60,0,0.8))',
            boxShadow: '0 0 20px rgba(255,107,0,0.3)',
          }}
        >
          <RotateCcw size={14} />
          PLAY AGAIN
        </button>
      </motion.div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        onClick={() => setCurrentPage('leaderboard')}
        className="mt-4 flex items-center gap-2 text-orange-500/60 text-xs tracking-wider hover:text-orange-500 transition-colors"
        style={{ fontFamily: 'Share Tech Mono, monospace' }}
      >
        <Trophy size={12} />
        VIEW LEADERBOARD
      </motion.button>
    </div>
  );
}
