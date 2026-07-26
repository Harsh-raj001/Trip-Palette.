import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import DatePickerDropdown from './DatePickerDropdown.jsx'
import { searchCities } from './api.js'

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
  const [startOptions, setStartOptions] = useState([])
  const [budget, setBudget] = useState('💳 Moderate')
  const [travellers, setTravellers] = useState('👥 Couple (2)')
  const [transport, setTransport] = useState('✈️ Flights + Train')
  const [accom, setAccom] = useState('🏨 Boutique Hotel')
  const [weatherPref, setWeatherPref] = useState('☀️ Sunny & Warm')
  
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

  // Dynamic Location Logic
  const currentCity = place ? place.name : (query && query.trim() !== '' ? query.split(',')[0].trim() : 'Amalfi');
  const currentCountry = place ? (place.country || '') : (query && query.includes(',') ? query.split(',')[1].trim() : 'Italy');
  const fullDestName = `${currentCity}${currentCountry ? ', ' + currentCountry : ''}`;

  // Dynamic Transit Hub based on City
  const transitHub = currentCity.toLowerCase().includes('kyoto') || currentCity.toLowerCase().includes('tokyo') ? 'Taipei' :
                     currentCity.toLowerCase().includes('paris') || currentCity.toLowerCase().includes('london') ? 'Zurich' :
                     currentCity.toLowerCase().includes('new york') || currentCity.toLowerCase().includes('us') ? 'Reykjavik' :
                     currentCity.toLowerCase().includes('bali') || currentCity.toLowerCase().includes('thai') ? 'Singapore' : 'Paris';

  // Dynamic Transport Icon & Wording
  const transportIcon = transport.includes('Train') ? '🚆' : (transport.includes('Car') ? '🚗' : '✈️');

  // Dynamic Weather based on City & Prefs
  const baseWeather = currentCity.toLowerCase().includes('kyoto') || currentCity.toLowerCase().includes('tokyo') ? { temp: '21°C', desc: 'Mild Sakura Breeze', rain: '0% Rain · Clear Skies', icon: '🌸' } :
                      currentCity.toLowerCase().includes('paris') || currentCity.toLowerCase().includes('london') ? { temp: '18°C', desc: 'Crisp Classic Air', rain: '10% Rain · Light Breeze', icon: '⛅' } :
                      currentCity.toLowerCase().includes('bali') || currentCity.toLowerCase().includes('thai') ? { temp: '29°C', desc: 'Tropical Golden Warmth', rain: '5% Rain · Ocean Breeze', icon: '🌴' } :
                      currentCity.toLowerCase().includes('swiss') || currentCity.toLowerCase().includes('alps') ? { temp: '-2°C', desc: 'Alpine Sun & Powder', rain: '0% Rain · Crisp Winter', icon: '❄️' } :
                      { temp: '24°C', desc: 'Perfect Golden Hour', rain: '0% Precipitation · Light Breeze', icon: '☀️' };
  
  const dynamicWeather = weatherPref.includes('Cool') ? { ...baseWeather, temp: '16°C', desc: 'Cool Autumn Air', icon: '🍂' } :
                         weatherPref.includes('Sunny') ? { ...baseWeather, temp: '26°C', desc: 'Golden Sun & Clear Skies', icon: '☀️' } : baseWeather;

  // Dynamic Itinerary Preview scaling with Trip Duration (tripDays) & User Prefs
  const daysCount = tripDays > 0 ? Math.min(Math.max(tripDays, 3), 14) : 6;
  const accomClean = accom.replace('🏨 ', '').replace('🏡 ', '').replace('🏨', '').replace('🏡', '').trim();
  const travelStyle = travellers.split(' ')[0] || 'Couple';
  const budgetTier = budget.replace('🪙 ', '').replace('💳 ', '').replace('💎 ', '').trim();

  const dayTemplates = [
    { icon: transportIcon, title: `Arrive in ${currentCity} & VIP Transfer`, tag: 'Logistics', time: '10:30 AM' },
    { icon: '🏨', title: `${accomClean} Check-in & Espresso near Center`, tag: 'Comfort', time: '02:00 PM' },
    { icon: acts && acts.includes('swim') ? '🏖️' : (acts && acts.includes('hike') ? '🥾' : '🍜'), 
      title: acts && acts.includes('swim') ? `Private Beach Cabana & Sunset Cocktails` : (acts && acts.includes('hike') ? `Geodesic Trail & Scenic Viewpoint in ${currentCity}` : `Artisan Gastronomy Tasting at ${currentCity} Market`), 
      tag: acts && acts.includes('swim') ? 'Relaxation' : (acts && acts.includes('hike') ? 'Outdoors' : 'Gastronomy'), time: '12:30 PM' },
    { icon: acts && acts.includes('work') ? '💻' : (acts && acts.includes('formal') ? '🍷' : '🏛️'), 
      title: acts && acts.includes('work') ? `Executive Networking & Co-working Lounge` : (acts && acts.includes('formal') ? `Michelin-Star Rooftop Dining in ${currentCity}` : `Private Architecture & Culture Tour of ${currentCity}`), 
      tag: acts && acts.includes('work') ? 'Business' : (acts && acts.includes('formal') ? 'Fine Dining' : 'Culture'), time: '11:00 AM' },
    { icon: '🌅', title: `Sunset Photography at Coastal Viewpoint`, tag: 'Golden Hour', time: '06:45 PM' },
    { icon: '🍽️', title: `Terracotta Rooftop Farewell Dinner (${budgetTier})`, tag: 'Nightlife', time: '08:30 PM' },
    { icon: '🍷', title: `Private Vineyard & Heritage Wine Tasting`, tag: 'Sommelier Choice', time: '03:00 PM' },
    { icon: '⛵', title: `Private Coastal Catamaran Charter in ${currentCity}`, tag: 'Excursion', time: '11:30 AM' },
    { icon: '🛀', title: `Thermal Geothermal Spa & Holistic Wellness`, tag: 'Rejuvenation', time: '04:00 PM' },
    { icon: '🎨', title: `Private Contemporary Gallery & Atelier Visit`, tag: 'Arts', time: '01:30 PM' },
    { icon: '⛰️', title: `Alpine Geodesic Cable Car & Summit Lunch`, tag: 'Adventure', time: '10:00 AM' },
    { icon: '🛍️', title: `Artisan Fashion Boutique Curated Walk`, tag: 'Style & Design', time: '02:30 PM' },
    { icon: '🌌', title: `Stargazing Observatory Night Tour`, tag: 'Astronomy', time: '09:30 PM' },
    { icon: transportIcon, title: `VIP Terminal Lounge & Departure from ${currentCity}`, tag: 'Farewell', time: '11:00 AM' }
  ];

  const dynamicItinerary = Array.from({ length: daysCount }, (_, i) => ({
    day: `Day ${i + 1}`,
    ...(dayTemplates[i % dayTemplates.length])
  }));

  // Dynamic Climate Swatches based on City
  const dynamicSwatches = currentCity.toLowerCase().includes('kyoto') || currentCity.toLowerCase().includes('tokyo') ? ['#E87A90', '#5B8C5A', '#FAF5F0', '#2B2B2B'] :
                          currentCity.toLowerCase().includes('paris') || currentCity.toLowerCase().includes('london') ? ['#C5A059', '#1E3A8A', '#F8F9FA', '#111827'] :
                          currentCity.toLowerCase().includes('bali') || currentCity.toLowerCase().includes('thai') ? ['#0D9488', '#38BDF8', '#FEF9C3', '#134E4A'] :
                          currentCity.toLowerCase().includes('swiss') || currentCity.toLowerCase().includes('alps') ? ['#3B82F6', '#93C5FD', '#F0F9FF', '#1E293B'] :
                          ['#D97757', '#F97316', '#FAF8F5', '#2A2421'];

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
                <label>📍 STARTING FROM</label>
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
                          <span className="dest-main-text">📍 {c.name}</span>
                          <span className="dest-sub-text">{[c.admin, c.country].filter(Boolean).join(', ')}</span>
                        </motion.button>
                      ))}
                    </motion.div>
                  </AnimatePresence>
                )}
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
              <span className="cta-icon">✨</span> Generate Itinerary & Capsule Wardrobe
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
          <span>✈️ Scroll to explore trip intelligence</span>
          <span className="scroll-arrow">↓</span>
        </motion.div>
      </div>
    </section>
  )
}
