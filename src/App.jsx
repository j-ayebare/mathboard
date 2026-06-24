import React, { useState } from 'react'
import Hub          from './Hub.jsx'
import TicTacToe    from './TicTacToe.jsx'
import RingSort     from './RingSort.jsx'
import TwentyOne    from './TwentyOne.jsx'
import Countdown    from './Countdown.jsx'
import RubixGame    from './Rubix.jsx'
import FactRace     from './FactRace.jsx'
import DrawingSpace from './DrawingSpace.jsx'
import AllScores    from './AllScores.jsx'
import styles       from './App.module.css'

const SCREENS = {
  ttt:       TicTacToe,
  rings:     RingSort,
  twentyone: TwentyOne,
  countdown: Countdown,
  rubix:     RubixGame,
  factrace:  FactRace,
  draw:      DrawingSpace,
  scores:    AllScores,
}

export default function App() {
  const [screen, setScreen] = useState('hub')
  const Screen = SCREENS[screen]

  return (
    <div className={styles.app}>
      <nav className={styles.nav}>
        <div className={styles.logo}>Math<span className={styles.logoAccent}>Board</span></div>
        {screen !== 'hub' && (
          <button className={styles.backBtn} onClick={() => setScreen('hub')}>
            ← Back to hub
          </button>
        )}
      </nav>
      <main className={styles.main}>
        {screen === 'hub'
          ? <Hub onNav={setScreen} />
          : <Screen onBack={() => setScreen('hub')} />
        }
      </main>
    </div>
  )
}
