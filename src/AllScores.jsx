import React, { useState, useEffect } from 'react'
import { GameScreen, ScoreBoard, styles } from './UI.jsx'

const GAMES = [
  { key: 'ttt',       name: 'Tic Tac Toe'  },
  { key: 'ringsort',  name: 'Color Rings'   },
  { key: 'twentyone', name: 'Twenty-One'    },
  { key: 'countdown', name: 'Countdown'     },
  { key: 'rubix',     name: 'Rubix 2×2'    },
  { key: 'factrace',  name: 'Fact Race'     },
]

export default function AllScores() {
  const [sel, setSel]       = useState(0)
  const [scores, setScores] = useState([])

  useEffect(() => {
    try { setScores(JSON.parse(localStorage.getItem('mb_' + GAMES[sel].key) || '[]')) }
    catch { setScores([]) }
  }, [sel])

  const clearCurrent = () => {
    try { localStorage.removeItem('mb_' + GAMES[sel].key) } catch {}
    setScores([])
  }

  return (
    <GameScreen title="Scoreboard" subtitle="Top scores across all games">
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
        {GAMES.map((g, i) => (
          <button
            key={g.key}
            className={`${styles.btn} ${styles.btnSm} ${sel === i ? styles.btnPrimary : styles.btnSecondary}`}
            onClick={() => setSel(i)}
          >
            {g.name}
          </button>
        ))}
      </div>
      <ScoreBoard scores={scores} onClear={clearCurrent} cols={['#', 'Player', 'Score', 'Date']} />
    </GameScreen>
  )
}
