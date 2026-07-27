"use client";
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import DatePickerDropdown from './DatePickerDropdown.jsx'
import { searchCities } from './api.js'

const BUDGET_OPTIONS = ['Budget', 'Moderate', 'Luxury']
const TRAVELLER_OPTIONS = ['Solo (1)', 'Couple (2)', 'Family (4)', 'Group (6+)']

export default function HeroSection({
  query, setQuery, place, setPlace, options, setOptions,
  start, setStart, end, setEnd, tripDays,
  acts, toggleAct, ACTS, onGenerate
}) {
  const [chipIdx, setChipIdx] = useState(0)
  const [startLoc, setStartLoc] = useState('San Francisco, US')
  const [startOptions, setStartOptions] = useState([])
  const [budget, setBudget] = useState('Moderate')
  const [travellers, setTravellers] = useState('Couple (2)')
  const [transport, setTransport] = useState('Flights + Train')
  const [accom, setAccom] = useState('Boutique Hotel')
  const [weatherPref, setWeatherPref] = useState('Sunny & Warm')
  
  const startDebounce = useRef(null)

  // Autocomplete Suggestions for Starting Location (FROM)
  useEffect(() => {
    clearTimeout(startDebounce.current)
    if (!startLoc || startLoc.trim().length < 2) { setStartOptions([]); return }
    startDebounce.current = setTimeout(async () => {
      try {
        const res = await searchCities(startLoc)
        setStartOptions(res)
      } catch {
        setStartOptions([])
      }
    }, 280)
  }, [startLoc])

  return (
    <section className="hero-split-section">
      <div className="hero-split-grid">
        
        {/* ================= HERO SEARCH CARD AREA ================= */}
        <div className="hero-left-column">
          
          {/* Outcome-Focused Headline */}
          <h1 className="hero-main-headline">
            Plan your perfect <span className="highlight-rust">journey</span> in seconds<span className="brand-dot">.</span>
          </h1>

          {/* Supporting Text */}
          <p className="hero-supporting-text">
            Our intelligent assistant synthesizes personalized itineraries and capsule wardrobes based on your destination, budget, travel style, climate, and available time.
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
                <label>STARTING FROM</label>
                <input
                  type="text"
                  className="search-input-circular-glow"
                  value={startLoc}
                  onChange={e => setStartLoc(e.target.value)}
                  placeholder="Your City (e.g. London)"
                />
                {startOptions && startOptions.length > 0 && (
                  <AnimatePresence>
                    <motion.div 
                      className="dropdown glass-panel"
                      initial={{ opacity: 0, y: -10, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.96 }}
                      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                    >
                      {startOptions.map((c, i) => (
                        <motion.button 
                          key={i} 
                          type="button"
                          onClick={() => { 
                            setStartLoc(`${c.name}${c.country ? ', ' + c.country : ''}`)
                            setStartOptions([]) 
                          }}
                          whileHover={{ x: 6, backgroundColor: 'rgba(217, 119, 87, 0.09)' }}
                        >
                          <span className="dest-main-text">{c.name}</span>
                          <span className="dest-sub-text">{[c.admin, c.country].filter(Boolean).join(', ')}</span>
                        </motion.button>
                      ))}
                    </motion.div>
                  </AnimatePresence>
                )}
              </div>

              {/* Destination */}
              <div className="field dest-field">
                <label>DESTINATION</label>
                <input
                  type="text"
                  className="search-input-circular-glow"
                  value={query}
                  placeholder="Where to? (e.g. Spain, Kyoto)"
                  onChange={e => { setQuery(e.target.value); setPlace(null) }}
                />
                {options && options.length > 0 && (
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
                          <span className="dest-main-text">{c.name}</span>
                          <span className="dest-sub-text">{[c.admin, c.country].filter(Boolean).join(', ')}</span>
                        </motion.button>
                      ))}
                    </motion.div>
                  </AnimatePresence>
                )}
              </div>

              {/* Travel Dates */}
              <div className="field dates-combined-field">
                <label>TRAVEL DATES & DURATION</label>
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
                <label className="selector-label">BUDGET</label>
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
                <label className="selector-label">TRAVELLERS</label>
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
              <span className="pref-badge" onClick={() => setTransport(transport === 'Flights + Train' ? 'Rental Car' : 'Flights + Train')}>
                Transport: <strong>{transport}</strong>
              </span>
              <span className="pref-badge" onClick={() => setAccom(accom === 'Boutique Hotel' ? 'Airbnb Villa' : 'Boutique Hotel')}>
                Stay: <strong>{accom}</strong>
              </span>
              <span className="pref-badge" onClick={() => setWeatherPref(weatherPref === 'Sunny & Warm' ? 'Cool & Crisp' : 'Sunny & Warm')}>
                Climate: <strong>{weatherPref}</strong>
              </span>
            </div>

            {/* Interests Chips */}
            <div className="field acts-wrap">
              <label>CURATED INTERESTS & ACTIVITIES</label>
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
              Generate Itinerary & Capsule Wardrobe
            </motion.button>
          </motion.div>
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
          <span>Scroll to explore trip intelligence</span>
          <span className="scroll-arrow">↓</span>
        </motion.div>
      </div>
    </section>
  )
}

