import React, { useRef, useState, useEffect } from 'react'
import { GameScreen, BtnRow, styles } from './UI.jsx'
import s from './DrawingSpace.module.css'

const COLORS = ['#1a1a1a','#ff6b6b','#ffd93d','#4ecdc4','#a8e063','#c77dff','#ffa552','#74b9ff','#fd79a8','#f0eee8']

export default function DrawingSpace() {
  const canvasRef       = useRef()
  const [drawing, setDrawing] = useState(false)
  const [color, setColor]     = useState('#1a1a1a')
  const [size, setSize]       = useState(6)
  const [eraser, setEraser]   = useState(false)
  const lastPos = useRef(null)

  useEffect(() => {
    const c   = canvasRef.current
    const ctx = c.getContext('2d')
    c.width   = c.offsetWidth
    c.height  = 520
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, c.width, c.height)
  }, [])

  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    const src  = e.touches ? e.touches[0] : e
    return [src.clientX - rect.left, src.clientY - rect.top]
  }

  const drawLine = (e) => {
    if (!drawing) return
    e.preventDefault()
    const canvas = canvasRef.current
    const ctx    = canvas.getContext('2d')
    const [x, y] = getPos(e)
    if (lastPos.current) {
      ctx.beginPath()
      ctx.strokeStyle = eraser ? 'white' : color
      ctx.lineWidth   = eraser ? size * 4 : size
      ctx.lineCap     = 'round'
      ctx.lineJoin    = 'round'
      ctx.moveTo(lastPos.current[0], lastPos.current[1])
      ctx.lineTo(x, y)
      ctx.stroke()
    }
    lastPos.current = [x, y]
  }

  const startDraw = (e) => {
    e.preventDefault()
    setDrawing(true)
    lastPos.current = getPos(e)
  }

  const endDraw = () => { setDrawing(false); lastPos.current = null }

  const clearCanvas = () => {
    const c   = canvasRef.current
    const ctx = c.getContext('2d')
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, c.width, c.height)
  }

  const saveImage = () => {
    const a  = document.createElement('a')
    a.href   = canvasRef.current.toDataURL('image/png')
    a.download = 'mathboard-drawing.png'
    a.click()
  }

  return (
    <GameScreen title="Drawing Board" subtitle="Sketch, work out problems, or doodle freely">
      <div className={s.toolbar}>
        <div className={s.colorRow}>
          {COLORS.map(c => (
            <div
              key={c}
              className={`${s.dot} ${color === c && !eraser ? s.dotActive : ''}`}
              style={{ background: c, border: c === '#f0eee8' ? '1.5px solid #aaa' : undefined }}
              onClick={() => { setColor(c); setEraser(false) }}
            />
          ))}
        </div>
        <div className={s.controls}>
          <button
            className={`${styles.btn} ${styles.btnSm} ${eraser ? styles.btnPrimary : styles.btnSecondary}`}
            onClick={() => setEraser(!eraser)}
          >
            Eraser
          </button>
          <div className={s.sizeRow}>
            <span className={s.sizeLabel}>Size</span>
            <input type="range" min="2" max="30" step="1" value={size} onChange={e => setSize(+e.target.value)} style={{ width: 100 }} />
            <span className={s.sizeVal}>{size}</span>
          </div>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        className={s.canvas}
        style={{ cursor: eraser ? 'cell' : 'crosshair' }}
        onMouseDown={startDraw}
        onMouseMove={drawLine}
        onMouseUp={endDraw}
        onMouseLeave={endDraw}
        onTouchStart={startDraw}
        onTouchMove={drawLine}
        onTouchEnd={endDraw}
      />

      <BtnRow>
        <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={clearCanvas}>Clear</button>
        <button className={`${styles.btn} ${styles.btnTeal}`}      onClick={saveImage}>Save image</button>
      </BtnRow>
    </GameScreen>
  )
}
