import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Edit2, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { loadSessions } from '../utils/gameLogic';

export default function AccountPage() {
  const { profile, updateProfile, setCurrentPage, sessions } = useApp();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(profile.username);

  const save = () => {
    if (name.trim()) {
      updateProfile({ username: name.trim().toUpperCase().slice(0, 12) });
    }
    setEditing(false);
  };

  const totalCorrect = sessions.reduce((s, g) => s + g.correct, 0);
  const totalPlayed = sessions.length;
  const avgAccuracy = sessions.length > 0
    ? Math.round(sessions.reduce((s, g) => s + g.accuracy, 0) / sessions.length)
    : 0;
  const bestScore = sessions.length > 0 ? Math.max(...sessions.map(g => g.score)) : 0;

  return (
    <div className="min-h-screen pb-24" style={{ background: '#0a0a0a' }}>
      <div className="sticky top-0 z-10 px-4 pt-6 pb-4 flex items-center gap-3"
        style={{ background: 'rgba(10,10,10,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,107,0,0.1)' }}>
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setCurrentPage('home')}
          className="w-9 h-9 flex items-center justify-center rounded border border-gray-800">
          <ArrowLeft size={16} className="text-gray-400" />
        </motion.button>
        <div className="section-label">
          <div className="bars"><div className="bar" /><div className="bar" /><div className="bar" /></div>
          <span className="text-white">ACCOUNT</span>
        </div>
      </div>

      <div className="px-4 py-6">
        {/* Avatar and name */}
        <div className="flex flex-col items-center mb-8">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="w-24 h-24 rounded border-2 border-orange-500/60 flex items-center justify-center mb-4"
            style={{
              background: 'linear-gradient(135deg, rgba(255,107,0,0.15), rgba(20,20,20,0.9))',
              boxShadow: '0 0 30px rgba(255,107,0,0.25)',
            }}>
            <span className="text-3xl font-black text-orange-500" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              {profile.username.slice(0, 2)}
            </span>
          </motion.div>

          {editing ? (
            <div className="flex items-center gap-2">
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && save()}
                maxLength={12}
                className="bg-transparent border border-orange-500/60 rounded px-3 py-1 text-white text-center text-lg tracking-widest outline-none"
                style={{ fontFamily: 'Orbitron, sans-serif', width: '180px' }}
                autoFocus
              />
              <button onClick={save} className="w-8 h-8 flex items-center justify-center rounded bg-orange-500/20 border border-orange-500/40">
                <Check size={14} className="text-orange-500" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h2 className="text-white text-2xl font-black tracking-widest" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                {profile.username}
              </h2>
              <button onClick={() => setEditing(true)} className="text-gray-600 hover:text-orange-500 transition-colors">
                <Edit2 size={14} />
              </button>
            </div>
          )}

          <p className="text-orange-500 text-sm tracking-widest mt-1" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
            LEVEL {profile.level}
          </p>

          {/* XP bar */}
          <div className="w-48 mt-3">
            <div className="flex justify-between text-xs text-gray-600 mb-1" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
              <span>XP: {profile.xp % 100}/100</span>
              <span>Next Level</span>
            </div>
            <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full progress-bar rounded-full" style={{ width: `${profile.xp % 100}%` }} />
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { label: 'Games Played', value: totalPlayed, color: '#ff6b00' },
            { label: 'Best Score', value: bestScore.toLocaleString(), color: '#FFD700' },
            { label: 'Total Correct', value: totalCorrect, color: '#00ff80' },
            { label: 'Avg Accuracy', value: `${avgAccuracy}%`, color: '#ff9a00' },
          ].map(({ label, value, color }) => (
            <div key={label} className="p-4 rounded"
              style={{ background: 'rgba(14,14,14,0.9)', border: '1px solid rgba(35,35,35,0.8)' }}>
              <p className="text-2xl font-bold mb-0.5" style={{ fontFamily: 'Orbitron, sans-serif', color }}>{value}</p>
              <p className="text-gray-600 text-xs">{label}</p>
            </div>
          ))}
        </div>

        {/* Reset */}
        <button
          onClick={() => {
            localStorage.clear();
            window.location.reload();
          }}
          className="w-full py-3 rounded border border-red-900/40 text-red-500/60 text-xs tracking-widest hover:border-red-500/40 hover:text-red-500 transition-all"
          style={{ fontFamily: 'Orbitron, sans-serif' }}
        >
          RESET ALL DATA
        </button>
      </div>
    </div>
  );
}
