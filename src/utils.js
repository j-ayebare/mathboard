import { useState } from 'react'

export const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v))

export const shuffle = (a) => {
  const b = [...a]
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]]
  }
  return b
}

export const useScores = (key) => {
  const [scores, setScores] = useState(() => {
    try { return JSON.parse(localStorage.getItem('mb_' + key) || '[]') } catch { return [] }
  })
  const addScore = (entry) => {
    const next = [entry, ...scores].slice(0, 10)
    setScores(next)
    try { localStorage.setItem('mb_' + key, JSON.stringify(next)) } catch {}
  }
  const clearScores = () => {
    setScores([])
    try { localStorage.removeItem('mb_' + key) } catch {}
  }
  return [scores, addScore, clearScores]
}