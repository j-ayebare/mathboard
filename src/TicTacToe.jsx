import React, { useState, useEffect } from 'react'
import { useScores } from './utils.js'
import { GameScreen, ScoreBoard, StatusBanner, BtnRow, styles } from './UI.jsx'
import s from './TicTacToe.module.css'


const LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]]

function getWinner(board) {
  return LINES.reduce((w, [a, b, c]) => {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a]
    return w
  }, null)
}

export default function TicTacToe() {
  const [board, setBoard] = useState(Array(9).fill(null))
  const [xTurn, setXTurn] = useState(true)
  const [showScores, setShowScores] = useState(false)
  const [scores, addScore, clearScores] = useScores('ttt')
  const [player1Name, setPlayer1Name] = useState('Player 1')
  const [player2Name, setPlayer2Name] = useState('Player 2')

  const winner = getWinner(board)
  const isDraw = !winner && board.every(Boolean)
  const isGameOver = !!winner || isDraw
  
  const status = winner 
    ? `${winner === 'X' ? player1Name : player2Name} wins! 🎉` 
    : isDraw 
    ? 'Draw! 🤝' 
    : `${xTurn ? player1Name : player2Name}'s turn`
  
  const statusType = winner ? (winner === 'X' ? 'win' : 'lose') : isDraw ? 'draw' : 'info'

  useEffect(() => {
    if (winner) {
      addScore({ 
        Player: winner === 'X' ? player1Name : player2Name, 
        Score: 'Win', 
        Date: new Date().toLocaleDateString() 
      })
    }
  }, [winner, player1Name, player2Name])

  const click = (i) => {
    if (board[i] || winner) return
    const b = [...board]
    b[i] = xTurn ? 'X' : 'O'
    setBoard(b)
    setXTurn(!xTurn)
  }

  const reset = () => { 
    setBoard(Array(9).fill(null))
    setXTurn(true)
  }

  return (
    <GameScreen title="Tic Tac Toe" subtitle="Three in a row wins">
      {/* Main game layout with players on sides */}
      <div className={s.gameLayout}>
        {/* Player 1 - Left */}
        <div className={s.playerSection}>
          <div className={s.playerCard}>
            <div className={s.symbolContainer}>
              <span className={`${s.symbol} ${s.xSymbol}`}>X</span>
            </div>
            <input
              type="text"
              value={player1Name}
              onChange={(e) => setPlayer1Name(e.target.value)}
              className={s.playerNameInput}
              maxLength={20}
              placeholder="Player 1"
            />
            {xTurn && !isGameOver && (
              <div className={`${s.turnArrow} ${s.arrowDown}`}>↓</div>
            )}
          </div>
        </div>

        {/* Center - Board */}
        <div className={s.boardSection}>
          <StatusBanner type={statusType}>{status}</StatusBanner>

          <div className={s.grid}>
            {board.map((v, i) => (
              <div 
                key={i} 
                className={`${s.cell} ${v ? s.filled : ''}`} 
                onClick={() => click(i)}
              >
                <span className={v === 'X' ? s.x : s.o}>{v}</span>
              </div>
            ))}
          </div>

          <BtnRow>
            <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={reset}>
              New Game
            </button>
            <button 
              className={`${styles.btn} ${styles.btnSecondary}`} 
              onClick={() => setShowScores(!showScores)}
            >
              🏆 Scores
            </button>
          </BtnRow>
        </div>

        {/* Player 2 - Right */}
        <div className={s.playerSection}>
          <div className={s.playerCard}>
            <div className={s.symbolContainer}>
              <span className={`${s.symbol} ${s.oSymbol}`}>O</span>
            </div>
            <input
              type="text"
              value={player2Name}
              onChange={(e) => setPlayer2Name(e.target.value)}
              className={s.playerNameInput}
              maxLength={20}
              placeholder="Player 2"
            />
            {!xTurn && !isGameOver && (
              <div className={`${s.turnArrow} ${s.arrowUp}`}>↑</div>
            )}
          </div>
        </div>
      </div>

      {/* Scores Section */}
      {showScores && (
        <div className={s.scoresWrapper}>
          <ScoreBoard scores={scores} onClear={clearScores} cols={['#', 'Player', 'Score', 'Date']} />
        </div>
      )}
    </GameScreen>
  )
}