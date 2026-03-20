import { useApp } from '../context/AppContext';
import { Home, Trophy, BookOpen, User } from 'lucide-react';

const navItems = [
  { id: 'home', label: 'HOME', icon: Home },
  { id: 'leaderboard', label: 'LEADERBOARD', icon: Trophy },
  { id: 'history', label: 'HISTORY', icon: BookOpen },
  { id: 'account', label: 'ACCOUNT', icon: User },
];

export default function BottomNav() {
  const { currentPage, setCurrentPage } = useApp();

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        background: 'rgba(8,8,8,0.97)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,107,0,0.15)',
        boxShadow: '0 -4px 30px rgba(0,0,0,0.8)',
      }}
    >
      <div
        style={{
          maxWidth: '900px',
          margin: '0 auto',
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
        }}
      >
        {navItems.map(({ id, label, icon: Icon }) => {
          const isActive = currentPage === id;
          return (
            <button
              key={id}
              id={`nav-${id}`}
              onClick={() => setCurrentPage(id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 16px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                position: 'relative',
                minWidth: '60px',
              }}
            >
              {/* Active top bar */}
              {isActive && (
                <div style={{
                  position: 'absolute',
                  top: '-10px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '32px',
                  height: '2px',
                  background: '#ff6b00',
                  borderRadius: '2px',
                  boxShadow: '0 0 8px #ff6b00',
                }} />
              )}

              {/* Icon or active dots */}
              {isActive ? (
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center', height: '20px' }}>
                  <div style={{
                    width: '10px', height: '10px', borderRadius: '50%',
                    background: '#ff6b00',
                    boxShadow: '0 0 8px #ff6b00',
                  }} />
                  <div style={{
                    width: '10px', height: '10px', borderRadius: '50%',
                    background: '#cc4400',
                  }} />
                </div>
              ) : (
                <Icon size={20} style={{ color: '#555' }} />
              )}

              {/* Label */}
              <span style={{
                fontFamily: 'Orbitron, sans-serif',
                fontSize: '0.58rem',
                letterSpacing: '0.1em',
                color: isActive ? '#ff6b00' : '#555',
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
              }}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
