import { motion } from 'framer-motion';
import { Settings } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Header() {
  const { profile, setCurrentPage } = useApp();

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px',
      flexWrap: 'wrap',
    }}>
      {/* Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
        {/* Avatar */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div style={{
            width: '52px', height: '52px',
            borderRadius: '4px',
            border: '1px solid rgba(255,107,0,0.6)',
            overflow: 'hidden',
            boxShadow: '0 0 12px rgba(255,107,0,0.3)',
            background: 'linear-gradient(135deg, rgba(255,107,0,0.2), rgba(30,30,30,0.9))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{
              fontFamily: 'Orbitron, sans-serif',
              fontWeight: 800,
              fontSize: '1rem',
              color: '#ff6b00',
            }}>
              {profile.username.slice(0, 2)}
            </span>
          </div>
          {/* Online dot */}
          <div style={{
            position: 'absolute', bottom: '-2px', right: '-2px',
            width: '12px', height: '12px',
            background: '#00ff80', borderRadius: '50%',
            border: '2px solid #0a0a0a',
            boxShadow: '0 0 6px #00ff80',
          }} />
        </div>

        {/* Name + Level */}
        <div style={{ minWidth: 0 }}>
          <p style={{
            fontFamily: 'Orbitron, sans-serif',
            fontWeight: 700,
            fontSize: 'clamp(0.75rem, 2.5vw, 1rem)',
            color: '#fff',
            letterSpacing: '0.12em',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {profile.username}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px' }}>
            <span style={{
              fontFamily: 'Orbitron, sans-serif',
              fontSize: 'clamp(0.58rem, 1.5vw, 0.7rem)',
              color: '#ff6b00',
              letterSpacing: '0.1em',
              flexShrink: 0,
            }}>
              LEVEL {profile.level}
            </span>
            {/* XP bar */}
            <div style={{
              width: 'clamp(40px, 8vw, 100px)',
              height: '3px',
              background: 'rgba(255,255,255,0.06)',
              borderRadius: '2px',
              overflow: 'hidden',
              flexShrink: 0,
            }}>
              <div style={{
                height: '100%',
                width: `${profile.xp % 100}%`,
                background: 'linear-gradient(90deg, #ff6b00, #ff9a00)',
                boxShadow: '0 0 6px rgba(255,107,0,0.6)',
                borderRadius: '2px',
              }} />
            </div>
          </div>
        </div>
      </div>

      {/* Settings */}
      <motion.button
        whileHover={{ scale: 1.1, rotate: 45 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setCurrentPage('account')}
        style={{
          width: '38px', height: '38px', flexShrink: 0,
          border: '1px solid rgba(60,60,60,0.9)',
          borderRadius: '4px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(25,25,25,0.85)',
          cursor: 'pointer',
          transition: 'border-color 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,107,0,0.5)'}
        onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(60,60,60,0.9)'}
      >
        <Settings size={16} color="#555" />
      </motion.button>
    </div>
  );
}
