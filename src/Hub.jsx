import React from 'react'
import styles from './Hub.module.css'

const GAMES = [
  { id: 'ttt',       name: 'Tic Tac Toe',  icon: '⭕', desc: 'Classic three-in-a-row strategy',           tag: 'Strategy', tagColor: 'var(--purple)', accent: 'var(--purple)' },
  { id: 'rings',     name: 'Color Rings',   icon: '🔴', desc: 'Sort the colored rings into their tubes',    tag: 'Puzzle',   tagColor: 'var(--teal)',   accent: 'var(--teal)'   },
  { id: 'twentyone', name: 'Twenty-One',    icon: '🃏', desc: 'Beat the dealer without going over 21',      tag: 'Numbers',  tagColor: 'var(--coral)',  accent: 'var(--coral)'  },
  { id: 'countdown', name: 'Countdown',     icon: '🔢', desc: 'Use six numbers to reach the target',        tag: 'Math',     tagColor: 'var(--lime)',   accent: 'var(--lime)'   },
  { id: 'rubix',     name: 'Rubix Battle',    icon: '🟥', desc: 'Find the unique color between 2 Rubix Cube Faces',              tag: 'Logic',    tagColor: 'var(--orange)', accent: 'var(--orange)' },
  { id: 'factrace',  name: 'Fact Race',     icon: '⚡', desc: 'Answer math facts against the clock',        tag: 'Speed',    tagColor: 'var(--yellow)', accent: 'var(--yellow)' },
]

const HOW_TO = [
  ['Pick a game',    'Choose any of the six games from the board below'],
  ['Play & learn',   'Each game teaches logic, reasoning, or quick thinking'],
  ['Check scores',   'See your best runs in the scoreboard'],
  ['Draw it out',    'Use the drawing board to sketch your work'],
]

export default function Hub({ onNav }) {
  return (
    <div className={styles.hub}>
      <div className={styles.hero}>
        <h1 className={styles.heroTitle}>Welcome to <em className={styles.em}>MathBoard</em></h1>
        <div className={styles.chalkLine} />
        <p className={styles.heroSub}>
          Six games that build reasoning, speed, and problem-solving — all in one place.
        </p>
      </div>

      <div className={styles.sectionLabel}>How to play</div>
      <div className={styles.howGrid}>
        {HOW_TO.map(([name, desc], i) => (
          <div key={i} className={styles.howCard}>
            <div className={styles.howNum}>0{i + 1}</div>
            <div className={styles.howName}>{name}</div>
            <div className={styles.howDesc}>{desc}</div>
          </div>
        ))}
      </div>

      <div className={styles.sectionLabel}>Games</div>
      <div className={styles.gamesGrid}>
        {GAMES.map(g => (
          <div
            key={g.id}
            className={styles.gameCard}
            style={{ '--accent': g.accent }}
            onClick={() => onNav(g.id)}
          >
            <div className={styles.gameIcon}>{g.icon}</div>
            <div className={styles.gameName}>{g.name}</div>
            <div className={styles.gameDesc}>{g.desc}</div>
            <div className={styles.gameTag} style={{ background: g.tagColor + '22', color: g.tagColor }}>
              {g.tag}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.sectionLabel}>More</div>
      <div className={styles.featureGrid}>
        <div className={styles.featureTile} onClick={() => onNav('scores')}>
          <div className={styles.tileIcon}>🏆</div>
          <div className={styles.tileName}>Scoreboard</div>
          <div className={styles.tileDesc}>View top scores across all games</div>
        </div>
        <div className={styles.featureTile} onClick={() => onNav('draw')}>
          <div className={styles.tileIcon}>✏️</div>
          <div className={styles.tileName}>Drawing Board</div>
          <div className={styles.tileDesc}>Sketch problems, doodle, work things out</div>
        </div>
      </div>
    </div>
  )
}
