import React, { useState } from 'react'
import { shuffle, useScores } from './utils.js'
import { GameScreen, ScoreBoard, StatusBanner, BtnRow, styles } from './UI.jsx'
import s from './RingSort.module.css'

const RING_COLORS = ['#ff6b6b','#ffd93d','#4ecdc4','#a8e063','#c77dff','#ffa552','#74b9ff','#fd79a8']

function makePuzzle(numColors = 5) {
  const cols = RING_COLORS.slice(0, numColors)
  const rings = cols.flatMap(c => [c, c, c, c])
  const shuffled = shuffle(rings)
  const tubes = cols.map((_, i) => shuffled.slice(i * 4, i * 4 + 4))
  tubes.push([], [])
  return tubes
}

function canReceive(tube, ring) {
  if (tube.length >= 4) return false
  if (tube.length === 0) return true
  return tube[tube.length - 1] === ring
}

export default function RingSort() {
  const [tubes, setTubes]           = useState(() => makePuzzle(5))
  const [selected, setSelected]     = useState(null)
  const [moves, setMoves]           = useState(0)
  const [won, setWon]               = useState(false)
  const [showScores, setShowScores] = useState(false)
  const [scores, addScore, clearScores] = useScores('ringsort')

  const isSolved = (t) => t.every(tube => tube.length === 0 || (tube.length === 4 && tube.every(r => r === tube[0])))

  const click = (i) => {
    if (won) return
    if (selected === null) {
      if (tubes[i].length === 0) return
      setSelected(i)
    } else if (selected === i) {
      setSelected(null)
    } else {
      const from = [...tubes[selected]]
      const to   = [...tubes[i]]
      const ring = from[from.length - 1]
      if (!canReceive(to, ring)) { setSelected(i); return }
      from.pop()
      to.push(ring)
      const next = tubes.map((t, j) => j === selected ? from : j === i ? to : t)
      setTubes(next)
      setMoves(m => m + 1)
      setSelected(null)
      if (isSolved(next)) {
        setWon(true)
        addScore({ Player: 'You', Score: (moves + 1) + ' moves', Date: new Date().toLocaleDateString() })
      }
    }
  }

  const reset = () => { setTubes(makePuzzle(5)); setSelected(null); setMoves(0); setWon(false) }

  return (
    <GameScreen title="Color Rings" subtitle="Sort each color into its own tube — tap a tube to pick up, tap again to place">
      {won && <StatusBanner type="win">Sorted! 🎉 Solved in {moves} moves</StatusBanner>}
      <div style={{ marginBottom: 12 }}>
        <span className={styles.scoreBadge}>Moves: {moves}</span>
      </div>

      <div className={s.tubesGrid}>
        {tubes.map((tube, i) => {
          const topRing = tubes[selected] ? tubes[selected][tubes[selected].length - 1] : null
          const receivable = selected !== null && selected !== i && canReceive(tube, topRing)
          return (
            <div
              key={i}
              className={`${s.tube} ${selected === i ? s.tubeSelected : ''} ${receivable ? s.tubeReceive : ''}`}
              onClick={() => click(i)}
            >
              {tube.length === 0 && <span className={s.emptyHint}>empty</span>}
              {tube.map((color, j) => (
                <div key={j} className={s.ring} style={{ background: color }} />
              ))}
            </div>
          )
        })}
      </div>

      <BtnRow>
        <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={reset}>New puzzle</button>
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
