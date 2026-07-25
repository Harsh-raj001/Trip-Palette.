import { useEffect, useRef, useState } from 'react'

// Generate approximate landmass point cloud (lat, lon) for architectural 3D aesthetic
const LAND_POINTS = []
const addBox = (latMin, latMax, lonMin, lonMax, step = 5) => {
  for (let lat = latMin; lat <= latMax; lat += step) {
    for (let lon = lonMin; lon <= lonMax; lon += step) {
      if (Math.sin(lat * 0.2) * Math.cos(lon * 0.2) > -0.4) {
        LAND_POINTS.push({ lat, lon })
      }
    }
  }
}
// North America
addBox(15, 65, -130, -60, 4)
// South America
addBox(-50, 10, -80, -35, 4)
// Europe
addBox(36, 68, -10, 40, 4)
// Africa
addBox(-35, 35, -15, 50, 4)
// Asia
addBox(10, 68, 40, 140, 4)
// Australia
addBox(-38, -12, 112, 154, 4)

export default function Globe3D({ place }) {
  const canvasRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dimensions, setDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800
  })
  
  // Rotation angles in radians
  const rotRef = useRef({ x: 0.35, y: 0 })
  const targetRotRef = useRef({ x: 0.35, y: 0 })
  const velRef = useRef({ x: 0, y: 0 })
  const dragStartRef = useRef({ x: 0, y: 0, rotX: 0, rotY: 0 })
  const mouseRef = useRef({ x: -1000, y: -1000 })
  const animFrameRef = useRef(null)

  // Track window resize for full-background immersion
  useEffect(() => {
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight })
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Global mouse move for interactive proximity glow
  useEffect(() => {
    const handleGlobalMouseMove = e => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }
    window.addEventListener('mousemove', handleGlobalMouseMove)
    return () => window.removeEventListener('mousemove', handleGlobalMouseMove)
  }, [])

  // When place changes, compute target rotation to face the country
  useEffect(() => {
    if (place && typeof place.lat === 'number' && typeof place.lon === 'number') {
      const latRad = place.lat * (Math.PI / 180)
      const lonRad = place.lon * (Math.PI / 180)
      
      targetRotRef.current.y = -lonRad - Math.PI / 2
      targetRotRef.current.x = latRad
    }
  }, [place])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let startTime = Date.now()

    const render = () => {
      const W = canvas.width = dimensions.width
      const H = canvas.height = dimensions.height
      const cx = W / 2
      const cy = H * 0.48 // Slightly elevated to frame header & card
      const R = Math.min(W, H) * 0.46 // Large, majestic full-background sphere
      const elapsed = (Date.now() - startTime) / 1000

      // Momentum physics & rotation logic
      if (isDragging) {
        // Velocity is set in handleMouseMove
      } else {
        if (!place) {
          // Apply inertia and gentle auto-spin
          rotRef.current.y += velRef.current.y
          rotRef.current.x += velRef.current.x
          velRef.current.x *= 0.94
          velRef.current.y *= 0.94

          if (Math.abs(velRef.current.y) < 0.001) {
            rotRef.current.y += 0.0018 // Hypnotic continuous background spin
          }
        } else {
          // Smooth easing toward target destination coordinates
          const dx = targetRotRef.current.x - rotRef.current.x
          let dy = targetRotRef.current.y - rotRef.current.y
          while (dy > Math.PI) dy -= Math.PI * 2
          while (dy < -Math.PI) dy += Math.PI * 2
          
          rotRef.current.x += dx * 0.05
          rotRef.current.y += dy * 0.05
        }
      }

      ctx.clearRect(0, 0, W, H)

      // 1. Warm Architectural Glass Background Sphere
      const bgGrad = ctx.createRadialGradient(cx, cy, R * 0.1, cx, cy, R * 1.3)
      bgGrad.addColorStop(0, 'rgba(217, 119, 87, 0.18)')
      bgGrad.addColorStop(0.6, 'rgba(255, 179, 0, 0.06)')
      bgGrad.addColorStop(1, 'rgba(255, 255, 255, 0)')
      ctx.fillStyle = bgGrad
      ctx.fillRect(0, 0, W, H)

      ctx.beginPath()
      ctx.arc(cx, cy, R, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)'
      ctx.fill()
      ctx.lineWidth = 1.5
      ctx.strokeStyle = 'rgba(217, 119, 87, 0.35)'
      ctx.stroke()

      // 3D Spherical Projection helper
      const project = (lat, lon) => {
        const phi = (90 - lat) * (Math.PI / 180)
        const theta = (lon + 180) * (Math.PI / 180)

        let x0 = -(R * Math.sin(phi) * Math.cos(theta))
        let z0 = R * Math.sin(phi) * Math.sin(theta)
        let y0 = R * Math.cos(phi)

        const ry = rotRef.current.y
        let x1 = x0 * Math.cos(ry) + z0 * Math.sin(ry)
        let z1 = -x0 * Math.sin(ry) + z0 * Math.cos(ry)
        let y1 = y0

        const rx = rotRef.current.x
        let x2 = x1
        let y2 = y1 * Math.cos(rx) - z1 * Math.sin(rx)
        let z2 = y1 * Math.sin(rx) + z1 * Math.cos(rx)

        return { x: cx + x2, y: cy - y2, z: z2 }
      }

      // 2. Architectural Wireframe Grid Lines
      ctx.lineWidth = 0.8
      // Latitudes
      for (let lat = -60; lat <= 60; lat += 30) {
        ctx.beginPath()
        let first = true
        for (let lon = -180; lon <= 180; lon += 5) {
          const pt = project(lat, lon)
          if (pt.z > -R * 0.1) {
            ctx.strokeStyle = pt.z > 0 ? 'rgba(217, 119, 87, 0.28)' : 'rgba(217, 119, 87, 0.05)'
            if (first) { ctx.moveTo(pt.x, pt.y); first = false }
            else { ctx.lineTo(pt.x, pt.y) }
          } else { first = true }
        }
        ctx.stroke()
      }
      // Longitudes
      for (let lon = -180; lon < 180; lon += 30) {
        ctx.beginPath()
        let first = true
        for (let lat = -80; lat <= 80; lat += 5) {
          const pt = project(lat, lon)
          if (pt.z > -R * 0.1) {
            ctx.strokeStyle = pt.z > 0 ? 'rgba(217, 119, 87, 0.28)' : 'rgba(217, 119, 87, 0.05)'
            if (first) { ctx.moveTo(pt.x, pt.y); first = false }
            else { ctx.lineTo(pt.x, pt.y) }
          } else { first = true }
        }
        ctx.stroke()
      }

      // 3. Interactive Continent Point Cloud (With Proximity Cursor Reaction!)
      const mx = mouseRef.current.x
      const my = mouseRef.current.y

      LAND_POINTS.forEach(pt => {
        const p = project(pt.lat, pt.lon)
        if (p.z > 0) {
          const dist = Math.hypot(p.x - mx, p.y - my)
          const isNear = dist < 80
          const alpha = Math.min(1, (p.z / R) * 0.85 + 0.15)
          
          if (isNear) {
            // Interactive cursor proximity glow
            ctx.fillStyle = '#FF4500'
            ctx.beginPath()
            ctx.arc(p.x, p.y, 4.2, 0, Math.PI * 2)
            ctx.fill()
            
            ctx.strokeStyle = 'rgba(255, 69, 0, 0.4)'
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.arc(p.x, p.y, 8, 0, Math.PI * 2)
            ctx.stroke()
          } else {
            ctx.fillStyle = `rgba(217, 119, 87, ${alpha})`
            ctx.beginPath()
            ctx.arc(p.x, p.y, 2.2, 0, Math.PI * 2)
            ctx.fill()
          }
        }
      })

      // 4. Selected Destination Pin & Animated Radar Beacon
      if (place && typeof place.lat === 'number' && typeof place.lon === 'number') {
        const pin = project(place.lat, place.lon)
        if (pin.z > -R * 0.2) {
          const alpha = pin.z > 0 ? 1 : 0.3
          
          const rippleRadius = 8 + (Math.sin(elapsed * 4) + 1) * 14
          ctx.beginPath()
          ctx.arc(pin.x, pin.y, rippleRadius, 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(255, 69, 0, ${alpha * (1 - rippleRadius / 36)})`
          ctx.lineWidth = 2.5
          ctx.stroke()

          ctx.beginPath()
          ctx.arc(pin.x, pin.y, 7, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(255, 69, 0, ${alpha})`
          ctx.fill()
          ctx.lineWidth = 2
          ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`
          ctx.stroke()

          if (pin.z > 0) {
            const labelText = `📍 ${place.name.toUpperCase()}`
            ctx.font = '700 13px "Poppins", sans-serif'
            const textWidth = ctx.measureText(labelText).width
            const tagX = pin.x + 14
            const tagY = pin.y - 14

            ctx.fillStyle = 'rgba(42, 36, 33, 0.95)'
            ctx.beginPath()
            ctx.roundRect(tagX - 8, tagY - 20, textWidth + 18, 28, 8)
            ctx.fill()
            ctx.lineWidth = 1.5
            ctx.strokeStyle = 'rgba(217, 119, 87, 0.9)'
            ctx.stroke()

            ctx.fillStyle = '#FFFFFF'
            ctx.fillText(labelText, tagX + 1, tagY - 1)
          }
        }
      }

      animFrameRef.current = requestAnimationFrame(render)
    }

    animFrameRef.current = requestAnimationFrame(render)
    return () => cancelAnimationFrame(animFrameRef.current)
  }, [place, isDragging, dimensions])

  // Mouse & Touch Dragging Handlers with Momentum Physics
  const handleMouseDown = e => {
    setIsDragging(true)
    const clientX = e.clientX || e.touches?.[0]?.clientX || 0
    const clientY = e.clientY || e.touches?.[0]?.clientY || 0
    dragStartRef.current = {
      x: clientX,
      y: clientY,
      rotX: rotRef.current.x,
      rotY: rotRef.current.y
    }
    velRef.current = { x: 0, y: 0 }
  }

  const handleMouseMove = e => {
    if (!isDragging) return
    const cx = e.clientX || e.touches?.[0]?.clientX || 0
    const cy = e.clientY || e.touches?.[0]?.clientY || 0
    const dx = cx - dragStartRef.current.x
    const dy = cy - dragStartRef.current.y

    const newRotY = dragStartRef.current.rotY + dx * 0.006
    const newRotX = Math.max(-1.3, Math.min(1.3, dragStartRef.current.rotX - dy * 0.006))

    // Calculate instantaneous velocity for momentum inertia
    velRef.current = {
      x: newRotX - rotRef.current.x,
      y: newRotY - rotRef.current.y
    }

    rotRef.current.y = newRotY
    rotRef.current.x = newRotX
    targetRotRef.current.y = rotRef.current.y
    targetRotRef.current.x = rotRef.current.x
  }

  const handleMouseUp = () => setIsDragging(false)

  return (
    <div className="globe-bg-wrapper">
      <canvas
        ref={canvasRef}
        className="globe-bg-canvas"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
      />
    </div>
  )
}
