import { motion } from 'framer-motion';
import { ArrowLeft, Medal } from 'lucide-react';
import { useApp } from '../context/AppContext';

const rankColors = ['#FFD700', '#C0C0C0', '#CD7F32', '#ff6b00', '#ff6b00'];

export default function LeaderboardPage() {
  const { leaderboard, setCurrentPage, profile } = useApp();

  return (
    <div className="min-h-screen pb-24" style={{ background: '#0a0a0a' }}>
      {/* Header */}
      <div className="sticky top-0 z-10 px-4 pt-6 pb-4 flex items-center gap-3"
        style={{ background: 'rgba(10,10,10,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,107,0,0.1)' }}>
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setCurrentPage('home')}
          className="w-9 h-9 flex items-center justify-center rounded border border-gray-800">
          <ArrowLeft size={16} className="text-gray-400" />
        </motion.button>
        <div className="section-label">
          <div className="bars"><div className="bar" /><div className="bar" /><div className="bar" /></div>
          <span className="text-white">LEADERBOARD</span>
        </div>
      </div>

      <div className="px-4 pt-4">
        {/* Top 3 podium */}
        <div className="flex items-end justify-center gap-4 mb-6 pt-4">
          {[leaderboard[1], leaderboard[0], leaderboard[2]].map((entry, i) => {
            if (!entry) return <div key={i} className="w-24" />;
            const realRank = i === 0 ? 2 : i === 1 ? 1 : 3;
            const heights = [80, 100, 65];
            return (
              <motion.div
                key={realRank}
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: realRank * 0.1 }}
                className="flex flex-col items-center"
              >
                <div className="w-12 h-12 rounded-full border-2 flex items-center justify-center mb-1"
                  style={{ borderColor: rankColors[realRank - 1], background: 'rgba(30,30,30,0.9)' }}>
                  <span className="text-sm font-bold" style={{ fontFamily: 'Orbitron, sans-serif', color: rankColors[realRank - 1] }}>
                    {entry.username.slice(0, 2)}
                  </span>
                </div>
                <p className="text-xs text-white mb-1" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
                  {entry.username.length > 8 ? entry.username.slice(0, 8) + '..' : entry.username}
                </p>
                <div className="w-20 rounded-t flex flex-col items-center pt-2"
                  style={{
                    height: `${heights[i]}px`,
                    background: `linear-gradient(180deg, ${rankColors[realRank - 1]}20, ${rankColors[realRank - 1]}05)`,
                    border: `1px solid ${rankColors[realRank - 1]}40`,
                  }}>
                  <span className="text-xs font-bold" style={{ color: rankColors[realRank - 1], fontFamily: 'Orbitron, sans-serif' }}>
                    #{realRank}
                  </span>
                  <span className="text-xs text-white mt-0.5" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
                    {entry.score}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Full list */}
        <div className="flex flex-col gap-2">
          {leaderboard.map((entry, i) => {
            const isMe = entry.username === profile.username;
            return (
              <motion.div
                key={i}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 p-3 rounded"
                style={{
                  background: isMe ? 'rgba(255,107,0,0.08)' : 'rgba(14,14,14,0.9)',
                  border: isMe ? '1px solid rgba(255,107,0,0.35)' : '1px solid rgba(35,35,35,0.8)',
                }}
              >
                <span className="w-7 font-bold text-sm"
                  style={{ fontFamily: 'Orbitron, sans-serif', color: i < 3 ? rankColors[i] : '#555' }}>
                  {i + 1}
                </span>
                <div className="w-8 h-8 rounded border flex items-center justify-center"
                  style={{ borderColor: i < 3 ? rankColors[i] + '60' : '#333', background: 'rgba(30,30,30,0.8)' }}>
                  <span className="text-xs font-bold" style={{ color: i < 3 ? rankColors[i] : '#666', fontFamily: 'Orbitron' }}>
                    {entry.username.slice(0, 2)}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
                    {entry.username} {isMe && <span className="text-orange-500 text-xs">(YOU)</span>}
                  </p>
                  <p className="text-gray-600 text-xs">{Math.round(entry.accuracy)}% acc · {entry.mode}</p>
                </div>
                <span className="font-bold" style={{ fontFamily: 'Orbitron, sans-serif', color: '#ff6b00', fontSize: '0.85rem' }}>
                  {entry.score}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
