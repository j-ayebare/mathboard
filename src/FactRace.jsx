import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useScores } from './utils.js'
import { ScoreBoard, BtnRow, styles } from './UI.jsx'
import s from './FactRace.module.css'
import { tips } from './tips.js'

const P1_COLOR = '#FF3B30'
const P2_COLOR = '#007AFF'

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function genQuestion(op, difficulty) {
  const max = difficulty === 'easy' ? 10 : difficulty === 'medium' ? 20 : 50
  let a, b, q, ans
  switch (op) {
    case '+':
      a = rand(1, max); b = rand(1, max)
      q = `${a} + ${b}`; ans = a + b; break
    case '-':
      a = rand(1, max); b = rand(1, max)
      if (a < b) [a, b] = [b, a]
      q = `${a} − ${b}`; ans = a - b; break
    case '×':
      a = rand(1, max); b = rand(1, max)
      q = `${a} × ${b}`; ans = a * b; break
    case '÷':
      b = rand(1, 12); ans = rand(1, 12); a = b * ans
      q = `${a} ÷ ${b}`; break
    default:
      a = rand(1, 10); b = rand(1, 10)
      q = `${a} + ${b}`; ans = a + b
  }
  return { q, ans, a, b }
}

function generateOptions(correct, count = 4) {
  const opts = new Set([correct])
  let attempts = 0
  while (opts.size < count && attempts < 100) {
    const candidate = correct + rand(-5, 5)
    if (candidate >= 0 && candidate !== correct) opts.add(candidate)
    attempts++
  }
  let fallback = correct + 1
  while (opts.size < count) {
    if (!opts.has(fallback) && fallback >= 0) opts.add(fallback)
    fallback++
  }
  return Array.from(opts).sort(() => Math.random() - 0.5)
}

function getTip(op, a, b) {
  const db = tips[op]
  if (!db) return null
  const key1 = `${a},${b}`, key2 = `${b},${a}`
  if (db.exact?.[key1]) return db.exact[key1]
  if (db.exact?.[key2]) return db.exact[key2]
  if (db.patterns) {
    for (const pattern of db.patterns) {
      try {
        const fn = new Function('a', 'b', `return (${pattern.condition})`)
        if (fn(a, b)) return pattern.tip
      } catch {}
    }
  }
  return null
}

function getQuestionFontSize(question) {
  if (!question?.q) return 'clamp(32px, 4vw, 56px)'
  const len = question.q.length
  if (len <= 6)  return 'clamp(48px, 7vw, 88px)'
  if (len <= 10) return 'clamp(40px, 6vw, 72px)'
  if (len <= 14) return 'clamp(34px, 5vw, 60px)'
  return 'clamp(28px, 4vw, 50px)'
}

// ---------- PlayerPanel ----------
function PlayerPanel({
  player, color, name, setName,
  score, streak, answer, submitted, feedback, otherScore,
  gameState, isValidQ, inputMode, options,
  hintShown, hintAvailable,
  onSelect, onKeypad, onConfirm, onHint,
}) {
  const hintEnabled = score > 0 && !hintShown && hintAvailable
  let hintLabel = '💡'
  if (hintShown) {
    hintLabel += ' (used)'
  } else if (score === 0) {
    hintLabel += ' (need pts)'
  } else if (!hintAvailable) {
    hintLabel += ' No hint'
  } else {
    hintLabel += ' −1 pt'
  }

  return (
    <div className={s.playerPanel} style={{ '--player-color': color }}>
      <div className={s.playerHeader}>
        <div className={s.playerDot} />
        <input
          type="text" value={name} onChange={e => setName(e.target.value)}
          className={s.playerNameInput} maxLength={20}
          placeholder={`Player ${player}`} disabled={gameState !== 'idle'}
        />
      </div>

      <div className={s.playerScore}>
        Score: <span>{score}</span>
        {streak > 0 && <span className={s.streak}>🔥 {streak}</span>}
      </div>

      <div className={s.playerFeedback}>
        {feedback === 'correct' && <span className={s.feedCorrect}>✓</span>}
        {feedback === 'wrong'   && <span className={s.feedWrong}>✗</span>}
      </div>

      {gameState === 'playing' && isValidQ && (
        <div className={s.playerInputArea}>
          {inputMode === 'choice' ? (
            <div className={s.choiceGrid}>
              {options.map((opt, idx) => (
                <button key={idx}
                  className={`${s.choiceBtn} ${answer === opt ? s.selected : ''} ${submitted ? s.submitted : ''}`}
                  style={answer === opt ? { borderColor: color, background: color + '33' } : {}}
                  onClick={() => onSelect(opt)}
                  disabled={submitted}>
                  {opt}
                </button>
              ))}
            </div>
          ) : (
            <div className={s.keypad}>
              <div className={s.keypadDisplay} style={submitted ? { borderColor: color } : {}}>
                {answer !== null ? answer : <span style={{ opacity: 0.4 }}>?</span>}
              </div>
              <div className={s.keypadGrid}>
                {[7, 8, 9, 4, 5, 6, 1, 2, 3, 'C', 0, '⌫'].map(key => (
                  <button key={key} className={s.keypadBtn}
                    onClick={() => onKeypad(key)}
                    disabled={submitted}>
                    {key}
                  </button>
                ))}
              </div>
              <button
                className={`${s.confirmBtn} ${submitted ? s.confirmBtnDone : ''}`}
                onClick={onConfirm}
                disabled={submitted || answer === null}
                style={!submitted && answer !== null ? { borderColor: color, color } : {}}>
                {submitted ? '✓ Locked in' : 'Confirm'}
              </button>
            </div>
          )}

          <button
            className={`${s.hintBtn} ${!hintEnabled ? s.hintBtnDisabled : ''}`}
            style={hintEnabled ? { borderColor: color, color } : {}}
            onClick={onHint}
            disabled={!hintEnabled}
            title={hintShown ? 'Hint already used' : score === 0 ? 'Need at least 1 point' : !hintAvailable ? 'No hint for this question' : 'Reveal hint (costs 1 point)'}>
            {hintLabel}
          </button>
        </div>
      )}

      {gameState === 'ended' && (
        <div className={s.endedStatus} style={{ color }}>
          {score > otherScore ? '🏆 Winner!' : score === otherScore ? '🤝 Tie' : ''}
        </div>
      )}
    </div>
  )
}

// ---------- Tutorial Overlay ----------
function TutorialOverlay({ onClose }) {
  return (
    <div className={s.tutorialOverlay} onClick={onClose}>
      <div className={s.tutorialModal} onClick={e => e.stopPropagation()}>
        <button className={s.tutorialClose} onClick={onClose}>✕</button>
        <h2>How to Play Fact Race</h2>
        <div className={s.tutorialContent}>
          <p><strong>Goal:</strong> Answer math facts faster than your opponent!</p>
          <ul>
            <li><strong>Each round:</strong> Both players see the same question.</li>
            <li><strong>Answer:</strong> Tap your answer (multiple choice) or type it (keypad) and confirm.</li>
            <li><strong>Scoring:</strong>
              <ul>
                <li>First correct: <strong>+2 points</strong></li>
                <li>Second correct (or both): <strong>+1 point</strong></li>
                <li>Wrong answer: <strong>0 points</strong></li>
              </ul>
            </li>
            <li><strong>Game modes:</strong>
              <ul>
                <li><strong>Timed:</strong> Race against the clock – most points when time runs out wins.</li>
                <li><strong>First To:</strong> No time limit – first player to reach the target score wins.</li>
              </ul>
            </li>
            <li><strong>Hints:</strong> Each player can <strong>buy a hint</strong> for <strong>1 point</strong> – click the 💡 button.</li>
          </ul>
          <p style={{ marginTop: 12, color: '#FFD700' }}>Good luck! 🏁</p>
        </div>
      </div>
    </div>
  )
}

// ---------- Main Component ----------
export default function FactRace() {
  const [op, setOp]               = useState('+')
  const [difficulty, setDiff]     = useState('medium')
  const [gameMode, setGameMode]   = useState('timed')
  const [timeLimit, setTimeLimit] = useState(60)
  const [targetScore, setTargetScore] = useState(10)
  const [hintDelay, setHintDelay] = useState(10)
  const [inputMode, setInputMode] = useState('choice')

  const [gameState, setGameState] = useState('idle')
  const [question, setQuestion]   = useState(null)
  const [options, setOptions]     = useState([])
  const [timer, setTimer]         = useState(60)
  const [round, setRound]         = useState(0)

  const [p1Name, setP1Name]           = useState('Player 1')
  const [p2Name, setP2Name]           = useState('Player 2')
  const [p1Score, setP1Score]         = useState(0)
  const [p2Score, setP2Score]         = useState(0)
  const [p1Streak, setP1Streak]       = useState(0)
  const [p2Streak, setP2Streak]       = useState(0)
  const [p1Answer, setP1Answer]       = useState(null)
  const [p2Answer, setP2Answer]       = useState(null)
  const [p1Submitted, setP1Submitted] = useState(false)
  const [p2Submitted, setP2Submitted] = useState(false)
  const [p1Feedback, setP1Feedback]   = useState(null)
  const [p2Feedback, setP2Feedback]   = useState(null)
  const [roundResult, setRoundResult] = useState(null)

  const [currentTip, setCurrentTip]           = useState(null)
  const [hintTimer, setHintTimer]             = useState(10)
  const hintShownRef                          = useRef(false)
  const [hintShownState, setHintShownState]   = useState(false)
  const [noHintAvailable, setNoHintAvailable] = useState(false)

  const [showScores, setShowScores]       = useState(false)
  const [showTutorial, setShowTutorial]   = useState(false)
  const [scores, addScore, clearScores]   = useScores('factrace')

  const timerRef     = useRef()
  const hintTimerRef = useRef()
  const hintTimeoutRef = useRef()
  const roundTimeout = useRef()
  const processingRound = useRef(false)

  const p1ScoreRef = useRef(0)
  const p2ScoreRef = useRef(0)
  useEffect(() => { p1ScoreRef.current = p1Score }, [p1Score])
  useEffect(() => { p2ScoreRef.current = p2Score }, [p2Score])

  const setHintShown = (val) => {
    hintShownRef.current = val
    setHintShownState(val)
  }

  // ---------- Main game countdown (timed mode only) ----------
  useEffect(() => {
    if (gameState === 'playing' && gameMode === 'timed') {
      timerRef.current = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current)
            endGame('timeout')
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(timerRef.current)
  }, [gameState, gameMode])

  // ---------- Auto‑hint (timeout + countdown) ----------
  useEffect(() => {
    if (gameState !== 'playing' || !question) {
      setNoHintAvailable(false)
      clearTimeout(hintTimeoutRef.current)
      clearInterval(hintTimerRef.current)
      return
    }

    const tip = getTip(op, question.a, question.b)
    if (!tip) {
      setNoHintAvailable(true)
      setCurrentTip(null)
      setHintShown(false)
      clearTimeout(hintTimeoutRef.current)
      clearInterval(hintTimerRef.current)
      return
    }

    setNoHintAvailable(false)

    if (hintShownRef.current) {
      clearTimeout(hintTimeoutRef.current)
      clearInterval(hintTimerRef.current)
      return
    }

    // Clear any previous timers
    clearTimeout(hintTimeoutRef.current)
    clearInterval(hintTimerRef.current)

    // Start countdown display
    setHintTimer(hintDelay)
    hintTimerRef.current = setInterval(() => {
      setHintTimer(prev => {
        if (prev <= 1) {
          clearInterval(hintTimerRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    // Set the actual hint trigger
    hintTimeoutRef.current = setTimeout(() => {
      if (!hintShownRef.current && question) {
        const tipNow = getTip(op, question.a, question.b)
        if (tipNow) {
          setCurrentTip(tipNow)
          setHintShown(true)
        }
      }
      clearInterval(hintTimerRef.current)
    }, hintDelay * 1000)

    return () => {
      clearTimeout(hintTimeoutRef.current)
      clearInterval(hintTimerRef.current)
    }
  }, [gameState, question, op, hintDelay])

  useEffect(() => () => {
    clearTimeout(roundTimeout.current)
    clearTimeout(hintTimeoutRef.current)
    clearInterval(hintTimerRef.current)
    clearInterval(timerRef.current)
  }, [])

  const nextQuestion = useCallback(() => {
    const q = genQuestion(op, difficulty)
    setQuestion(q)
    setOptions(generateOptions(q.ans))
    setP1Answer(null); setP2Answer(null)
    setP1Submitted(false); setP2Submitted(false)
    setP1Feedback(null); setP2Feedback(null)
    setRoundResult(null)
    setCurrentTip(null)
    setHintShown(false)
    setHintTimer(hintDelay)
    processingRound.current = false
  }, [op, difficulty, hintDelay])

  // ---------- End game ----------
  const endGame = useCallback((reason = 'timeout') => {
    setGameState('ended')
    clearTimeout(hintTimeoutRef.current)
    clearInterval(hintTimerRef.current)
    clearInterval(timerRef.current)
    clearTimeout(roundTimeout.current)

    const s1 = p1ScoreRef.current
    const s2 = p2ScoreRef.current
    let winner = 'Tie'
    if (s1 > s2) winner = p1Name
    else if (s2 > s1) winner = p2Name

    let scoreStr = `${s1}–${s2}`
    if (reason === 'firstTo') {
      scoreStr = `${s1}–${s2} (First to ${targetScore})`
    }
    addScore({ Player: winner, Score: scoreStr, Date: new Date().toLocaleDateString() })
  }, [p1Name, p2Name, addScore, targetScore])

  const endGameEarly = () => {
    if (gameState !== 'playing') return
    clearInterval(timerRef.current)
    clearTimeout(hintTimeoutRef.current)
    clearInterval(hintTimerRef.current)
    endGame('early')
  }

  const startGame = () => {
    setGameState('playing')
    if (gameMode === 'timed') {
      setTimer(timeLimit)
    } else {
      setTimer(0)
    }
    setP1Score(0); setP2Score(0)
    setP1Streak(0); setP2Streak(0)
    setRound(0)
    setCurrentTip(null); setHintShown(false); setHintTimer(hintDelay)
    processingRound.current = false
    nextQuestion()
  }

  const backToConfig = () => {
    setGameState('idle')
    if (gameMode === 'timed') setTimer(timeLimit)
    else setTimer(0)
    setP1Score(0); setP2Score(0)
    setP1Streak(0); setP2Streak(0)
    setCurrentTip(null); setHintShown(false); setHintTimer(hintDelay)
    clearInterval(timerRef.current)
    clearTimeout(hintTimeoutRef.current)
    clearInterval(hintTimerRef.current)
    clearTimeout(roundTimeout.current)
    processingRound.current = false
  }

  // ---------- Input handlers ----------
  const handleSelect = (player, value) => {
    if (gameState !== 'playing') return
    if (player === 1 && !p1Submitted) { setP1Answer(value); setP1Submitted(true) }
    else if (player === 2 && !p2Submitted) { setP2Answer(value); setP2Submitted(true) }
  }

  const handleKeypad = (player, key) => {
    if (gameState !== 'playing') return
    const isP1      = player === 1
    const submitted = isP1 ? p1Submitted : p2Submitted
    if (submitted) return
    const current   = isP1 ? p1Answer    : p2Answer
    const setter    = isP1 ? setP1Answer : setP2Answer

    if (key === '⌫') {
      if (current === null) return
      const newStr = String(current).slice(0, -1)
      setter(newStr === '' ? null : Number(newStr))
    } else if (key === 'C') {
      setter(null)
    } else {
      const digit = Number(key)
      if (isNaN(digit)) return
      setter(current === null ? digit : Number(String(current) + digit))
    }
  }

  const handleConfirm = (player) => {
    if (gameState !== 'playing') return
    const isP1      = player === 1
    const submitted = isP1 ? p1Submitted : p2Submitted
    const answer    = isP1 ? p1Answer    : p2Answer
    if (submitted || answer === null) return
    if (isP1) setP1Submitted(true)
    else      setP2Submitted(true)
  }

  // ---------- Hint ----------
  const canUseHint = (playerScore) => {
    if (hintShownRef.current) return false
    if (!question) return false
    const tip = getTip(op, question.a, question.b)
    if (!tip) return false
    return playerScore > 0
  }

  const handleHint = (player) => {
    const score = player === 1 ? p1ScoreRef.current : p2ScoreRef.current
    if (!canUseHint(score)) return
    if (player === 1) setP1Score(prev => Math.max(0, prev - 1))
    else              setP2Score(prev => Math.max(0, prev - 1))
    const tip = getTip(op, question.a, question.b)
    setCurrentTip(tip)
    setHintShown(true)
    clearTimeout(hintTimeoutRef.current)
    clearInterval(hintTimerRef.current)
  }

  // ---------- Round resolution ----------
  useEffect(() => {
    if (gameState !== 'playing') return
    if (!question) return
    if (!p1Submitted || !p2Submitted) return
    if (processingRound.current) return
    processingRound.current = true

    const p1Correct = p1Answer === question.ans
    const p2Correct = p2Answer === question.ans
    setP1Feedback(p1Correct ? 'correct' : 'wrong')
    setP2Feedback(p2Correct ? 'correct' : 'wrong')

    let p1Got = 0, p2Got = 0, result = 'none'
    if      (p1Correct && p2Correct)  { p1Got = 1; p2Got = 1; result = 'both' }
    else if (p1Correct)               { p1Got = 2; result = 'p1' }
    else if (p2Correct)               { p2Got = 2; result = 'p2' }

    const newP1Score = p1Score + p1Got
    const newP2Score = p2Score + p2Got
    setP1Score(newP1Score)
    setP2Score(newP2Score)
    setRoundResult(result)
    setP1Streak(prev => p1Correct ? prev + 1 : 0)
    setP2Streak(prev => p2Correct ? prev + 1 : 0)

    p1ScoreRef.current = newP1Score
    p2ScoreRef.current = newP2Score

    if (gameMode === 'firstTo') {
      if (newP1Score >= targetScore || newP2Score >= targetScore) {
        clearTimeout(roundTimeout.current)
        clearInterval(timerRef.current)
        clearTimeout(hintTimeoutRef.current)
        clearInterval(hintTimerRef.current)
        endGame('firstTo')
        processingRound.current = false
        return
      }
    }

    clearTimeout(roundTimeout.current)
    roundTimeout.current = setTimeout(() => {
      setRound(r => r + 1)
      nextQuestion()
    }, 1500)
  }, [p1Submitted, p2Submitted, question, gameState, p1Answer, p2Answer, p1Score, p2Score, gameMode, targetScore, endGame, nextQuestion])

  const isValidQ = question?.q
  const tipExists = question ? !!getTip(op, question.a, question.b) : false
  const showTimer = gameMode === 'timed'

  return (
    <div className={s.page}>
      <div className={s.pageTitle}>Fact Race</div>
      <div className={s.pageSubtitle}>Race your opponent – answer faster!</div>

      {/* Config Bar */}
      {gameState === 'idle' && (
        <div className={s.configBar}>
          <div className={s.configGroup}>
            <label>Operation</label>
            <div className={s.opRow}>
              {['+', '-', '×', '÷'].map(o => (
                <button key={o} className={`${styles.btn} ${styles.btnSm} ${op === o ? styles.btnPrimary : styles.btnSecondary}`} onClick={() => setOp(o)}>{o}</button>
              ))}
            </div>
          </div>
          <div className={s.configGroup}>
            <label>Difficulty</label>
            <div className={s.diffRow}>
              {['easy', 'medium', 'hard'].map(d => (
                <button key={d} className={`${styles.btn} ${styles.btnSm} ${difficulty === d ? styles.btnPrimary : styles.btnSecondary}`} onClick={() => setDiff(d)}>
                  {d.charAt(0).toUpperCase() + d.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className={s.configGroup}>
            <label>Mode</label>
            <div className={s.modeRow}>
              <button
                className={`${styles.btn} ${styles.btnSm} ${gameMode === 'timed' ? styles.btnPrimary : styles.btnSecondary}`}
                onClick={() => setGameMode('timed')}>
                ⏱ Timed
              </button>
              <button
                className={`${styles.btn} ${styles.btnSm} ${gameMode === 'firstTo' ? styles.btnPrimary : styles.btnSecondary}`}
                onClick={() => setGameMode('firstTo')}>
                🏆 First To
              </button>
            </div>
          </div>

          {gameMode === 'timed' && (
            <div className={s.configGroup}>
              <label>Time (s)</label>
              <div className={s.timeRow}>
                {[30, 60, 90, 120].map(t => (
                  <button key={t} className={`${styles.btn} ${styles.btnSm} ${timeLimit === t ? styles.btnPrimary : styles.btnSecondary}`} onClick={() => setTimeLimit(t)}>{t}</button>
                ))}
              </div>
            </div>
          )}

          {gameMode === 'firstTo' && (
            <div className={s.configGroup}>
              <label>Target Score</label>
              <div className={s.timeRow}>
                {[5, 10, 15, 20].map(t => (
                  <button key={t} className={`${styles.btn} ${styles.btnSm} ${targetScore === t ? styles.btnPrimary : styles.btnSecondary}`} onClick={() => setTargetScore(t)}>{t}</button>
                ))}
              </div>
            </div>
          )}

          <div className={s.configGroup}>
            <label>Auto-hint (s)</label>
            <div className={s.timeRow}>
              {[10, 20, 30].map(d => (
                <button key={d} className={`${styles.btn} ${styles.btnSm} ${hintDelay === d ? styles.btnPrimary : styles.btnSecondary}`} onClick={() => setHintDelay(d)}>{d}</button>
              ))}
            </div>
          </div>

          <div className={s.configGroup}>
            <label>Input Mode</label>
            <div className={s.modeRow}>
              <button className={`${styles.btn} ${styles.btnSm} ${inputMode === 'choice' ? styles.btnPrimary : styles.btnSecondary}`} onClick={() => setInputMode('choice')}>Multiple Choice</button>
              <button className={`${styles.btn} ${styles.btnSm} ${inputMode === 'keypad' ? styles.btnPrimary : styles.btnSecondary}`} onClick={() => setInputMode('keypad')}>Keypad</button>
            </div>
          </div>

          <button className={`${styles.btn} ${styles.btnSecondary} ${s.tutorialBtn}`} onClick={() => setShowTutorial(true)}>
            ❓ How to Play
          </button>
        </div>
      )}

      {showTutorial && <TutorialOverlay onClose={() => setShowTutorial(false)} />}

      {/* Game Layout */}
      <div className={s.gameLayout}>
        <PlayerPanel
          player={1} color={P1_COLOR}
          name={p1Name} setName={setP1Name}
          score={p1Score} streak={p1Streak}
          answer={p1Answer} submitted={p1Submitted} feedback={p1Feedback}
          otherScore={p2Score}
          gameState={gameState} isValidQ={isValidQ}
          inputMode={inputMode} options={options}
          hintShown={hintShownState}
          hintAvailable={tipExists && !noHintAvailable}
          onSelect={v => handleSelect(1, v)}
          onKeypad={k => handleKeypad(1, k)}
          onConfirm={() => handleConfirm(1)}
          onHint={() => handleHint(1)}
        />

        {/* Center Panel */}
        <div className={s.centerPanel}>
          {gameState === 'idle' && (
            <div className={s.startPrompt}>
              <p>Configure settings above, then start the race!</p>
              <button className={`${styles.btn} ${styles.btnPrimary} ${s.startBtn}`} onClick={startGame}>Start Race 🏁</button>
            </div>
          )}

          {gameState === 'playing' && (
            <>
              <div className={s.timer}>
                {showTimer ? `⏱ ${timer}s` : `🎯 First to ${targetScore}`}
              </div>

              <div className={s.questionWrapper}>
                <span className={s.question} style={{ fontSize: getQuestionFontSize(question) }}>
                  {isValidQ ? `${question.q} = ?` : 'Loading...'}
                </span>
              </div>

              {currentTip && (
                <div className={`${s.hintBanner} ${s.hintBannerShow}`}>
                  <span className={s.hintIcon}>💡</span>
                  <span className={s.hintText}>{currentTip}</span>
                  <button className={s.hintClose} onClick={() => setCurrentTip(null)}>✕</button>
                </div>
              )}
              {!hintShownState && !currentTip && !noHintAvailable && (
                <div className={s.hintTimer}>💡 Hint in {hintTimer}s</div>
              )}
              {!hintShownState && !currentTip && noHintAvailable && (
                <div className={s.hintTimer} style={{ color: '#FF6B6B' }}>💡 No hint available</div>
              )}
              <div className={s.roundInfo}>
                Round {round + 1}
                {roundResult && (
                  <span className={s.roundResult}>
                    {roundResult === 'p1' && `👑 ${p1Name} got it!`}
                    {roundResult === 'p2' && `👑 ${p2Name} got it!`}
                    {roundResult === 'both' && 'Both correct!'}
                    {roundResult === 'none' && 'Nobody got it!'}
                  </span>
                )}
              </div>
              <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={endGameEarly}>End Game</button>
            </>
          )}

          {gameState === 'ended' && (
            <div className={s.gameOver}>
              <h2>
                {gameMode === 'firstTo' && p1Score >= targetScore && `🏆 ${p1Name} reached ${targetScore} first!`}
                {gameMode === 'firstTo' && p2Score >= targetScore && `🏆 ${p2Name} reached ${targetScore} first!`}
                {gameMode === 'firstTo' && p1Score === p2Score && "It's a tie! 🤝"}
                {gameMode === 'timed' && "⏰ Time's up!"}
              </h2>
              <div className={s.finalScore}>
                <div style={{ borderLeft: `4px solid ${P1_COLOR}` }}>{p1Name}: {p1Score}</div>
                <div style={{ borderLeft: `4px solid ${P2_COLOR}` }}>{p2Name}: {p2Score}</div>
                {gameMode === 'firstTo' && (
                  <div style={{ color: '#FFD700', fontSize: '20px', width: '100%', textAlign: 'center', marginTop: 4 }}>
                    Target: {targetScore}
                  </div>
                )}
              </div>
              <div className={s.winner}>
                {p1Score > p2Score && <span style={{ color: P1_COLOR }}>🏆 {p1Name} wins!</span>}
                {p2Score > p1Score && <span style={{ color: P2_COLOR }}>🏆 {p2Name} wins!</span>}
                {p1Score === p2Score && "It's a tie! 🤝"}
              </div>
              <div className={s.endButtons}>
                <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={startGame}>Play Again</button>
                <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={backToConfig}>⚙️ Back to Config</button>
              </div>
            </div>
          )}
        </div>

        <PlayerPanel
          player={2} color={P2_COLOR}
          name={p2Name} setName={setP2Name}
          score={p2Score} streak={p2Streak}
          answer={p2Answer} submitted={p2Submitted} feedback={p2Feedback}
          otherScore={p1Score}
          gameState={gameState} isValidQ={isValidQ}
          inputMode={inputMode} options={options}
          hintShown={hintShownState}
          hintAvailable={tipExists && !noHintAvailable}
          onSelect={v => handleSelect(2, v)}
          onKeypad={k => handleKeypad(2, k)}
          onConfirm={() => handleConfirm(2)}
          onHint={() => handleHint(2)}
        />
      </div>

      <BtnRow>
        <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={() => setShowScores(!showScores)}>🏆 Scores</button>
      </BtnRow>
      {showScores && (
        <div style={{ marginTop: 24 }}>
          <ScoreBoard scores={scores} onClear={clearScores} cols={['#', 'Player', 'Score', 'Date']} />
        </div>
      )}
    </div>
  )
}