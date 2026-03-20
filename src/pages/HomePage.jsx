import { motion } from 'framer-motion';
import Header from '../components/Header';
import UpcomingCard from '../components/UpcomingCard';
import GameModesSection from '../components/GameModesSection';
import GameSetupPanel from '../components/GameSetupPanel';
import RecentPlayed from '../components/RecentPlayed';
import { useApp } from '../context/AppContext';
import { playClick } from '../utils/gameLogic';

// Floating background symbols
const symbols = ['∑', '÷', 'π', '√', '≠', '∞', '±', '∫', 'Δ', 'θ', 'λ', 'Ω'];

export default function HomePage() {
  const { setCurrentPage } = useApp();

  const handlePlay = () => {
    playClick();
    setCurrentPage('game');
  };

  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        width: '100%',
        background: '#0a0a0a',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Floating math symbols background */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
        {symbols.map((sym, i) => (
          <motion.span
            key={i}
            style={{
              position: 'absolute',
              left: `${(i * 9 + 4) % 96}%`,
              top: `${(i * 13 + 8) % 88}%`,
              fontSize: `${1.2 + (i % 4) * 0.6}rem`,
              fontFamily: 'Orbitron, sans-serif',
              color: 'rgba(255,107,0,0.06)',
              userSelect: 'none',
            }}
            animate={{
              y: [0, -18, 0],
              opacity: [0.05, 0.12, 0.05],
              rotate: [0, 15, 0],
            }}
            transition={{
              duration: 5 + i * 0.4,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.25,
            }}
          >
            {sym}
          </motion.span>
        ))}

        {/* Orange glow orbs in corners */}
        <div style={{
          position: 'absolute', top: '-100px', right: '-100px',
          width: '400px', height: '400px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,107,0,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '-100px', left: '-80px',
          width: '350px', height: '350px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,107,0,0.04) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
      </div>

      {/* Main content — full width */}
      <div style={{ position: 'relative', zIndex: 10, flex: 1, padding: '0 0 80px 0' }}>

        {/* Top header bar — full width */}
        <div style={{
          borderBottom: '1px solid rgba(255,107,0,0.1)',
          padding: 'clamp(10px, 2vw, 16px) clamp(14px, 3vw, 32px)',
          background: 'rgba(8,8,8,0.9)',
          backdropFilter: 'blur(12px)',
          position: 'sticky',
          top: 0,
          zIndex: 20,
        }}>
          <Header />
        </div>

        {/* 3-column grid layout on desktop */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(240px, 1fr) minmax(280px, 1.4fr) minmax(220px, 1fr)',
          gap: '0',
          minHeight: 'calc(100vh - 73px)',
          alignItems: 'start',
        }}
          className="home-grid"
        >
          {/* LEFT COLUMN — Upcoming + Stats */}
          <div style={{
            padding: '24px 20px 24px 28px',
            borderRight: '1px solid rgba(255,107,0,0.08)',
            minHeight: '100%',
          }}>
            <UpcomingCard />

            {/* Mini stats cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '0' }}>
              {[
                { label: 'Best Mode', value: 'TIME ATTACK', color: '#ff9a00' },
                { label: 'Avg Accuracy', value: '—', color: '#00ff80' },
                { label: 'Total Games', value: '0', color: '#ff6b00' },
                { label: 'Top Score', value: '0', color: '#FFD700' },
              ].map(({ label, value, color }) => (
                <div key={label} style={{
                  background: 'rgba(14,14,14,0.9)',
                  border: '1px solid rgba(35,35,35,0.9)',
                  borderRadius: '6px',
                  padding: '12px',
                }}>
                  <p style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '0.85rem', fontWeight: 700, color }}>
                    {value}
                  </p>
                  <p style={{ color: '#444', fontSize: '0.65rem', marginTop: '2px', fontFamily: 'Share Tech Mono, monospace' }}>
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* CENTER COLUMN — Game modes + Setup */}
          <div style={{
            padding: '24px 24px',
            borderRight: '1px solid rgba(255,107,0,0.08)',
          }}>
            <GameModesSection />
            <GameSetupPanel onPlay={handlePlay} />
          </div>

          {/* RIGHT COLUMN — Recent Played */}
          <div style={{
            padding: '24px 28px 24px 20px',
          }}>
            <RecentPlayed />
          </div>
        </div>
      </div>

      {/* Responsive CSS */}
      <style>{`
        @media (max-width: 1100px) {
          .home-grid {
            grid-template-columns: 1fr 1fr !important;
          }
          .home-grid > div:last-child {
            grid-column: 1 / -1;
            border-top: 1px solid rgba(255,107,0,0.08);
          }
        }
        @media (max-width: 700px) {
          .home-grid {
            grid-template-columns: 1fr !important;
          }
          .home-grid > div {
            border-right: none !important;
            border-top: 1px solid rgba(255,107,0,0.08);
          }
        }
      `}</style>
    </div>
  );
}
