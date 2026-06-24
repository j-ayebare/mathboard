import React, { useState } from 'react'
import { shuffle, useScores } from './utils.js'
import { GameScreen, ScoreBoard, BtnRow, styles } from './UI.jsx'
import s from './Countdown.module.css'

const LARGE_NUMBERS = [25, 50, 75, 100]
const SMALL_NUMBERS = [1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10]

const DIFFICULTY_CONFIG = {
  easy: { minUsed: 2, maxUsed: 3, label: 'Easy', desc: 'Use 2–3 numbers' },
  medium: { minUsed: 3, maxUsed: 4, label: 'Medium', desc: 'Use 3–4 numbers' },
  hard: { minUsed: 6, maxUsed: 6, label: 'Hard', desc: 'Use all 6 numbers' },
}

// ----- Custom solver (lightweight, returns multiple solutions) -----
function findSolutions(numbers, target, minUsed, maxUsed, maxSolutions = 5) {
  const results = []
  const used = new Set()

  function search(nums, exprs, depth) {
    if (nums.length === 1) {
      const val = Math.round(nums[0] * 100) / 100
      if (Math.abs(val - target) < 0.001 && !used.has(exprs[0])) {
        used.add(exprs[0])
        results.push({
          expr: exprs[0],
          result: val,
          used: depth + 1,
        })
        return results.length >= maxSolutions
      }
      return false
    }

    for (let i = 0; i < nums.length; i++) {
      for (let j = i + 1; j < nums.length; j++) {
        const a = nums[i]
        const b = nums[j]
        const aStr = exprs[i]
        const bStr = exprs[j]
        const restNums = nums.filter((_, k) => k !== i && k !== j)
        const restExprs = exprs.filter((_, k) => k !== i && k !== j)

        const ops = [
          { val: a + b, str: `(${aStr} + ${bStr})` },
          { val: a - b, str: `(${aStr} - ${bStr})` },
          { val: b - a, str: `(${bStr} - ${aStr})` },
          { val: a * b, str: `(${aStr} × ${bStr})` },
        ]
        if (b !== 0) ops.push({ val: a / b, str: `(${aStr} ÷ ${bStr})` })
        if (a !== 0) ops.push({ val: b / a, str: `(${bStr} ÷ ${aStr})` })

        for (const op of ops) {
          if (op.val < 0) continue
          const rounded = Math.round(op.val * 1000) / 1000
          if (!Number.isFinite(rounded)) continue

          const newNums = [...restNums, rounded]
          const newExprs = [...restExprs, op.str]
          const found = search(newNums, newExprs, depth + 1)
          if (found) return true
        }
      }
    }
    return false
  }

  // Generate all subsets of the correct size
  const n = numbers.length
  const subsets = []
  const total = 1 << n
  for (let mask = 0; mask < total; mask++) {
    const indices = []
    for (let i = 0; i < n; i++) {
      if (mask & (1 << i)) indices.push(i)
    }
    const size = indices.length
    if (size >= minUsed && size <= maxUsed) {
      subsets.push(indices)
    }
  }

  // Sort subsets by size (fewer numbers first)
  subsets.sort((a, b) => a.length - b.length)

  for (const subset of subsets) {
    const nums = subset.map(i => numbers[i])
    const exprs = subset.map(i => String(numbers[i]))
    const found = search(nums, exprs, 0)
    if (found) break
  }

  return results
}

// ----- Generate a puzzle with guaranteed solution -----
function generatePuzzle(numbers, difficulty) {
  const config = DIFFICULTY_CONFIG[difficulty]
  let target
  let solutions = []

  // Try up to 50 random targets
  for (let attempts = 0; attempts < 50; attempts++) {
    target = Math.floor(Math.random() * 899) + 100
    solutions = findSolutions(numbers, target, config.minUsed, config.maxUsed, 5)
    if (solutions.length > 0) break
  }

  // If no solution, force one: use the sum of all numbers (always works)
  if (solutions.length === 0) {
    target = numbers.reduce((a, b) => a + b, 0)
    if (target > 999) target = Math.floor(target / 2)
    solutions = findSolutions(numbers, target, config.minUsed, config.maxUsed, 5)
  }

  return { target, solutions }
}

export default function Countdown() {
  // Config
  const [difficulty, setDifficulty] = useState('easy')
  const [showScores, setShowScores] = useState(false)
  const [scores, addScore, clearScores] = useScores('countdown')

  // Game state
  const [gameState, setGameState] = useState('idle')
  const [selectedNumbers, setSelectedNumbers] = useState([])
  const [remainingLarge, setRemainingLarge] = useState([...LARGE_NUMBERS])
  const [remainingSmall, setRemainingSmall] = useState([...SMALL_NUMBERS])
  const [puzzle, setPuzzle] = useState(null)
  const [allSolutions, setAllSolutions] = useState([])
  const [showSolutions, setShowSolutions] = useState(false)

  // ----- Hint state (progressive) -----
  const [hintRevealLevel, setHintRevealLevel] = useState(0) // 0, 1, 2, 3

  const [round, setRound] = useState(0)
  const [message, setMessage] = useState('')
  const [numbersRevealed, setNumbersRevealed] = useState(false)

  // ----- Reset selection -----
  const resetSelection = () => {
    setSelectedNumbers([])
    setRemainingLarge([...LARGE_NUMBERS])
    setRemainingSmall([...SMALL_NUMBERS])
    setPuzzle(null)
    setAllSolutions([])
    setShowSolutions(false)
    setHintRevealLevel(0)
    setNumbersRevealed(false)
    setMessage('')
  }

  // ----- Start new round -----
  const startNewRound = () => {
    resetSelection()
    setGameState('selecting')
    setShowSolutions(false)
    setHintRevealLevel(0)
    setNumbersRevealed(false)
    setMessage('Pick your numbers – they are face-down!')
  }

  // ----- Randomize selection -----
  const randomizeSelection = () => {
    if (gameState !== 'selecting') return

    const largeCount = Math.floor(Math.random() * 5) // 0-4
    const smallCount = 6 - largeCount

    const shuffledLarge = shuffle([...remainingLarge])
    const shuffledSmall = shuffle([...remainingSmall])

    const pickedLarge = shuffledLarge.slice(0, largeCount)
    const pickedSmall = shuffledSmall.slice(0, smallCount)

    if (pickedLarge.length + pickedSmall.length < 6) {
      setMessage('Not enough numbers left – resetting pools.')
      setRemainingLarge([...LARGE_NUMBERS])
      setRemainingSmall([...SMALL_NUMBERS])
      return
    }

    const newRemainingLarge = shuffledLarge.slice(largeCount)
    const newRemainingSmall = shuffledSmall.slice(smallCount)

    setRemainingLarge(newRemainingLarge)
    setRemainingSmall(newRemainingSmall)
    setSelectedNumbers([...pickedLarge, ...pickedSmall])
    setMessage(`Random selection complete – ${largeCount} large, ${smallCount} small`)
  }

  // ----- Select a number (face-down) -----
  const selectNumber = (num, type) => {
    if (gameState !== 'selecting') return
    if (selectedNumbers.length >= 6) {
      setMessage('You already have 6 numbers! Click "Generate Puzzle" to continue.')
      return
    }

    let newRemaining
    if (type === 'large') {
      const idx = remainingLarge.indexOf(num)
      if (idx === -1) return
      newRemaining = [...remainingLarge]
      newRemaining.splice(idx, 1)
      setRemainingLarge(newRemaining)
    } else {
      const idx = remainingSmall.indexOf(num)
      if (idx === -1) return
      newRemaining = [...remainingSmall]
      newRemaining.splice(idx, 1)
      setRemainingSmall(newRemaining)
    }

    setSelectedNumbers([...selectedNumbers, num])
    setMessage(`Selected ${num} – ${6 - selectedNumbers.length - 1} more to go`)
  }

  // ----- Remove a selected number -----
  const removeSelected = (index) => {
    if (gameState !== 'selecting') return
    const num = selectedNumbers[index]
    if (num >= 25) {
      setRemainingLarge([...remainingLarge, num].sort((a, b) => a - b))
    } else {
      setRemainingSmall([...remainingSmall, num].sort((a, b) => a - b))
    }
    const newSelected = [...selectedNumbers]
    newSelected.splice(index, 1)
    setSelectedNumbers(newSelected)
    setMessage(`Removed ${num}`)
  }

  // ----- Generate puzzle from selected numbers -----
  const generatePuzzleFromSelection = () => {
    if (selectedNumbers.length < 6) {
      setMessage(`You need 6 numbers (have ${selectedNumbers.length})`)
      return
    }

    const config = DIFFICULTY_CONFIG[difficulty]
    const nums = [...selectedNumbers]

    const { target, solutions } = generatePuzzle(nums, difficulty)

    if (solutions.length === 0) {
      setMessage('No solution found for this number set! Try different numbers.')
      return
    }

    setPuzzle({ numbers: nums, target })
    setAllSolutions(solutions)
    setShowSolutions(false)
    setHintRevealLevel(0)
    setNumbersRevealed(true)
    setGameState('solving')
    setMessage(`Target: ${target} – ${config.label} (${config.desc})`)
  }

  // ----- Show full solutions -----
  const revealSolutions = () => {
    setShowSolutions(true)
    setGameState('ended')
  }

  // ----- Progressive hint -----
  const revealHint = () => {
    if (hintRevealLevel >= 3 || allSolutions.length === 0) return
    setHintRevealLevel(prev => Math.min(prev + 1, 3))
  }

  // ----- Next round -----
  const nextRound = () => {
    setRound(r => r + 1)
    startNewRound()
  }

  // ----- Reset game -----
  const resetGame = () => {
    resetSelection()
    setGameState('idle')
    setPuzzle(null)
    setAllSolutions([])
    setShowSolutions(false)
    setHintRevealLevel(0)
    setRound(0)
    setMessage('')
    setNumbersRevealed(false)
  }

  // ----- Render helpers -----
  const renderNumberSelector = () => {
    const shuffledLarge = shuffle([...remainingLarge])
    const shuffledSmall = shuffle([...remainingSmall])

    return (
      <div className={s.numberSelector}>
        <div className={s.numberGroup}>
          <div className={s.numberGroupLabel}>Large Numbers</div>
          <div className={s.numberGrid}>
            {shuffledLarge.map((num, idx) => (
              <button
                key={`large-${num}-${idx}`}
                className={`${s.numBtn} ${s.numBtnLarge}`}
                onClick={() => selectNumber(num, 'large')}
              >
                {numbersRevealed ? num : '?'}
              </button>
            ))}
          </div>
        </div>
        <div className={s.numberGroup}>
          <div className={s.numberGroupLabel}>Small Numbers</div>
          <div className={s.numberGrid}>
            {shuffledSmall.map((num, idx) => (
              <button
                key={`small-${num}-${idx}`}
                className={`${s.numBtn} ${s.numBtnSmall}`}
                onClick={() => selectNumber(num, 'small')}
              >
                {numbersRevealed ? num : '?'}
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const renderSelected = () => {
    if (selectedNumbers.length === 0) {
      return <div className={s.selectedPlaceholder}>Tap numbers above to select them</div>
    }
    return (
      <div className={s.selectedNumbers}>
        {selectedNumbers.map((num, idx) => (
          <button
            key={idx}
            className={`${s.selectedNum} ${num >= 25 ? s.selectedLarge : s.selectedSmall}`}
            onClick={() => removeSelected(idx)}
          >
            {num}
            <span className={s.removeX}>✕</span>
          </button>
        ))}
        {Array(6 - selectedNumbers.length).fill(null).map((_, i) => (
          <div key={`empty-${i}`} className={s.selectedEmpty}>_</div>
        ))}
      </div>
    )
  }

  const renderPuzzle = () => {
    if (!puzzle) return null
    const config = DIFFICULTY_CONFIG[difficulty]

    // ---- Progressive hint logic ----
    let partialExpr = ''
    let hintResult = ''
    if (allSolutions.length > 0 && hintRevealLevel > 0) {
      const fullExpr = allSolutions[0].expr
      const result = allSolutions[0].result
      // Use Math.ceil so each level reveals at least 1 new character
      const revealLength = Math.min(
        Math.ceil(fullExpr.length * (hintRevealLevel * 0.25)),
        fullExpr.length
      )
      partialExpr = fullExpr.substring(0, revealLength)
      // If we've revealed the full expression, show the result too
      if (revealLength >= fullExpr.length) {
        hintResult = ` = ${result}`
      }
    }

    return (
      <div className={s.puzzleArea}>
        <div className={s.targetDisplay}>
          <div className={s.targetBig}>{puzzle.target}</div>
          <div className={s.targetLabel}>target</div>
        </div>
        <div className={s.puzzleNumbers}>
          {puzzle.numbers.map((n, i) => (
            <div key={i} className={s.puzzleNum}>{n}</div>
          ))}
        </div>

        {hintRevealLevel > 0 && allSolutions.length > 0 && (
          <div className={s.hintArea}>
            <span className={s.hintLabel}>💡 Hint:</span>
            <span className={s.hintExpr}>
              {partialExpr}
              {hintResult && <span className={s.hintResult}>{hintResult}</span>}
            </span>
          </div>
        )}

        {showSolutions && (
          <div className={s.solutionsArea}>
            <div className={s.solutionsLabel}>✓ Possible solutions</div>
            {allSolutions.length > 0 ? (
              <div className={s.solutionsList}>
                {allSolutions.slice(0, 5).map((sol, idx) => (
                  <div key={idx} className={s.solutionItem}>
                    <span className={s.solutionExpr}>{sol.expr}</span>
                    <span className={s.solutionResult}> = {sol.result}</span>
                    <span className={s.solutionUsed}>({sol.used} numbers)</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className={s.noSolution}>No solutions found for this difficulty</div>
            )}
          </div>
        )}

        <div className={s.puzzleInfo}>
          <span className={s.difficultyBadge}>{config.label}</span>
          <span className={s.difficultyDesc}>{config.desc}</span>
        </div>
      </div>
    )
  }

  // ----- Main render -----
  return (
    <GameScreen title="Countdown" subtitle="Pick numbers, reach the target!">
      {/* Difficulty & start */}
      {gameState === 'idle' && (
        <div className={s.configArea}>
          <div className={s.configGroup}>
            <label>Difficulty</label>
            <div className={s.diffRow}>
              {['easy', 'medium', 'hard'].map(d => (
                <button
                  key={d}
                  className={`${styles.btn} ${styles.btnSm} ${difficulty === d ? styles.btnPrimary : styles.btnSecondary}`}
                  onClick={() => setDifficulty(d)}
                >
                  {DIFFICULTY_CONFIG[d].label}
                </button>
              ))}
            </div>
            <div className={s.diffDesc}>{DIFFICULTY_CONFIG[difficulty].desc}</div>
          </div>
          <button className={`${styles.btn} ${styles.btnPrimary} ${s.startBtn}`} onClick={startNewRound}>
            Start Round 🎯
          </button>
        </div>
      )}

      {/* Active game */}
      {gameState !== 'idle' && (
        <>
          <div className={s.statusBar}>
            <span className={s.roundInfo}>Round {round + 1}</span>
            <span className={s.message}>{message}</span>
          </div>

          {gameState === 'selecting' && (
            <>
              <div className={s.selectionArea}>
                <div className={s.selectionHeader}>
                  <span>Your numbers</span>
                  <span>{selectedNumbers.length}/6</span>
                </div>
                {renderSelected()}
                <div className={s.actionRow}>
                  <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={randomizeSelection}>
                    🎲 Randomize
                  </button>
                  {selectedNumbers.length === 6 && (
                    <button
                      className={`${styles.btn} ${styles.btnPrimary}`}
                      onClick={generatePuzzleFromSelection}
                    >
                      Generate Puzzle 🔢
                    </button>
                  )}
                </div>
              </div>
              {renderNumberSelector()}
              <div className={s.actionRow}>
                <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={resetSelection}>
                  Clear Selection
                </button>
                <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={resetGame}>
                  New Game
                </button>
              </div>
            </>
          )}

          {(gameState === 'solving' || gameState === 'ended') && (
            <>
              {renderPuzzle()}
              <div className={s.actionRow}>
                {gameState === 'solving' && (
                  <>
                    <button
                      className={`${styles.btn} ${styles.btnSecondary}`}
                      onClick={revealHint}
                      disabled={hintRevealLevel >= 3 || allSolutions.length === 0}
                    >
                      💡 Hint ({hintRevealLevel}/3)
                    </button>
                    <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={revealSolutions}>
                      Show Solutions
                    </button>
                  </>
                )}
                <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={nextRound}>
                  Next Round ➜
                </button>
                <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={resetGame}>
                  New Game
                </button>
              </div>
            </>
          )}
        </>
      )}

      {/* Scores */}
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
    </GameScreen>
  )
}