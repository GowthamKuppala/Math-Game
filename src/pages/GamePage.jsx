import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { generateQuestion, playCorrect, playWrong, calcScore, formatTime } from '../utils/gameLogic';
import { saveSession } from '../utils/api';
import { getSocket } from '../utils/socket';

const CLASSIC_QUESTIONS = 10;
const TIME_ATTACK_DURATION = 60;

export default function GamePage() {
  const { gameSetup, setCurrentPage, setGameState, profile, roomState, refreshSessions, refreshLeaderboard } = useApp();
  const { mode, operator, difficulty, battleOpponent } = gameSetup;

  // Determine if this is a multiplayer (vs friend) session
  const isMultiplayer = mode === 'battle' && battleOpponent === 'friend' && roomState;
  const mpQuestions   = isMultiplayer ? roomState.questions : null;

  const [question, setQuestion]           = useState(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [score, setScore]                 = useState(0);
  const [correct, setCorrect]             = useState(0);
  const [total, setTotal]                 = useState(0);
  const [timeLeft, setTimeLeft]           = useState(mode === 'time-attack' ? TIME_ATTACK_DURATION : null);
  const [feedback, setFeedback]           = useState(null);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [gameOver, setGameOver]           = useState(false);
  const [startTime]                       = useState(Date.now());
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());

  // Battle (computer) opponent
  const [opponentScore, setOpponentScore]     = useState(0);
  const [opponentCorrect, setOpponentCorrect] = useState(0);
  const [opponentName, setOpponentName]       = useState('SYSTEM_AI');
  const opponentRef = useRef(null);

  // Multiplayer opponent state (from socket)
  const [mpOpponentScore, setMpOpponentScore]   = useState(0);
  const [mpOpponentCorrect, setMpOpponentCorrect] = useState(0);

  const nextQuestion = useCallback(() => {
    const q = isMultiplayer
      ? mpQuestions[questionIndex] // server-provided
      : generateQuestion(operator, difficulty);
    setQuestion(q);
    setFeedback(null);
    setSelectedChoice(null);
    setQuestionStartTime(Date.now());
  }, [operator, difficulty, isMultiplayer, mpQuestions, questionIndex]);

  // ── Init ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    nextQuestion();

    if (isMultiplayer) {
      // Set opponent info from room state
      setOpponentName(roomState.opponent?.username || 'OPPONENT');

      // Listen for opponent answers via socket
      const socket = getSocket();
      socket.on('opponent-answered', ({ isCorrect, opponentScore: os, opponentCorrect: oc }) => {
        setMpOpponentScore(os);
        setMpOpponentCorrect(oc);
      });
      socket.on('game-results', (data) => {
        // Results from server — use them directly
        endGame({
          finalCorrect: data.myCorrect,
          finalTotal: CLASSIC_QUESTIONS,
          finalScore: data.myScore,
          battleResult: data.result,
          opponentUsername: data.opponentUsername,
          opponentScore: data.opponentScore,
        });
      });
      socket.on('opponent-left', () => {
        handleGameOver(correct, total, true);
      });

      return () => {
        socket.off('opponent-answered');
        socket.off('game-results');
        socket.off('opponent-left');
      };
    } else if (mode === 'battle') {
      // Computer AI opponent
      let oScore = 0, oCorrect = 0;
      opponentRef.current = setInterval(() => {
        const hit = Math.random() > 0.35;
        if (hit) {
          oScore += 85;
          oCorrect += 1;
          setOpponentScore(oScore);
          setOpponentCorrect(oCorrect);
        }
      }, 2800);
      return () => clearInterval(opponentRef.current);
    }
  }, []);

  // ── Time Attack countdown ─────────────────────────────────────────────────
  useEffect(() => {
    if (mode !== 'time-attack' || gameOver) return;
    if (timeLeft <= 0) { handleGameOver(correct, total); return; }
    const t = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, gameOver, mode]);

  // ── Answer handler ────────────────────────────────────────────────────────
  const handleAnswer = (choice) => {
    if (feedback || gameOver) return;
    const elapsed = Date.now() - questionStartTime;
    setSelectedChoice(choice);
    const isCorrect = choice === question.answer;

    let pts = 0;
    if (isCorrect) {
      playCorrect();
      setFeedback('correct');
      pts = Math.max(50, 100 - Math.floor(elapsed / 100));
      setScore(s => s + pts);
      setCorrect(c => c + 1);
    } else {
      playWrong();
      setFeedback('wrong');
    }
    setTotal(t => t + 1);

    // Emit to server if multiplayer
    if (isMultiplayer) {
      const socket = getSocket();
      socket.emit('answer-submitted', {
        code: roomState.code,
        questionIndex,
        isCorrect,
        points: pts,
      });
    }

    setTimeout(() => {
      const newIndex = questionIndex + 1;
      const maxQuestions = isMultiplayer || mode === 'classic' || mode === 'battle'
        ? CLASSIC_QUESTIONS : Infinity;

      if (newIndex >= maxQuestions) {
        if (isMultiplayer) {
          // Tell server we're done, wait for game-results event
          getSocket().emit('player-finished', { code: roomState.code });
          // Show finishing screen
          setGameOver(true);
        } else {
          handleGameOver(isCorrect ? correct + 1 : correct, total + 1);
        }
      } else {
        setQuestionIndex(newIndex);
        // For multiplayer, questions come from mpQuestions array
        if (isMultiplayer) {
          setQuestion(mpQuestions[newIndex]);
          setFeedback(null);
          setSelectedChoice(null);
          setQuestionStartTime(Date.now());
        } else {
          nextQuestion();
        }
      }
    }, 700);
  };

  const handleGameOver = (finalCorrect = correct, finalTotal = total, opponentLeft = false) => {
    clearInterval(opponentRef.current);
    setGameOver(true);

    const durationMs = Date.now() - startTime;
    const accuracy = finalTotal > 0 ? (finalCorrect / finalTotal) * 100 : 0;
    const finalScore = calcScore(finalCorrect, finalTotal, durationMs, mode);

    let battleResult = null;
    if (mode === 'battle' && !isMultiplayer) {
      battleResult = opponentLeft ? 'win' : finalScore > opponentScore ? 'win' : 'loss';
    }

    endGame({ finalCorrect, finalTotal, finalScore, battleResult, opponentUsername: opponentLeft ? 'SYSTEM_AI' : opponentName, durationMs, accuracy });
  };

  const endGame = async ({ finalCorrect, finalTotal, finalScore, battleResult, opponentUsername, durationMs, accuracy }) => {
    const resolvedAccuracy = accuracy ?? (finalTotal > 0 ? (finalCorrect / finalTotal) * 100 : 0);
    const resolvedDuration = durationMs ?? (Date.now() - startTime);

    const session = {
      username: profile.username,
      mode,
      difficulty: difficulty === 'random' ? 'mixed' : difficulty,
      operator,
      correct: finalCorrect,
      total_questions: finalTotal,
      accuracy: resolvedAccuracy,
      score: finalScore,
      duration_ms: resolvedDuration,
      battle_result: battleResult || null,
      opponent_name: opponentUsername || null,
    };

    setGameState({
      ...session,
      totalQuestions: finalTotal,
      durationMs: resolvedDuration,
      opponentScore: isMultiplayer ? mpOpponentScore : opponentScore,
      opponentName: opponentUsername,
    });

    // Save to backend
    await saveSession(session);
    await refreshSessions();
    await refreshLeaderboard();

    setTimeout(() => setCurrentPage('results'), 600);
  };

  if (!question) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#0a0a0a' }}>
      <p style={{ color:'#ff6b00', fontFamily:'Orbitron, sans-serif', fontSize:'0.8rem' }}>LOADING...</p>
    </div>
  );

  const totalQ = CLASSIC_QUESTIONS;
  const progress = mode === 'classic' || mode === 'battle'
    ? ((questionIndex) / totalQ) * 100
    : ((TIME_ATTACK_DURATION - (timeLeft || 0)) / TIME_ATTACK_DURATION) * 100;

  const currentOpponentScore = isMultiplayer ? mpOpponentScore : opponentScore;
  const currentOpponentName  = isMultiplayer ? (roomState?.opponent?.username || 'OPPONENT') : 'AI';

  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', background:'linear-gradient(180deg,#080808 0%,#0d0a08 100%)' }}>

      {/* Top bar */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 20px 10px' }}>
        <motion.button whileTap={{ scale:0.9 }} onClick={() => setCurrentPage('home')}
          style={{ width:36, height:36, display:'flex', alignItems:'center', justifyContent:'center', border:'1px solid rgba(60,60,60,0.8)', borderRadius:'4px', background:'transparent', cursor:'pointer', color:'#666' }}>
          <ArrowLeft size={16} />
        </motion.button>

        <div style={{ textAlign:'center' }}>
          <p style={{ fontFamily:'Orbitron, sans-serif', fontSize:'0.65rem', color:'#ff6b00', letterSpacing:'0.15em' }}>
            {mode === 'time-attack' ? 'TIME ATTACK' : mode === 'battle' ? (isMultiplayer ? '⚔ VS FRIEND' : '⚔ BATTLE') : 'CLASSIC'}
          </p>
          <p style={{ color:'#444', fontSize:'0.6rem', fontFamily:'Share Tech Mono, monospace' }}>{difficulty?.toUpperCase()}</p>
        </div>

        <div style={{ textAlign:'right' }}>
          {mode === 'time-attack' ? (
            <p style={{ fontFamily:'Orbitron, sans-serif', fontSize:'1.1rem', fontWeight:700, color: timeLeft <= 10 ? '#ff4444' : '#fff' }}>
              {formatTime(timeLeft)}
            </p>
          ) : (
            <p style={{ fontFamily:'Orbitron, sans-serif', fontSize:'1rem', fontWeight:700, color:'#ff6b00' }}>
              {questionIndex + 1}/{totalQ}
            </p>
          )}
          <p style={{ color:'#555', fontSize:'0.6rem' }}>Score: {score}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ padding:'0 20px 14px' }}>
        <div style={{ height:'2px', background:'rgba(255,255,255,0.05)', borderRadius:'2px', overflow:'hidden' }}>
          <motion.div animate={{ width:`${progress}%` }} transition={{ duration:0.3 }}
            style={{ height:'100%', background:'linear-gradient(90deg,#ff6b00,#ff9a00)', boxShadow:'0 0 8px rgba(255,107,0,0.6)' }} />
        </div>
      </div>

      {/* Battle scores bar */}
      {mode === 'battle' && (
        <div style={{ padding:'0 20px 14px' }}>
          <div style={{ display:'flex', gap:'12px', alignItems:'center' }}>
            <div style={{ flex:1 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'3px' }}>
                <span style={{ color:'#ff6b00', fontSize:'0.6rem', fontFamily:'Share Tech Mono, monospace' }}>YOU · {score}</span>
                <span style={{ color:'#555', fontSize:'0.6rem', fontFamily:'Share Tech Mono, monospace' }}>{correct} correct</span>
              </div>
              <div style={{ height:'3px', background:'rgba(255,255,255,0.05)', borderRadius:'2px', overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${Math.min(100,(score/Math.max(score+currentOpponentScore,1))*100)}%`, background:'linear-gradient(90deg,#ff6b00,#ff9a00)', boxShadow:'0 0 6px rgba(255,107,0,0.5)' }} />
              </div>
            </div>
            <span style={{ color:'#555', fontSize:'0.65rem', flexShrink:0 }}>VS</span>
            <div style={{ flex:1 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'3px' }}>
                <span style={{ color:'#ff4444', fontSize:'0.6rem', fontFamily:'Share Tech Mono, monospace' }}>{currentOpponentName} · {currentOpponentScore}</span>
              </div>
              <div style={{ height:'3px', background:'rgba(255,255,255,0.05)', borderRadius:'2px', overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${Math.min(100,(currentOpponentScore/Math.max(score+currentOpponentScore,1))*100)}%`, background:'linear-gradient(90deg,#ff4444,#ff6666)', boxShadow:'0 0 6px rgba(255,68,68,0.5)' }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Question card */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'0 20px' }}>
        <AnimatePresence mode="wait">
          <motion.div key={questionIndex}
            initial={{ opacity:0, scale:0.88, y:20 }}
            animate={{ opacity:1, scale:1, y:0 }}
            exit={{ opacity:0, scale:1.04, y:-15 }}
            transition={{ duration:0.22 }}
            style={{ width:'100%', maxWidth:'520px', marginBottom:'20px' }}>

            <div style={{
              padding:'32px 24px', borderRadius:'8px', textAlign:'center', marginBottom:'16px',
              background:'rgba(15,15,15,0.95)', border:'1px solid rgba(255,107,0,0.15)',
              boxShadow:'0 0 40px rgba(255,107,0,0.04)', position:'relative',
            }}>
              <span style={{ display:'block', color:'#333', fontSize:'0.6rem', letterSpacing:'0.15em', fontFamily:'Share Tech Mono, monospace', marginBottom:'12px' }}>
                SOLVE THE EQUATION
              </span>
              <p style={{ fontFamily:'Orbitron, sans-serif', fontWeight:900, fontSize:'clamp(1.6rem,5vw,2.5rem)', color:'#fff', textShadow:'0 0 20px rgba(255,107,0,0.2)' }}>
                {question.question}
              </p>
            </div>

            {/* Choices */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
              {question.choices.map((choice, i) => {
                const isSel = selectedChoice === choice;
                const isAns = question.answer === choice;
                let border = 'rgba(40,40,40,0.8)';
                let bg = 'rgba(16,16,16,0.95)';
                let textColor = '#777';

                if (isSel && feedback === 'correct') { border='#00ff80'; bg='rgba(0,255,128,0.1)'; textColor='#00ff80'; }
                else if (isSel && feedback === 'wrong')   { border='#ff4444'; bg='rgba(255,68,68,0.1)';  textColor='#ff4444'; }
                else if (feedback && isAns)               { border='#00ff80'; bg='rgba(0,255,128,0.07)'; textColor='#00ff80'; }

                return (
                  <motion.button key={i}
                    whileHover={!feedback ? { scale:1.03, y:-2 } : {}}
                    whileTap={!feedback ? { scale:0.97 } : {}}
                    onClick={() => handleAnswer(choice)}
                    style={{
                      padding:'18px 12px', borderRadius:'6px', fontWeight:700,
                      fontSize:'clamp(1rem,3vw,1.3rem)', transition:'all 0.15s ease',
                      background:bg, border:`1px solid ${border}`,
                      fontFamily:'Orbitron, sans-serif', color:textColor,
                      boxShadow: isSel ? `0 0 15px ${border}40` : 'none',
                      cursor: feedback ? 'default' : 'pointer',
                    }}>
                    {choice}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Feedback pill */}
        <AnimatePresence>
          {feedback && (
            <motion.div initial={{ opacity:0, y:10, scale:0.85 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0 }}
              style={{
                padding:'8px 20px', borderRadius:'20px',
                background: feedback === 'correct' ? 'rgba(0,255,128,0.1)' : 'rgba(255,68,68,0.1)',
                border: `1px solid ${feedback === 'correct' ? '#00ff8040' : '#ff444440'}`,
                color: feedback === 'correct' ? '#00ff80' : '#ff4444',
                fontFamily:'Share Tech Mono, monospace', fontSize:'0.75rem', letterSpacing:'0.1em',
              }}>
              {feedback === 'correct' ? '✓ CORRECT' : '✗ WRONG · Answer: ' + question.answer}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom stats */}
      <div style={{ display:'flex', justifyContent:'space-around', padding:'16px 20px 28px' }}>
        {[
          { label:'Correct', value:correct, color:'#ff6b00' },
          { label:'Accuracy', value:`${total>0?Math.round((correct/total)*100):0}%`, color:'#fff' },
          { label:'Wrong', value:total-correct, color:'#555' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ textAlign:'center' }}>
            <p style={{ fontFamily:'Orbitron, sans-serif', fontSize:'1.1rem', fontWeight:700, color }}>{value}</p>
            <p style={{ color:'#444', fontSize:'0.6rem' }}>{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
