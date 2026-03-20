import { AnimatePresence, motion } from 'framer-motion';
import { AppProvider, useApp } from './context/AppContext';
import BottomNav from './components/BottomNav';
import HomePage from './pages/HomePage';
import GamePage from './pages/GamePage';
import ResultsPage from './pages/ResultsPage';
import LeaderboardPage from './pages/LeaderboardPage';
import HistoryPage from './pages/HistoryPage';
import AccountPage from './pages/AccountPage';

const pageVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

function AppRouter() {
  const { currentPage } = useApp();

  const showNav = !['game', 'results'].includes(currentPage);

  return (
    <div style={{ minHeight: '100vh', width: '100%', background: '#0a0a0a' }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.2, ease: 'easeInOut' }}
        >
          {currentPage === 'home' && <HomePage />}
          {currentPage === 'game' && <GamePage />}
          {currentPage === 'results' && <ResultsPage />}
          {currentPage === 'leaderboard' && <LeaderboardPage />}
          {currentPage === 'history' && <HistoryPage />}
          {currentPage === 'account' && <AccountPage />}
        </motion.div>
      </AnimatePresence>

      {showNav && <BottomNav />}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppRouter />
    </AppProvider>
  );
}
