import React from 'react'
import styles from './UI.module.css'

export function ScoreBoard({ scores, onClear, cols = ['#', 'Player', 'Score', 'Date'] }) {
  if (!scores.length)
    return <div className={styles.emptyScores}>No scores yet — play a game to get started!</div>
  return (
    <>
      <table className={styles.scoresTable}>
        <thead>
          <tr>{cols.map(c => <th key={c}>{c}</th>)}</tr>
        </thead>
        <tbody>
          {scores.map((s, i) => (
            <tr key={i}>
              <td><span className={styles.rankNum}>{i + 1}</span></td>
              {cols.slice(1).map(c => <td key={c}>{s[c] ?? s[c.toLowerCase()] ?? '-'}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
      <div className={styles.btnRow} style={{ marginTop: 12 }}>
        <button className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSm}`} onClick={onClear}>
          Clear scores
        </button>
      </div>
    </>
  )
}

export function StatusBanner({ children, type = 'info' }) {
  const typeClass = {
    win: styles.statusWin,
    lose: styles.statusLose,
    draw: styles.statusDraw,
    info: styles.statusInfo,
  }[type] || styles.statusInfo
  return <div className={`${styles.statusBanner} ${typeClass}`}>{children}</div>
}

export function GameScreen({ title, subtitle, children }) {
  return (
    <div className={styles.gameScreen}>
      <div className={styles.gameHeader}>
        <div className={styles.gameTitle}>{title}</div>
        {subtitle && <div className={styles.gameSubtitle}>{subtitle}</div>}
      </div>
      {children}
    </div>
  )
}

export function BtnRow({ children, centered }) {
  return (
    <div className={styles.btnRow} style={centered ? { justifyContent: 'center' } : {}}>
      {children}
    </div>
  )
}

export { styles }
