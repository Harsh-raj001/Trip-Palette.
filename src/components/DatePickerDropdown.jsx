"use client";
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const DAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

export default function DatePickerDropdown({ start, end, onSelectStart, onSelectEnd, tripDays }) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('start') // 'start' | 'end'
  
  // Parse start date or today for calendar initial view
  const initialDate = start ? new Date(start + 'T00:00:00') : new Date()
  const [viewYear, setViewYear] = useState(initialDate.getFullYear())
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth())

  const containerRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = e => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fmtDisplay = s => {
    if (!s) return 'Select Date'
    const d = new Date(s + 'T00:00:00')
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11)
      setViewYear(y => y - 1)
    } else {
      setViewMonth(m => m - 1)
    }
  }

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0)
      setViewYear(y => y + 1)
    } else {
      setViewMonth(m => m + 1)
    }
  }

  const handleDayClick = dayNum => {
    const yyyy = viewYear
    const mm = String(viewMonth + 1).padStart(2, '0')
    const dd = String(dayNum).padStart(2, '0')
    const clickedStr = `${yyyy}-${mm}-${dd}`

    if (activeTab === 'start') {
      onSelectStart(clickedStr)
      if (!end || clickedStr > end) {
        // Automatically set end date 6 days after start if invalid
        const nextWeek = new Date(new Date(clickedStr + 'T00:00:00').getTime() + 6 * 86400000)
        onSelectEnd(nextWeek.toISOString().slice(0, 10))
      }
      setActiveTab('end')
    } else {
      if (clickedStr < start) {
        onSelectStart(clickedStr)
        onSelectEnd(start)
      } else {
        onSelectEnd(clickedStr)
      }
      setIsOpen(false)
    }
  }

  // Quick Preset Handlers
  const applyPreset = daysToAdd => {
    const today = new Date()
    const startDate = new Date(today.getTime() + 14 * 86400000) // start 2 weeks from now as default advance
    const endDate = new Date(startDate.getTime() + (daysToAdd - 1) * 86400000)
    
    onSelectStart(startDate.toISOString().slice(0, 10))
    onSelectEnd(endDate.toISOString().slice(0, 10))
    setViewYear(startDate.getFullYear())
    setViewMonth(startDate.getMonth())
    setIsOpen(false)
  }

  // Generate day cells
  const blanks = Array.from({ length: firstDayOfWeek }, (_, i) => null)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const allCells = [...blanks, ...days]

  return (
    <div className="date-picker-custom-wrap" ref={containerRef}>
      {/* Curved Animated Trigger Buttons */}
      <div className="date-triggers-row">
        <motion.button
          type="button"
          className={`date-trigger-pill ${isOpen && activeTab === 'start' ? 'active' : ''}`}
          onClick={() => { setIsOpen(true); setActiveTab('start') }}
          whileHover={{ scale: 1.04, y: -2, boxShadow: '0 0 25px rgba(255, 69, 0, 0.45), 0 8px 25px rgba(217, 119, 87, 0.35)' }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        >
          <span className="pill-label">FROM</span>
          <span className="pill-val">{fmtDisplay(start)}</span>
        </motion.button>

        <span className="date-arrow-sep">➔</span>

        <motion.button
          type="button"
          className={`date-trigger-pill ${isOpen && activeTab === 'end' ? 'active' : ''}`}
          onClick={() => { setIsOpen(true); setActiveTab('end') }}
          whileHover={{ scale: 1.04, y: -2, boxShadow: '0 0 25px rgba(255, 69, 0, 0.45), 0 8px 25px rgba(217, 119, 87, 0.35)' }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        >
          <span className="pill-label">TO</span>
          <span className="pill-val">{fmtDisplay(end)}</span>
        </motion.button>
      </div>

      {/* Animated Glassmorphic Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="date-dropdown-popover glass-panel"
            initial={{ opacity: 0, y: -15, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          >
            {/* Quick Travel Presets */}
            <div className="date-presets">
              <span className="presets-title">Quick Travel Presets</span>
              <div className="preset-pills">
                <motion.button type="button" whileHover={{ scale: 1.05 }} onClick={() => applyPreset(3)}>
                  Weekend (3D)
                </motion.button>
                <motion.button type="button" whileHover={{ scale: 1.05 }} onClick={() => applyPreset(7)}>
                  1 Week (7D)
                </motion.button>
                <motion.button type="button" whileHover={{ scale: 1.05 }} onClick={() => applyPreset(14)}>
                  2 Weeks (14D)
                </motion.button>
                <motion.button type="button" whileHover={{ scale: 1.05 }} onClick={() => applyPreset(30)}>
                  1 Month (30D)
                </motion.button>
              </div>
            </div>

            {/* Calendar Month Header */}
            <div className="calendar-header">
              <motion.button 
                type="button" 
                className="cal-nav-btn" 
                onClick={handlePrevMonth}
                whileTap={{ scale: 0.9 }}
              >
                ◀
              </motion.button>
              <div className="month-year-display">
                <strong>{MONTH_NAMES[viewMonth]}</strong> {viewYear}
              </div>
              <motion.button 
                type="button" 
                className="cal-nav-btn" 
                onClick={handleNextMonth}
                whileTap={{ scale: 0.9 }}
              >
                ▶
              </motion.button>
            </div>

            {/* Day Names Header */}
            <div className="cal-days-grid">
              {DAY_NAMES.map(d => <span key={d} className="cal-day-name">{d}</span>)}
            </div>

            {/* Calendar Days Cells */}
            <div className="cal-cells-grid">
              {allCells.map((dayNum, idx) => {
                if (dayNum === null) {
                  return <div key={`blank-${idx}`} className="cal-cell blank" />
                }
                const yyyy = viewYear
                const mm = String(viewMonth + 1).padStart(2, '0')
                const dd = String(dayNum).padStart(2, '0')
                const dateStr = `${yyyy}-${mm}-${dd}`

                const isStart = dateStr === start
                const isEnd = dateStr === end
                const inRange = start && end && dateStr > start && dateStr < end

                let cellClass = 'cal-cell day'
                if (isStart) cellClass += ' is-start'
                if (isEnd) cellClass += ' is-end'
                if (inRange) cellClass += ' in-range'

                return (
                  <motion.button
                    type="button"
                    key={dateStr}
                    className={cellClass}
                    onClick={() => handleDayClick(dayNum)}
                    whileHover={{ scale: 1.15, zIndex: 10 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {dayNum}
                  </motion.button>
                )
              })}
            </div>

            {/* Dropdown Footer */}
            <div className="date-popover-footer">
              <div className="trip-duration-badge">
                <span>Trip Duration: <strong>{tripDays || 0} Days</strong></span>
              </div>
              <motion.button
                type="button"
                className="cal-done-btn"
                onClick={() => setIsOpen(false)}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
              >
                Confirm Dates
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

