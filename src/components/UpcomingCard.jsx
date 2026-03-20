import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export default function UpcomingCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="relative mb-6 p-5 rounded cyber-corner-full grid-bg overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #111111 0%, #1a0a00 100%)',
        border: '1px solid rgba(255,107,0,0.25)',
      }}
    >
      {/* Scan line overlay */}
      <div className="absolute inset-0 scanlines pointer-events-none" />

      {/* Floating math particle */}
      <div className="absolute top-3 right-6 text-orange-900/60 text-4xl font-bold particle"
        style={{ fontFamily: 'Orbitron, sans-serif', animationDelay: '0.5s' }}>∑</div>
      <div className="absolute bottom-4 right-20 text-orange-900/40 text-2xl particle"
        style={{ animationDelay: '1.5s' }}>π</div>

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={14} className="text-orange-500" />
          <span className="text-orange-500 text-xs tracking-widest uppercase"
            style={{ fontFamily: 'Share Tech Mono, monospace' }}>
            System Update
          </span>
        </div>

        <h2 className="text-white text-2xl font-black tracking-widest mb-2 glow-orange-text"
          style={{ fontFamily: 'Orbitron, sans-serif' }}>
          UPCOMING NEXT
        </h2>
        <p className="text-gray-400 text-sm mb-4 leading-relaxed" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
          Adding another stage for more<br />difficult and fun challenges!
        </p>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="btn-cyber px-6 py-2.5 text-white relative"
          style={{
            background: 'transparent',
            border: '1px solid rgba(255,107,0,0.5)',
            clipPath: 'polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)',
          }}
        >
          <span className="relative z-10">SEE THE UPDATES</span>
          {/* Corner accent lines */}
          <span className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-orange-500" />
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-orange-500" />
        </motion.button>
      </div>
    </motion.div>
  );
}
