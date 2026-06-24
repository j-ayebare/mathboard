import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useScores } from './utils.js'
import { ScoreBoard, BtnRow, styles } from './UI.jsx'
import s from './Rubix.module.css'

// ----- Distinct Rubik's Cube Colors -----
const FACE_COLORS = {
  white:  '#FFFFFF',
  yellow: '#FFD500',
  red:    '#D32F2F',
  orange: '#F57C00',
  blue:   '#1976D2',
  green:  '#388E3C'
}
const COLOR_NAMES = Object.keys(FACE_COLORS)

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// ----- Generate a random 3×3 grid -----
function generateGrid() {
  return Array.from({ length: 3 }, () =>
    Array.from({ length: 3 }, () => COLOR_NAMES[rand(0, COLOR_NAMES.length - 1)])
  )
}

// ----- Generate two cards with at least one valid target color -----
function generateCards() {
  let grid1, grid2, targetColors
  let attempts = 0
  do {
    grid1 = generateGrid()
    grid2 = generateGrid()
    const count1 = {}
    const count2 = {}
    grid1.flat().forEach(c => { count1[c] = (count1[c] || 0) + 1 })
    grid2.flat().forEach(c => { count2[c] = (count2[c] || 0) + 1 })

    // Colors that appear on exactly one card (unique to P1 or P2)
    const unique = COLOR_NAMES.filter(c =>
      (count1[c] || 0) > 0 !== (count2[c] || 0) > 0
    )

    // Colors that appear on neither card
    const presentOnCards = new Set([...Object.keys(count1), ...Object.keys(count2)])
    const missing = COLOR_NAMES.filter(c => !presentOnCards.has(c))

    targetColors = [...unique, ...missing]
    attempts++
  } while (targetColors.length === 0 && attempts < 100)

  // Ultimate fallback – force a difference
  if (targetColors.length === 0) {
    grid2[0][0] = grid2[0][0] === 'white' ? 'yellow' : 'white'
    const count1 = {}
    const count2 = {}
    grid1.flat().forEach(c => { count1[c] = (count1[c] || 0) + 1 })
    grid2.flat().forEach(c => { count2[c] = (count2[c] || 0) + 1 })
    const unique = COLOR_NAMES.filter(c =>
      (count1[c] || 0) > 0 !== (count2[c] || 0) > 0
    )
    const presentOnCards = new Set([...Object.keys(count1), ...Object.keys(count2)])
    const missing = COLOR_NAMES.filter(c => !presentOnCards.has(c))
    targetColors = [...unique, ...missing]
  }

  return { grid1, grid2, targetColors }
}

// ----- Render a single 3×3 grid -----
function Grid({ grid, label }) {
  return (
    <div className={s.gridWrapper}>
      <div className={s.gridLabel}>{label}</div>
      <div className={s.grid}>
        {grid.map((row, r) => (
          <div key={r} className={s.gridRow}>
            {row.map((color, c) => (
              <div
                key={c}
                className={s.cell}
                style={{ backgroundColor: FACE_COLORS[color] }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

// ----- Color buttons for a single player (with labels) -----
function ColorButtons({ onSelect, disabled }) {
  return (
    <div className={s.colorButtons}>
      {COLOR_NAMES.map(color => (
        <div key={color} className={s.colorBtnWrapper}>
          <button
            className={s.colorBtn}
            style={{ backgroundColor: FACE_COLORS[color] }}
            onClick={() => onSelect(color)}
            disabled={disabled}
            aria-label={color}
          />
          <span className={s.colorLabel}>{color}</span>
        </div>
      ))}
    </div>
  )
}

// ----- Tutorial Overlay -----
function TutorialOverlay({ onClose }) {
  return (
    <div className={s.tutorialOverlay} onClick={onClose}>
      <div className={s.tutorialModal} onClick={e => e.stopPropagation()}>
        <button className={s.tutorialClose} onClick={onClose}>✕</button>
        <h2>How to Play Rubik's Battle</h2>
        <div className={s.tutorialContent}>
          <p><strong>Goal:</strong> Be the first to spot the <strong>unique colour</strong>!</p>
          <ul>
            <li>Two 3×3 cards are shown – one for each player.</li>
            <li>Find a colour that appears on <strong>exactly one</strong> of the two cards, <br />
                <em>or</em> a colour that appears on <strong>neither</strong> card.
            </li>
            <li>Tap the matching colour button faster than your opponent.</li>
            <li><strong>Correct</strong> → +1 point. <strong>Wrong</strong> → –1 point.</li>
            <li>First to tap correctly wins the round.</li>
          </ul>
          <p style={{ marginTop: 12, color: '#FFD700' }}>Good luck! 🎯</p>
        </div>
      </div>
    </div>
  )
}

// ---------- Main Component ----------
export default function RubixBattle() {
  // Config
  const [gameMode, setGameMode] = useState('timed')
  const [timeLimit, setTimeLimit] = useState(60)
  const [targetScore, setTargetScore] = useState(5)

  // Game state
  const [gameState, setGameState] = useState('idle')
  const [timer, setTimer] = useState(60)
  const [round, setRound] = useState(0)

  // Cards and target colours
  const [grid1, setGrid1] = useState(null)
  const [grid2, setGrid2] = useState(null)
  const [targetColors, setTargetColors] = useState([])

  // Players
  const [p1Name, setP1Name] = useState('Player 1')
  const [p2Name, setP2Name] = useState('Player 2')
  const [p1Score, setP1Score] = useState(0)
  const [p2Score, setP2Score] = useState(0)
  const [roundWinner, setRoundWinner] = useState(null) // 'p1', 'p2', or null
  const [p1Locked, setP1Locked] = useState(false)
  const [p2Locked, setP2Locked] = useState(false)

  const [showScores, setShowScores] = useState(false)
  const [showTutorial, setShowTutorial] = useState(false)
  const [scores, addScore, clearScores] = useScores('rubix')

  const timerRef = useRef()
  const roundTimeout = useRef()
  const processingRound = useRef(false)

  const p1ScoreRef = useRef(0)
  const p2ScoreRef = useRef(0)
  useEffect(() => { p1ScoreRef.current = p1Score }, [p1Score])
  useEffect(() => { p2ScoreRef.current = p2Score }, [p2Score])

  // ----- Timer (only in Timed mode) -----
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

  // ----- New Round -----
  const nextRound = useCallback(() => {
    const { grid1: g1, grid2: g2, targetColors: tc } = generateCards()
    setGrid1(g1)
    setGrid2(g2)
    setTargetColors(tc)
    setP1Locked(false)
    setP2Locked(false)
    setRoundWinner(null)
    processingRound.current = false
  }, [])

  // ----- End Game -----
  const endGame = useCallback((reason = 'timeout') => {
    setGameState('ended')
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
    endGame('early')
  }

  const startGame = () => {
    setGameState('playing')
    if (gameMode === 'timed') setTimer(timeLimit)
    setP1Score(0); setP2Score(0)
    setRound(0)
    processingRound.current = false
    nextRound()
  }

  const backToConfig = () => {
    setGameState('idle')
    if (gameMode === 'timed') setTimer(timeLimit)
    setP1Score(0); setP2Score(0)
    clearInterval(timerRef.current)
    clearTimeout(roundTimeout.current)
    processingRound.current = false
  }

  // ----- Player taps a colour -----
  const handleColorSelect = (player, color) => {
    if (gameState !== 'playing') return
    if (processingRound.current) return
    if (roundWinner) return

    const isP1 = player === 1
    if (isP1 && p1Locked) return
    if (!isP1 && p2Locked) return

    const isCorrect = targetColors.includes(color)

    if (isCorrect) {
      // Correct – score point, lock player, set winner
      if (isP1) setP1Score(prev => prev + 1)
      else setP2Score(prev => prev + 1)
      setRoundWinner(isP1 ? 'p1' : 'p2')
      if (isP1) setP1Locked(true)
      else setP2Locked(true)

      clearTimeout(roundTimeout.current)
      roundTimeout.current = setTimeout(() => {
        setRound(prev => prev + 1)
        // Check First To win
        if (gameMode === 'firstTo') {
          const newS1 = p1ScoreRef.current + (isP1 ? 1 : 0)
          const newS2 = p2ScoreRef.current + (isP1 ? 0 : 1)
          if (newS1 >= targetScore || newS2 >= targetScore) {
            clearInterval(timerRef.current)
            endGame('firstTo')
            processingRound.current = true
            return
          }
        }
        nextRound()
      }, 1200)
    } else {
      // Wrong – penalty, lock player
      if (isP1) setP1Score(prev => Math.max(0, prev - 1))
      else setP2Score(prev => Math.max(0, prev - 1))
      if (isP1) setP1Locked(true)
      else setP2Locked(true)
    }
  }

  // If both players lock (both wrong), move to next round
  useEffect(() => {
    if (gameState === 'playing' && p1Locked && p2Locked && !roundWinner) {
      clearTimeout(roundTimeout.current)
      roundTimeout.current = setTimeout(() => {
        setRound(prev => prev + 1)
        nextRound()
      }, 1000)
    }
  }, [p1Locked, p2Locked, roundWinner, gameState, nextRound])

  const showTimer = gameMode === 'timed'

  return (
    <div className={s.page}>
      <div className={s.pageTitle}>Rubik's Battle</div>
      <div className={s.pageSubtitle}>Race to spot the unique colour! 🎯</div>

      {/* Config Bar */}
      {gameState === 'idle' && (
        <div className={s.configBar}>
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
                {[3, 5, 7, 10].map(t => (
                  <button key={t} className={`${styles.btn} ${styles.btnSm} ${targetScore === t ? styles.btnPrimary : styles.btnSecondary}`} onClick={() => setTargetScore(t)}>{t}</button>
                ))}
              </div>
            </div>
          )}

          <button className={`${styles.btn} ${styles.btnSecondary} ${s.tutorialBtn}`} onClick={() => setShowTutorial(true)}>
            ❓ How to Play
          </button>
        </div>
      )}

      {showTutorial && <TutorialOverlay onClose={() => setShowTutorial(false)} />}

      {/* ===== MAIN GAME LAYOUT (Fact Race style) ===== */}
      <div className={s.gameLayout}>
        {/* --- Player 1 Section (Left) --- */}
        <div className={s.playerPanel}>
          <div className={s.playerHeader}>
            <div className={s.playerDot} style={{ background: '#D32F2F' }} />
            <input
              type="text"
              value={p1Name}
              onChange={e => setP1Name(e.target.value)}
              className={s.playerNameInput}
              maxLength={20}
              placeholder="Player 1"
              disabled={gameState !== 'idle'}
            />
          </div>
          <div className={s.playerScore}>
            Score: <span>{p1Score}</span>
            {roundWinner === 'p1' && <span className={s.roundBadge}>🏆</span>}
          </div>
          <div className={s.colorSection}>
            <div className={s.colorSectionLabel}>Pick a colour</div>
            <ColorButtons
              onSelect={(color) => handleColorSelect(1, color)}
              disabled={p1Locked || !!roundWinner}
            />
          </div>
        </div>

        {/* --- Center: Cards + Timer + Status --- */}
        <div className={s.centerPanel}>
          {gameState === 'idle' && (
            <div className={s.startPrompt}>
              <p>Configure settings above, then start the battle!</p>
              <button className={`${styles.btn} ${styles.btnPrimary} ${s.startBtn}`} onClick={startGame}>
                Start Battle 🏁
              </button>
            </div>
          )}

          {gameState === 'playing' && (
            <>
              <div className={s.timer}>
                {showTimer ? `⏱ ${timer}s` : `🎯 First to ${targetScore}`}
              </div>

              <div className={s.cardsContainer}>
                {grid1 && <Grid grid={grid1} label={`${p1Name}'s Card`} />}
                {grid2 && <Grid grid={grid2} label={`${p2Name}'s Card`} />}
              </div>

              <div className={s.roundInfo}>
                Round {round + 1}
                {roundWinner && (
                  <span className={s.roundResult}>
                    {roundWinner === 'p1' && `👑 ${p1Name} wins the round!`}
                    {roundWinner === 'p2' && `👑 ${p2Name} wins the round!`}
                  </span>
                )}
                {p1Locked && p2Locked && !roundWinner && (
                  <span className={s.roundResult} style={{ color: '#FF6B6B' }}>
                    Both wrong – next round!
                  </span>
                )}
              </div>

              <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={endGameEarly}>
                End Game
              </button>
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
                <div style={{ borderLeft: '4px solid #D32F2F' }}>{p1Name}: {p1Score}</div>
                <div style={{ borderLeft: '4px solid #1976D2' }}>{p2Name}: {p2Score}</div>
              </div>
              <div className={s.winner}>
                {p1Score > p2Score && <span style={{ color: '#D32F2F' }}>🏆 {p1Name} wins!</span>}
                {p2Score > p1Score && <span style={{ color: '#1976D2' }}>🏆 {p2Name} wins!</span>}
                {p1Score === p2Score && "It's a tie! 🤝"}
              </div>
              <div className={s.endButtons}>
                <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={startGame}>Play Again</button>
                <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={backToConfig}>⚙️ Back to Config</button>
              </div>
            </div>
          )}
        </div>

        {/* --- Player 2 Section (Right) --- */}
        <div className={s.playerPanel}>
          <div className={s.playerHeader}>
            <div className={s.playerDot} style={{ background: '#1976D2' }} />
            <input
              type="text"
              value={p2Name}
              onChange={e => setP2Name(e.target.value)}
              className={s.playerNameInput}
              maxLength={20}
              placeholder="Player 2"
              disabled={gameState !== 'idle'}
            />
          </div>
          <div className={s.playerScore}>
            Score: <span>{p2Score}</span>
            {roundWinner === 'p2' && <span className={s.roundBadge}>🏆</span>}
          </div>
          <div className={s.colorSection}>
            <div className={s.colorSectionLabel}>Pick a colour</div>
            <ColorButtons
              onSelect={(color) => handleColorSelect(2, color)}
              disabled={p2Locked || !!roundWinner}
            />
          </div>
        </div>
      </div>

      <BtnRow>
        <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={() => setShowScores(!showScores)}>
          🏆 Scores
        </button>
      </BtnRow>
      {showScores && (
        <div style={{ marginTop: 24 }}>
          <ScoreBoard scores={scores} onClear={clearScores} cols={['#', 'Player', 'Score', 'Date']} />
        </div>
      )}
    </div>
  )
}