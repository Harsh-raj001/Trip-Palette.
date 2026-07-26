import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import DatePickerDropdown from './DatePickerDropdown.jsx'

const AI_CHIPS = [
  '🧠 Analysing destinations & climate...',
  '🌦 Checking 16-day historical weather...',
  '💰 Optimising budget & accommodations...',
  '🍜 Finding local artisan food & dining...',
  '📍 Building smart geodesic route...'
]

const ITINERARY_PREVIEW = [
  { day: 'Day 1', icon: '✈️', title: 'Arrive & VIP Transfer', tag: 'Logistics', time: '10:30 AM' },
  { day: 'Day 2', icon: '🏨', title: 'Boutique Check-in & Espresso', tag: 'Comfort', time: '02:00 PM' },
  { day: 'Day 3', icon: '🍜', title: 'Artisan Lunch at Hidden Market', tag: 'Gastronomy', time: '12:30 PM' },
  { day: 'Day 4', icon: '🏛️', title: 'Private Architecture & Museum Tour', tag: 'Culture', time: '11:00 AM' },
  { day: 'Day 5', icon: '🌅', title: 'Sunset Photography at Coastal Point', tag: 'Golden Hour', time: '06:45 PM' },
  { day: 'Day 6', icon: '🍽️', title: 'Terracotta Rooftop Dinner', tag: 'Nightlife', time: '08:30 PM' }
]

const BUDGET_OPTIONS = ['🪙 Budget', '💳 Moderate', '💎 Luxury']
const TRAVELLER_OPTIONS = ['👤 Solo (1)', '👥 Couple (2)', '👨‍👩‍👧 Family (4)', '🎒 Group (6+)']

export default function HeroSection({
  query, setQuery, place, setPlace, options, setOptions,
  start, setStart, end, setEnd, tripDays,
  acts, toggleAct, ACTS, onGenerate
}) {
  const [chipIdx, setChipIdx] = useState(0)
  const [startLoc, setStartLoc] = useState('San Francisco, US')
  const [budget, setBudget] = useState('💳 Moderate')
  const [travellers, setTravellers] = useState('👥 Couple (2)')
  const [transport, setTransport] = useState('✈️ Flights + Train')
  const [accom, setAccom] = useState('🏨 Boutique Hotel')
  const [weatherPref, setWeatherPref] = useState('☀️ Sunny & Warm')
  
  // Rotating AI Status Chips
  useEffect(() => {
    const timer = setInterval(() => {
      setChipIdx(prev => (prev + 1) % AI_CHIPS.length)
    }, 3200)
    return () => clearInterval(timer)
  }, [])

  return (
    <section className="hero-split-section">
      <div className="hero-split-grid">
        
        {/* ================= LEFT SIDE: HEADLINE, COPY & AI SEARCH CARD ================= */}
        <div className="hero-left-column">
          
          {/* Rotating AI Status Chip */}
          <div className="ai-status-chip-wrap">
            <span className="pulse-dot" />
            <AnimatePresence mode="wait">
              <motion.span
                key={chipIdx}
                className="ai-status-text"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
              >
                {AI_CHIPS[chipIdx]}
              </motion.span>
            </AnimatePresence>
          </div>

          {/* Outcome-Focused Headline */}
          <h1 className="hero-main-headline">
            Plan your perfect <span className="highlight-rust">journey</span> in seconds<span className="brand-dot">.</span>
          </h1>

          {/* Supporting Text */}
          <p className="hero-supporting-text">
            Our intelligent AI synthesizes personalized itineraries and capsule wardrobes based on your destination, budget, travel style, climate, and available time.
          </p>

          {/* Premium Floating Search Card */}
          <motion.div 
            className="hero-search-card glass-panel"
            whileHover={{ boxShadow: '0 25px 60px rgba(217, 119, 87, 0.12)' }}
            transition={{ duration: 0.3 }}
          >
            <div className="form-grid-dense">
              
              {/* Starting Location */}
              <div className="field start-loc-field">
                <label>📍 STARTING FROM</label>
                <input
                  type="text"
                  className="search-input-circular-glow"
                  value={startLoc}
                  onChange={e => setStartLoc(e.target.value)}
                  placeholder="Your City (e.g. London)"
                />
              </div>

              {/* Destination */}
              <div className="field dest-field">
                <label>🌍 DESTINATION</label>
                <input
                  type="text"
                  className="search-input-circular-glow"
                  value={query}
                  placeholder="Where to? (e.g. Spain, Kyoto)"
                  onChange={e => { setQuery(e.target.value); setPlace(null) }}
                />
                {options && options.length > 0 && !place && (
                  <AnimatePresence>
                    <motion.div 
                      className="dropdown glass-panel"
                      initial={{ opacity: 0, y: -10, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.96 }}
                      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                    >
                      {options.map((c, i) => (
                        <motion.button 
                          key={i} 
                          type="button"
                          onClick={() => { 
                            setPlace(c)
                            setQuery(`${c.name}${c.country ? ', ' + c.country : ''}`)
                            setOptions([]) 
                          }}
                          whileHover={{ x: 6, backgroundColor: 'rgba(217, 119, 87, 0.09)' }}
                        >
                          <span className="dest-main-text">📍 {c.name}</span>
                          <span className="dest-sub-text">{[c.admin, c.country].filter(Boolean).join(', ')}</span>
                        </motion.button>
                      ))}
                    </motion.div>
                  </AnimatePresence>
                )}
              </div>

              {/* Travel Dates */}
              <div className="field dates-combined-field">
                <label>📅 TRAVEL DATES & DURATION</label>
                <DatePickerDropdown
                  start={start}
                  end={end}
                  onSelectStart={setStart}
                  onSelectEnd={setEnd}
                  tripDays={tripDays}
                />
              </div>
            </div>

            {/* Quick Selectors Row: Budget & Travellers */}
            <div className="quick-selectors-row">
              <div className="selector-group">
                <label className="selector-label">💰 BUDGET</label>
                <div className="pill-toggle-group">
                  {BUDGET_OPTIONS.map(b => (
                    <button
                      key={b}
                      type="button"
                      className={`toggle-pill ${budget === b ? 'active' : ''}`}
                      onClick={() => setBudget(b)}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              <div className="selector-group">
                <label className="selector-label">👥 TRAVELLERS</label>
                <div className="pill-toggle-group">
                  {TRAVELLER_OPTIONS.map(t => (
                    <button
                      key={t}
                      type="button"
                      className={`toggle-pill ${travellers === t ? 'active' : ''}`}
                      onClick={() => setTravellers(t)}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Travel Preferences Row */}
            <div className="prefs-row">
              <span className="pref-badge" onClick={() => setTransport(transport === '✈️ Flights + Train' ? '🚗 Rental Car' : '✈️ Flights + Train')}>
                ✈️ Transport: <strong>{transport.replace('✈️ ', '').replace('🚗 ', '')}</strong>
              </span>
              <span className="pref-badge" onClick={() => setAccom(accom === '🏨 Boutique Hotel' ? '🏡 Airbnb Villa' : '🏨 Boutique Hotel')}>
                🏨 Stay: <strong>{accom.replace('🏨 ', '').replace('🏡 ', '')}</strong>
              </span>
              <span className="pref-badge" onClick={() => setWeatherPref(weatherPref === '☀️ Sunny & Warm' ? '🍂 Cool & Crisp' : '☀️ Sunny & Warm')}>
                🌦️ Climate: <strong>{weatherPref.replace('☀️ ', '').replace('🍂 ', '')}</strong>
              </span>
            </div>

            {/* Interests Chips */}
            <div className="field acts-wrap">
              <label>❤️ CURATED INTERESTS & ACTIVITIES</label>
              <div className="chips">
                {ACTS && ACTS.map(a => (
                  <button
                    type="button"
                    key={a.id}
                    className={acts.includes(a.id) ? 'chip on' : 'chip'}
                    onClick={() => toggleAct(a.id)}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Primary CTA Button (Magnetic / Ripple / Glow) */}
            <motion.button
              type="button"
              className="build-palette-btn primary-cta-glow"
              onClick={onGenerate}
              whileHover={{ scale: 1.02, y: -2, boxShadow: '0 15px 35px rgba(217, 119, 87, 0.45)' }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="cta-icon">✨</span> Generate AI Itinerary & Capsule Wardrobe
            </motion.button>
          </motion.div>
        </div>

        {/* ================= RIGHT SIDE: IMMERSIVE ANIMATED VISUAL UNIVERSE ================= */}
        <div className="hero-right-column">
          <div className="visual-showcase-panel glass-panel">
            
            {/* Top Showcase Header */}
            <div className="showcase-header">
              <div className="showcase-status">
                <span className="pulse-dot green-dot" />
                <span>AI SYNTHESIS ENGINE ACTIVE</span>
              </div>
              <span className="showcase-dest-pill">📍 {place ? place.name : 'Amalfi Coast, Italy'}</span>
            </div>

            {/* Animated World Map & Flight Route Area */}
            <div className="animated-map-stage">
              
              {/* Floating Sunrise Vapor Clouds */}
              <motion.div 
                className="floating-cloud cloud-1"
                animate={{ x: [-20, 40, -20], y: [0, -8, 0] }}
                transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
              >
                ☁️
              </motion.div>
              <motion.div 
                className="floating-cloud cloud-2"
                animate={{ x: [30, -30, 30], y: [0, 10, 0] }}
                transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
              >
                ☁️
              </motion.div>
              
              {/* Subtle Birds Gliding */}
              <motion.div 
                className="subtle-birds"
                animate={{ x: [-80, 240], y: [20, -30] }}
                transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
              >
                🕊️ 🕊️
              </motion.div>

              {/* Glowing Destination Pins on Map Grid */}
              <div className="map-grid-overlay">
                <motion.div className="radar-pin pin-tokyo" animate={{ scale: [1, 1.25, 1] }} transition={{ duration: 2.5, repeat: Infinity }}>
                  📍 <span>Kyoto</span>
                </motion.div>
                <motion.div className="radar-pin pin-paris" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}>
                  📍 <span>Paris</span>
                </motion.div>
                <motion.div className="radar-pin pin-amalfi" animate={{ scale: [1.1, 1.3, 1.1] }} transition={{ duration: 2, repeat: Infinity, delay: 1 }}>
                  📍 <span>Amalfi</span>
                </motion.div>
              </div>

              {/* Animated Flight Route & Airplane Beacon */}
              <svg className="flight-path-svg" viewBox="0 0 300 120">
                <path
                  d="M 30,90 Q 150,10 270,70"
                  fill="none"
                  stroke="#D97757"
                  strokeWidth="2"
                  strokeDasharray="6,6"
                />
              </svg>
              <motion.div
                style={{ position: 'absolute', zIndex: 4, fontSize: '1.2rem', pointerEvents: 'none', left: 0, top: 0 }}
                animate={{ 
                  x: [30, 150, 270],
                  y: [90, 10, 70],
                  rotate: [-20, 10, 35]
                }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              >
                ✈️
              </motion.div>

              {/* Live Weather & Climate Pill */}
              <motion.div 
                className="live-weather-float glass-panel"
                animate={{ y: [-4, 6, -4] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              >
                <span className="w-icon">☀️</span>
                <div className="w-meta">
                  <strong>24°C Perfect Golden Hour</strong>
                  <span>0% Precipitation · Light Breeze</span>
                </div>
              </motion.div>
            </div>

            {/* Staggered Animated Itinerary Preview Cards */}
            <div className="itinerary-preview-wrap">
              <div className="preview-header-row">
                <span className="preview-lbl">✨ INSTANT AI ITINERARY PREVIEW</span>
                <span className="preview-badge">6 Days Curated</span>
              </div>

              <div className="staggered-cards-list">
                {ITINERARY_PREVIEW.map((item, idx) => (
                  <motion.div
                    key={item.day}
                    className="preview-card-item"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: idx * 0.15, ease: 'easeOut' }}
                    whileHover={{ scale: 1.02, x: 4, backgroundColor: '#FFF7ED', borderColor: '#D97757' }}
                  >
                    <span className="card-day-lbl">{item.day}</span>
                    <span className="card-icon">{item.icon}</span>
                    <div className="card-info">
                      <strong>{item.title}</strong>
                      <span>{item.tag} · {item.time}</span>
                    </div>
                    <span className="card-check">✓</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Bottom Palette & Wardrobe Strip */}
            <div className="showcase-palette-strip">
              <span className="strip-lbl">🎨 Extracted Climate Swatches</span>
              <div className="mini-swatch-row">
                <motion.div className="mini-s" style={{ background: '#D97757' }} whileHover={{ scale: 1.2 }} title="Terracotta" />
                <motion.div className="mini-s" style={{ background: '#F97316' }} whileHover={{ scale: 1.2 }} title="Sky Amber" />
                <motion.div className="mini-s" style={{ background: '#FAF8F5' }} whileHover={{ scale: 1.2 }} title="Cream Linen" />
                <motion.div className="mini-s" style={{ background: '#2A2421' }} whileHover={{ scale: 1.2 }} title="Slate Ink" />
                <span className="strip-tag">🧵 5-4-3-2-1 Capsule Ready</span>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Animated Scroll Indicator Cue */}
      <div className="hero-scroll-cue">
        <motion.div
          className="scroll-cue-pill"
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          onClick={() => {
            const el = document.querySelector('.results-arch-container') || document.querySelector('.main-footer');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          <span>✈️ Scroll to explore trip intelligence</span>
          <span className="scroll-arrow">↓</span>
        </motion.div>
      </div>
    </section>
  )
}
