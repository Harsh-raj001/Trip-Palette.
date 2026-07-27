"use client";
import { useEffect, useRef, useState } from 'react'

const fmt = s => new Date(s + 'T00:00:00').toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })

export default function BoardingPassModal({ place, start, end, tripDays, coldest, warmest, palette = [], items = [], onClose }) {
  const canvasRef = useRef(null)
  const [dataUrl, setDataUrl] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // We wait briefly for web fonts (Averia Serif Libre, Poppins, Caveat) to be ready before drawing
    document.fonts.ready.then(() => {
      drawBoardingPass()
    })
  }, [place, start, end, tripDays, coldest, warmest, palette, items])

  function drawBoardingPass() {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = 1080
    const H = 1920

    // 1. Background
    ctx.fillStyle = '#FAF7F2'
    ctx.fillRect(0, 0, W, H)

    // Subtle background gradient circle
    const grad = ctx.createRadialGradient(860, -100, 50, 860, -100, 1200)
    grad.addColorStop(0, '#f3e9dc')
    grad.addColorStop(0.6, 'rgba(250, 247, 242, 0)')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, W, H)

    // 2. Top Header Branding
    ctx.textAlign = 'center'
    ctx.font = '700 52px "Averia Serif Libre", serif'
    ctx.fillStyle = '#2b2420'
    ctx.fillText('Trip Palette', W / 2, 110)
    
    // Rust accent dot
    const titleWidth = ctx.measureText('Trip Palette').width
    ctx.fillStyle = '#D97757'
    ctx.fillText('.', W / 2 + titleWidth / 2 + 10, 110)

    ctx.font = '500 42px "Caveat", cursive'
    ctx.fillStyle = '#D97757'
    ctx.fillText('pack to match your destination', W / 2, 160)

    // 3. Ticket Card Container
    const cardX = 80
    const cardY = 220
    const cardW = 920
    const cardH = 1560
    const r = 40

    // Draw main card background with shadow
    ctx.save()
    ctx.shadowColor = 'rgba(43, 36, 32, 0.08)'
    ctx.shadowBlur = 30
    ctx.shadowOffsetY = 12
    ctx.fillStyle = '#fffdf9'
    ctx.beginPath()
    ctx.roundRect(cardX, cardY, cardW, cardH, r)
    ctx.fill()
    ctx.restore()

    ctx.strokeStyle = '#e7ded2'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.roundRect(cardX, cardY, cardW, cardH, r)
    ctx.stroke()

    // Helper: Draw Perforation Line & Cutouts
    const drawPerforation = (y) => {
      ctx.save()
      // Left notch cutout
      ctx.fillStyle = '#FAF7F2'
      ctx.beginPath()
      ctx.arc(cardX, y, 28, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = '#e7ded2'
      ctx.lineWidth = 2
      ctx.stroke()

      // Right notch cutout
      ctx.beginPath()
      ctx.arc(cardX + cardW, y, 28, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()

      // Dashed line
      ctx.strokeStyle = '#e7ded2'
      ctx.lineWidth = 3
      ctx.setLineDash([12, 12])
      ctx.beginPath()
      ctx.moveTo(cardX + 40, y)
      ctx.lineTo(cardX + cardW - 40, y)
      ctx.stroke()
      ctx.restore()
    }

    // 4. Ticket Section 1: Destination & Dates
    ctx.textAlign = 'left'
    ctx.font = '700 84px "Averia Serif Libre", serif'
    ctx.fillStyle = '#2b2420'
    const destName = place?.name || 'Destination'
    ctx.fillText(destName, cardX + 60, cardY + 120)

    ctx.font = '500 32px "Poppins", sans-serif'
    ctx.fillStyle = '#6f645c'
    const subText = `${place?.country || ''} · ${fmt(start)} to ${fmt(end)} · ${tripDays} DAYS`.toUpperCase()
    ctx.fillText(subText, cardX + 60, cardY + 180)

    // Temperature Badge on right
    ctx.textAlign = 'right'
    ctx.font = '700 58px "Averia Serif Libre", serif'
    ctx.fillStyle = '#D97757'
    ctx.fillText(`${Math.round(coldest)}°–${Math.round(warmest)}°C`, cardX + cardW - 60, cardY + 120)
    ctx.font = '400 24px "Poppins", sans-serif'
    ctx.fillStyle = '#6f645c'
    ctx.fillText('FORECAST RANGE', cardX + cardW - 60, cardY + 160)

    drawPerforation(cardY + 240)

    // 5. Ticket Section 2: The Palette Swatches
    ctx.textAlign = 'left'
    ctx.font = '700 36px "Averia Serif Libre", serif'
    ctx.fillStyle = '#2b2420'
    ctx.fillText('THE PALETTE', cardX + 60, cardY + 310)

    const swX = cardX + 60
    const swY = cardY + 350
    const swW = 180
    const swH = 180
    const swGap = 26

    const pal = palette.length > 0 ? palette : ['#FAF7F2', '#2b2420', '#6f645c', '#D97757']
    pal.slice(0, 4).forEach((hex, idx) => {
      const x = swX + idx * (swW + swGap)
      // Swatch color box
      ctx.fillStyle = hex
      ctx.beginPath()
      ctx.roundRect(x, swY, swW, swH, 24)
      ctx.fill()
      ctx.strokeStyle = 'rgba(43, 36, 32, 0.15)'
      ctx.lineWidth = 2
      ctx.stroke()

      // Hex code label
      ctx.textAlign = 'center'
      ctx.font = '500 28px "Poppins", sans-serif'
      ctx.fillStyle = '#6f645c'
      ctx.fillText(hex.toUpperCase(), x + swW / 2, swY + swH + 42)
    })

    drawPerforation(cardY + 660)

    // 6. Ticket Section 3: Top 5 Packing Essentials
    ctx.textAlign = 'left'
    ctx.font = '700 36px "Averia Serif Libre", serif'
    ctx.fillStyle = '#2b2420'
    ctx.fillText('TOP 5 PACKING ESSENTIALS', cardX + 60, cardY + 730)

    const topItems = items.slice(0, 5)
    let itemY = cardY + 810
    topItems.forEach((it, idx) => {
      // Qty badge
      ctx.textAlign = 'center'
      ctx.font = '700 48px "Averia Serif Libre", serif'
      ctx.fillStyle = '#D97757'
      ctx.fillText(`${it.qty}x`, cardX + 100, itemY + 8)

      // Item Name
      ctx.textAlign = 'left'
      ctx.font = '600 34px "Poppins", sans-serif'
      ctx.fillStyle = '#2b2420'
      ctx.fillText(it.name.toUpperCase(), cardX + 170, itemY)

      // Why note (truncated or single line)
      ctx.font = '400 26px "Poppins", sans-serif'
      ctx.fillStyle = '#6f645c'
      let whyText = it.why || ''
      if (whyText.length > 55) whyText = whyText.slice(0, 52) + '…'
      ctx.fillText(whyText, cardX + 170, itemY + 38)

      // Sub-separator line between items
      if (idx < topItems.length - 1) {
        ctx.strokeStyle = 'rgba(231, 222, 210, 0.6)'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(cardX + 170, itemY + 64)
        ctx.lineTo(cardX + cardW - 60, itemY + 64)
        ctx.stroke()
      }

      itemY += 130
    })

    drawPerforation(cardY + 1380)

    // 7. Ticket Footer: Barcode & Social Tag
    const barX = cardX + 80
    const barY = cardY + 1420
    ctx.fillStyle = '#2b2420'
    let currentX = barX
    const barPatterns = [4, 8, 2, 6, 12, 4, 2, 8, 14, 4, 6, 10, 2, 4, 8, 16, 4, 2, 6, 12, 4, 8, 6, 4, 2, 10, 4, 8, 14, 4, 2, 6, 8, 4, 12, 6, 2, 4, 8, 10, 4]
    barPatterns.forEach((w, i) => {
      if (i % 2 === 0) {
        ctx.fillStyle = i % 4 === 0 ? '#2b2420' : '#D97757'
        ctx.fillRect(currentX, barY, w * 1.5, 60)
      }
      currentX += w * 1.5
    })

    ctx.textAlign = 'center'
    ctx.font = '500 26px "Poppins", sans-serif'
    ctx.fillStyle = '#6f645c'
    ctx.fillText('BOARDING PASS · INSTAGRAM STORY EDITION · @harshraj', W / 2, cardY + 1520)

    // Export to Data URL for instant download
    setDataUrl(canvas.toDataURL('image/png'))
    setLoading(false)
  }

  function downloadImage() {
    if (!dataUrl) return
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = `trip-palette-story-${place?.name?.toLowerCase()?.replace(/\s+/g, '-') || 'pass'}.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>✈️ Instagram Story Boarding Pass</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="canvas-preview-wrap">
          <canvas ref={canvasRef} width={1080} height={1920} className="story-canvas" />
        </div>
        <div className="modal-actions">
          <button className="download-btn go" onClick={downloadImage} disabled={loading}>
            {loading ? 'Generating Story…' : '📥 Download for IG Story (1080×1920)'}
          </button>
          <button className="cancel-btn chip" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}

