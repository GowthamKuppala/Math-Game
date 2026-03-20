import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Asterisk, Clock, Swords } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { playClick } from '../utils/gameLogic';
import BattleLobby from './BattleLobby';

const modes = [
  { id: 'classic',     label: 'Classic',     icon: Asterisk, desc: '10 questions', color: '#ff6b00' },
  { id: 'time-attack', label: 'Time Attack',  icon: Clock,    desc: '60 seconds',  color: '#ff9a00' },
  { id: 'battle',      label: 'Battle',       icon: Swords,   desc: 'vs opponent', color: '#ff4444' },
];

export default function GameModesSection() {
  const { gameSetup, setGameSetup } = useApp();
  const [showBattleLobby, setShowBattleLobby] = useState(false);

  const handleSelect = (id) => {
    playClick();
    setGameSetup(prev => ({ ...prev, mode: id }));
    // If Battle, open the lobby overlay instead of just selecting
    if (id === 'battle') setShowBattleLobby(true);
  };

  return (
    <>
      <div className="mb-6">
        <div className="section-label mb-3">
          <div className="bars">
            <div className="bar" />
            <div className="bar" />
            <div className="bar" />
          </div>
          <span className="text-white">GAME PLAY</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
          {modes.map(({ id, label, icon: Icon, desc, color }, i) => {
            const isSelected = gameSetup.mode === id;
            return (
              <motion.button
                key={id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => handleSelect(id)}
                style={{
                  position: 'relative',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', gap: '8px',
                  padding: '14px 8px', borderRadius: '6px',
                  background: isSelected ? 'rgba(255,107,0,0.12)' : 'rgba(22,22,22,0.9)',
                  border: isSelected ? `1px solid ${color}` : '1px solid rgba(50,50,50,0.8)',
                  boxShadow: isSelected ? `0 0 20px rgba(255,107,0,0.25)` : 'none',
                  cursor: 'pointer', minWidth: 0, width: '100%',
                  transition: 'all 0.2s ease',
                }}
              >
                {isSelected && (
                  <>
                    <span style={{ position:'absolute', top:0, left:0, width:'10px', height:'10px', borderTop:`2px solid ${color}`, borderLeft:`2px solid ${color}` }} />
                    <span style={{ position:'absolute', bottom:0, right:0, width:'10px', height:'10px', borderBottom:`2px solid ${color}`, borderRight:`2px solid ${color}` }} />
                  </>
                )}
                <Icon size={26} style={{ color: isSelected ? color : '#555', flexShrink: 0 }} strokeWidth={1.5} />
                <span style={{ fontFamily:'Share Tech Mono, monospace', fontSize:'clamp(0.6rem,1.5vw,0.8rem)', color: isSelected ? '#fff' : '#777', textAlign:'center', lineHeight:1.2 }}>
                  {label}
                </span>
                <span style={{ fontFamily:'Share Tech Mono, monospace', fontSize:'clamp(0.55rem,1vw,0.65rem)', color: isSelected ? color : '#444', textAlign:'center' }}>
                  {id === 'battle' ? (
                    <span style={{ color: '#7099ff', fontSize: '0.6rem' }}>⚡ vs Computer/Friend</span>
                  ) : desc}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Battle Lobby overlay */}
      <AnimatePresence>
        {showBattleLobby && (
          <BattleLobby onClose={() => setShowBattleLobby(false)} />
        )}
      </AnimatePresence>
    </>
  );
}
