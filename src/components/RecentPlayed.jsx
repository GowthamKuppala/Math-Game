import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';

const modeColors = {
  classic: '#ff6b00',
  'time-attack': '#ff9a00',
  battle: '#ff4444',
};

const modeLabels = {
  classic: 'Classic',
  'time-attack': 'Time Attack',
  battle: 'Battle',
};

export default function RecentPlayed() {
  const { sessions } = useApp();

  return (
    <div className="mb-24">
      <div className="section-label mb-3">
        <div className="bars">
          <div className="bar" />
          <div className="bar" />
          <div className="bar" />
        </div>
        <span className="text-white">RECENT PLAYED</span>
      </div>

      {sessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 rounded"
          style={{ border: '1px solid rgba(40,40,40,0.8)', background: 'rgba(14,14,14,0.8)' }}>
          <span className="text-gray-700 text-4xl mb-3">∅</span>
          <p className="text-gray-600 text-sm tracking-wider" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
            NO SESSIONS YET
          </p>
          <p className="text-gray-700 text-xs mt-1">Play a game to see your stats</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {sessions.slice(0, 6).map((session, i) => {
            const color = modeColors[session.mode] || '#ff6b00';
            const avgTime = session.totalQuestions > 0
              ? (session.durationMs / session.totalQuestions / 1000).toFixed(2)
              : '0.00';

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="p-3 rounded relative"
                style={{
                  background: 'rgba(14,14,14,0.9)',
                  border: '1px solid rgba(35,35,35,0.9)',
                }}
              >
                {/* Left orange accent line */}
                <div className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full"
                  style={{ background: color }} />

                <div className="flex items-start justify-between pl-3">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-white text-sm font-medium"
                        style={{ fontFamily: 'Share Tech Mono, monospace' }}>
                        {modeLabels[session.mode]} {session.difficulty?.charAt(0).toUpperCase() + session.difficulty?.slice(1) || ''}
                      </span>
                      {session.battleResult && (
                        <span className="text-xs px-1.5 py-0.5 rounded"
                          style={{
                            background: session.battleResult === 'win' ? 'rgba(0,255,128,0.15)' : 'rgba(255,68,68,0.15)',
                            color: session.battleResult === 'win' ? '#00ff80' : '#ff4444',
                            fontFamily: 'Share Tech Mono, monospace',
                          }}>
                          {session.battleResult === 'win' ? 'WIN' : 'LOSS'}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-500 text-xs" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
                      {Math.round(session.accuracy)}% Accuracy · {session.correct} Correct · {session.totalQuestions} Task
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs px-2 py-0.5 rounded font-mono"
                      style={{
                        background: 'rgba(0,255,128,0.12)',
                        color: '#00ff80',
                        boxShadow: '0 0 6px rgba(0,255,128,0.2)',
                        fontFamily: 'Share Tech Mono, monospace',
                      }}>
                      {avgTime}s/CT
                    </span>
                    <span className="text-xs text-gray-600">Score: {session.score}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
