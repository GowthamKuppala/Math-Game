import { motion } from 'framer-motion';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { loadSessions } from '../utils/gameLogic';

const modeLabels = { classic: 'Classic', 'time-attack': 'Time Attack', battle: 'Battle' };
const modeColors = { classic: '#ff6b00', 'time-attack': '#ff9a00', battle: '#ff4444' };

export default function HistoryPage() {
  const { sessions, setSessions, setCurrentPage } = useApp();

  const clearHistory = () => {
    localStorage.removeItem('mathgame_sessions');
    setSessions([]);
  };

  return (
    <div className="min-h-screen pb-24" style={{ background: '#0a0a0a' }}>
      <div className="sticky top-0 z-10 px-4 pt-6 pb-4 flex items-center justify-between"
        style={{ background: 'rgba(10,10,10,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,107,0,0.1)' }}>
        <div className="flex items-center gap-3">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => setCurrentPage('home')}
            className="w-9 h-9 flex items-center justify-center rounded border border-gray-800">
            <ArrowLeft size={16} className="text-gray-400" />
          </motion.button>
          <div className="section-label">
            <div className="bars"><div className="bar" /><div className="bar" /><div className="bar" /></div>
            <span className="text-white">HISTORY</span>
          </div>
        </div>
        {sessions.length > 0 && (
          <button onClick={clearHistory}
            className="flex items-center gap-1 text-red-500/60 text-xs hover:text-red-500 transition-colors"
            style={{ fontFamily: 'Share Tech Mono, monospace' }}>
            <Trash2 size={12} /> CLEAR
          </button>
        )}
      </div>

      <div className="px-4 pt-4">
        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <span className="text-gray-700 text-6xl mb-4">∅</span>
            <p className="text-gray-600 text-sm tracking-wider" style={{ fontFamily: 'Share Tech Mono, monospace' }}>NO HISTORY YET</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {sessions.map((s, i) => {
              const color = modeColors[s.mode] || '#ff6b00';
              const avgTime = s.totalQuestions > 0 ? (s.durationMs / s.totalQuestions / 1000).toFixed(2) : '0.00';
              const date = new Date(s.date);
              return (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="p-4 rounded relative"
                  style={{ background: 'rgba(14,14,14,0.9)', border: '1px solid rgba(35,35,35,0.9)' }}>
                  <div className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full" style={{ background: color }} />

                  <div className="pl-3 flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-medium text-sm" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
                          {modeLabels[s.mode]} · {s.difficulty?.charAt(0).toUpperCase() + s.difficulty?.slice(1)}
                        </span>
                        {s.battleResult && (
                          <span className="text-xs px-1.5 py-0.5 rounded"
                            style={{
                              background: s.battleResult === 'win' ? 'rgba(0,255,128,0.15)' : 'rgba(255,68,68,0.15)',
                              color: s.battleResult === 'win' ? '#00ff80' : '#ff4444',
                            }}>
                            {s.battleResult === 'win' ? 'WIN' : 'LOSS'}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-4 text-xs text-gray-500" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
                        <span>{Math.round(s.accuracy)}% Acc</span>
                        <span>{s.correct}/{s.totalQuestions} Correct</span>
                        <span>{avgTime}s/Q</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="font-bold text-sm" style={{ fontFamily: 'Orbitron, sans-serif', color: '#ff6b00' }}>
                        {s.score}
                      </span>
                      <span className="text-xs text-gray-600">
                        {date.toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
