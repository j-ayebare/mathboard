import React, { useState } from 'react'
import { shuffle, useScores } from './utils.js'
import { GameScreen, ScoreBoard, StatusBanner, BtnRow, styles } from './UI.jsx'
import s from './TwentyOne.module.css'

const SUITS = ['♠', '♥', '♦', '♣']
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']

function makeDeck() {
  const d = []
  SUITS.forEach(suit => RANKS.forEach(rank => d.push({ suit, rank })))
  return shuffle(d)
}

function cardVal(rank) {
  if (['J', 'Q', 'K'].includes(rank)) return 10
  if (rank === 'A') return 11
  return parseInt(rank)
}

function handTotal(hand) {
  let total = hand.reduce((a, c) => a + cardVal(c.rank), 0)
  let aces  = hand.filter(c => c.rank === 'A').length
  while (total > 21 && aces > 0) { total -= 10; aces-- }
  return total
}

function Card({ card, hidden }) {
  if (hidden) return <div className={`${s.card} ${s.cardHidden}`}>🂠</div>
  const red = ['♥', '♦'].includes(card.suit)
  return (
    <div className={`${s.card} ${red ? s.red : ''}`}>
      <div className={s.cardCorner}>{card.rank}{card.suit}</div>
      <div className={s.cardCenter}>{card.suit}</div>
    </div>
  )
}

export default function TwentyOne() {
  const [deck, setDeck]             = useState(makeDeck)
  const [player, setPlayer]         = useState([])
  const [dealer, setDealer]         = useState([])
  const [phase, setPhase]           = useState('start')
  const [msg, setMsg]               = useState('')
  const [msgType, setMsgType]       = useState('info')
  const [showScores, setShowScores] = useState(false)
  const [scores, addScore, clearScores] = useScores('twentyone')

  const deal = () => {
    const d = makeDeck()
    const p  = [d[0], d[2]]
    const dl = [d[1], d[3]]
    setDeck(d.slice(4)); setPlayer(p); setDealer(dl)
    setPhase('playing'); setMsg('')
  }

  const hit = () => {
    if (phase !== 'playing') return
    const d = [...deck]; const c = d.shift(); setDeck(d)
    const p = [...player, c]; setPlayer(p)
    if (handTotal(p) > 21) {
      setMsg('Bust! Dealer wins.'); setMsgType('lose'); setPhase('done')
      addScore({ Player: 'House', Score: 'Player busted', Date: new Date().toLocaleDateString() })
    }
  }

  const stand = () => {
    if (phase !== 'playing') return
    let d = [...dealer]; let dk = [...deck]
    while (handTotal(d) < 17) d.push(dk.shift())
    setDealer(d); setDeck(dk)
    const pt = handTotal(player), dt = handTotal(d)
    if (dt > 21 || pt > dt) {
      setMsg('You win! 🎉'); setMsgType('win')
      addScore({ Player: 'You', Score: pt, Date: new Date().toLocaleDateString() })
    } else if (pt === dt) {
      setMsg('Push — it\'s a tie!'); setMsgType('draw')
    } else {
      setMsg('Dealer wins.'); setMsgType('lose')
      addScore({ Player: 'House', Score: dt, Date: new Date().toLocaleDateString() })
    }
    setPhase('done')
  }

  return (
    <GameScreen title="Twenty-One" subtitle="Get closer to 21 than the dealer — without going over">
      {phase === 'start' && (
        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={deal}>Deal cards</button>
        </div>
      )}

      {phase !== 'start' && (
        <>
          <div className={s.hand}>
            <div className={styles.sectionLabel}>
              Dealer {phase === 'done' ? `(${handTotal(dealer)})` : '(?)'}
            </div>
            <div className={s.cardsRow}>
              {dealer.map((c, i) => <Card key={i} card={c} hidden={phase === 'playing' && i === 1} />)}
            </div>
          </div>

          <div className={s.hand}>
            <div className={styles.sectionLabel}>You</div>
            <div className={s.cardsRow}>
              {player.map((c, i) => <Card key={i} card={c} />)}
            </div>
            <div className={s.total}>{handTotal(player)}</div>
            <div className={s.totalLabel}>your total</div>
          </div>

          {msg && <StatusBanner type={msgType}>{msg}</StatusBanner>}

          <BtnRow>
            {phase === 'playing' && (
              <>
                <button className={`${styles.btn} ${styles.btnTeal}`}    onClick={hit}>Hit</button>
                <button className={`${styles.btn} ${styles.btnDanger}`}  onClick={stand}>Stand</button>
              </>
            )}
            <button className={`${styles.btn} ${styles.btnPrimary}`}    onClick={deal}>New hand</button>
            <button className={`${styles.btn} ${styles.btnSecondary}`}  onClick={() => setShowScores(!showScores)}>
              🏆 Scores
            </button>
          </BtnRow>
        </>
      )}

      {showScores && (
        <div style={{ marginTop: 24 }}>
          <ScoreBoard scores={scores} onClear={clearScores} cols={['#', 'Player', 'Score', 'Date']} />
        </div>
      )}
    </GameScreen>
  )
}
