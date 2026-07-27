"use client";
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import confetti from 'canvas-confetti'
import { searchCities, getWeather, getPhotos, fetchAttractions } from './api.js'
import { loadImage, extractPalette } from './palette.js'
import { buildPacking, colorNotes, verifyCapsulePairing } from './packing.js'
import BoardingPassModal from './BoardingPassModal.jsx'
import Globe3D from './Globe3D.jsx'
import AILoader from './AILoader.jsx'
import DatePickerDropdown from './DatePickerDropdown.jsx'
import HeroSection from './HeroSection.jsx'

const WeatherWidget = ({ weather, packing }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  return (
    <motion.div 
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className="card glass-panel" 
      style={{ 
        padding: '24px', 
        position: 'relative',
        overflow: 'hidden'
      }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <div 
        style={{
          position: 'absolute',
          top: mousePos.y,
          left: mousePos.x,
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(250, 204, 21, 0.12) 0%, rgba(250, 204, 21, 0) 70%)',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
          zIndex: 0,
          transition: 'opacity 0.3s ease'
        }}
      />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>Live Weather Forecast</h3>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ fontSize: '3rem', fontWeight: 700, letterSpacing: '-0.05em' }}>{Math.round(packing.warmest)}°C</div>
          <div>
            <div style={{ fontWeight: 600 }}>{weather.typical ? 'Typical Conditions' : 'Live Forecast'}</div>
            <div className="subtitle-text">Perfect conditions for your activities.</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const ACTS = [
  { id: 'work', label: 'Work / business' },
  { id: 'formal', label: 'Nice dinners / formal' },
  { id: 'swim', label: 'Beach / pool' },
  { id: 'gym', label: 'Workout / run' },
  { id: 'hike', label: 'Hiking / outdoors' },
  { id: 'rain', label: 'Rain expected' },
  { id: 'snow', label: 'Snow / freezing' }
]

const dstr = d => d.toISOString().slice(0, 10)
const fmt = s => new Date(s + 'T00:00:00').toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })

export default function App() {
  const today = new Date()
  const in90 = new Date(today.getTime() + 60 * 86400000)
  const [query, setQuery] = useState('')
  const [options, setOptions] = useState([])
  const [place, setPlace] = useState(null)
  const [start, setStart] = useState(dstr(in90))
  const [end, setEnd] = useState(dstr(new Date(in90.getTime() + 6 * 86400000)))
  const [acts, setActs] = useState(['hike', 'formal', 'rain'])
  
  const [weather, setWeather] = useState(null)
  const [photos, setPhotos] = useState([])
  const [palettes, setPalettes] = useState([])
  const [photoIx, setPhotoIx] = useState(0)
  const [packing, setPacking] = useState(null)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  const [carryOn, setCarryOn] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [favorites, setFavorites] = useState({})
  const [attractions, setAttractions] = useState([])
  const debounce = useRef(null)

  // Cinematic Parallax Setup
  const { scrollY } = useScroll();
  const photoY = useTransform(scrollY, [0, 800], [0, 150]);
  const photoScale = useTransform(scrollY, [0, 800], [1, 1.15]);

  const toggleFavorite = (color, e) => {
    e.stopPropagation()
    setFavorites(f => ({ ...f, [color]: !f[color] }))
  }

  useEffect(() => {
    if (place && query === label(place)) return
    clearTimeout(debounce.current)
    if (!query.trim()) { setOptions([]); return }
    debounce.current = setTimeout(async () => {
      try { setOptions(await searchCities(query)) } catch { setOptions([]) }
    }, 280)
  }, [query])

  const label = c => [c.name, c.admin, c.country].filter(Boolean).join(', ')

  const loadData = async (pl, s, e) => {
    setLoading(true); setErr('')
    const days = Math.round((new Date(e) - new Date(s)) / 86400000) + 1
    try {
      const [w, ph, attr] = await Promise.all([
        getWeather(pl.lat, pl.lon, s, e),
        getPhotos(label(pl)),
        fetchAttractions(pl.lat, pl.lon)
      ])
      setWeather(w)
      setPhotos(ph)
      setAttractions(attr)
      const pals = await Promise.all(ph.map(async p => {
        try { return extractPalette(await loadImage(p.url)) } catch { return null }
      }))
      setPalettes(pals)
      setPacking(buildPacking({ days, weather: w, activities: acts, carryOn }))
      
      if (w && pals.length > 0) {
        setTimeout(() => {
          confetti({
            particleCount: 85,
            spread: 75,
            origin: { y: 0.55 },
            colors: ['#D97757', '#FF4500', '#FAF6F0', '#E6DCD3', '#3B82F6']
          })
        }, 350)
      }
    } catch (ex) {
      console.error(ex)
      setErr('Could not load forecast or photos for that location.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (place) loadData(place, start, end)
  }, [place, start, end])

  useEffect(() => {
    if (weather && start && end) {
      const days = Math.round((new Date(end) - new Date(start)) / 86400000) + 1
      setPacking(buildPacking({ days, weather, activities: acts, carryOn }))
    }
  }, [acts, carryOn])

  const toggleAct = id => setActs(a => a.includes(id) ? a.filter(x => x !== id) : [...a, id])

  const palette = palettes[photoIx] || palettes.find(Boolean) || ['#3B82F6', '#10B981', '#FAF8F5', '#F97316']
  const notes = colorNotes(palette, acts)
  const tripDays = start && end ? Math.round((new Date(end) - new Date(start)) / 86400000) + 1 : 0
  const capsule = (carryOn && packing) ? verifyCapsulePairing(packing.topsQty || 3, packing.bottomsQty || 2, palette, notes) : null

  return (
    <div className="app-container">
      {/* Fullscreen Interactive Background 3D Globe */}
      <Globe3D place={place} />

      {/* Header Branding */}
      <header className="main-header">
        <div className="brand-wrap" onClick={() => { setPlace(null); setQuery('') }} style={{ cursor: 'pointer' }}>
          <h1 className="brand-logo">Trip Palette<span className="brand-dot">.</span></h1>
          <p className="tagline">pack to match your destination</p>
        </div>
      </header>

      {/* Hero Split Section (Version 2.0 UX Apple/Airbnb/Linear) */}
      <HeroSection
        query={query}
        setQuery={setQuery}
        place={place}
        setPlace={setPlace}
        options={options}
        setOptions={setOptions}
        start={start}
        setStart={setStart}
        end={end}
        setEnd={setEnd}
        tripDays={tripDays}
        acts={acts}
        toggleAct={toggleAct}
        ACTS={ACTS}
        onGenerate={() => {
          if (!place && options.length > 0) {
            const c = options[0];
            setPlace(c);
            setQuery(`${c.name}${c.country ? ', ' + c.country : ''}`);
            setOptions([]);
          } else if (place) {
            const el = document.querySelector('.results-arch-container');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }
        }}
      />

      <AnimatePresence mode="wait">
        {loading && (
          <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <AILoader destination={place ? place.name : query} />
          </motion.div>
        )}
      </AnimatePresence>
      {err && !loading && <div className="state-box glass-panel err">{err}</div>}

      {/* Results Section */}
      {place && weather && packing && !loading && (
        <motion.section 
          className="results-arch-container"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Top Header Banner */}
          <div className="results-header-banner glass-panel">
            <div className="banner-left">
              <div className="route-badge">TARGET LOCK: {place.country.toUpperCase()}</div>
              <h1>{place.name}</h1>
              <p className="banner-meta">{fmt(start)} – {fmt(end)} ({tripDays} Days) · {weather.typical ? 'Historical Typical Weather' : 'Live 16-Day Forecast'}</p>
            </div>
            <div className="banner-right">
              <div className="temp-badge">
                <span className="temp-val">{Math.round(packing.coldest)}° – {Math.round(packing.warmest)}°C</span>
                <span className="temp-lbl">Forecast Temperature Range</span>
              </div>
              <button className="share-btn-accent" onClick={() => setShowShareModal(true)}>
                Share IG Story Boarding Pass
              </button>
            </div>
          </div>

          {/* 3D Architectural Dual Grid */}
          <div className="arch-dual-grid">
            {/* Left Card: Photos & Palette */}
            <div className="card glass-panel">
              <h2>Landscape Photography & Palette Extraction</h2>
              {photos.length > 0 ? (
                <>
                  <div className="photo-box" style={{ overflow: 'hidden' }}>
                    <motion.img 
                      src={photos[photoIx].url} 
                      alt={place.name} 
                      crossOrigin="anonymous" 
                      style={{ y: photoY, scale: photoScale, transformOrigin: 'center center' }}
                    />
                    <div className="credit" style={{ position: 'relative', zIndex: 2 }}>photo: <a href={photos[photoIx].page} target="_blank" rel="noreferrer">{photos[photoIx].credit || 'Wikimedia Commons'}</a></div>
                  </div>
                  {photos.length > 1 && (
                    <div className="thumbs">
                      {photos.map((p, i) => (
                        <button key={i} className={i === photoIx ? 'thumb on' : 'thumb'} onClick={() => setPhotoIx(i)}>
                          <img src={p.url} alt="" crossOrigin="anonymous" />
                        </button>
                      ))}
                    </div>
                  )}
                  {palette.length > 0 && (
                    <div className="swatches">
                      {palette.map((h, i) => (
                        <motion.div 
                          className="swatch" 
                          key={i}
                          initial={{ opacity: 0, y: 30, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          whileHover={{ y: -5, scale: 1.03, boxShadow: '0 12px 24px rgba(0, 0, 0, 0.15)' }}
                          transition={{ delay: i * 0.08, type: 'spring', stiffness: 350, damping: 20 }}
                        >
                          <div className="chipcolor" style={{ background: h }}>
                            <button 
                              type="button"
                              className="fav-heart-btn"
                              onClick={(e) => toggleFavorite(h, e)}
                              title={favorites[h] ? 'Remove from favorites' : 'Save to favorites'}
                            >
                              {favorites[h] ? '♥' : '♡'}
                            </button>
                          </div>
                          <span>{h}</span>
                        </motion.div>
                      ))}
                    </div>
                  )}
                  {notes && (
                    <div className="notes">
                      <strong>What to actually wear:</strong> {notes.why}
                    </div>
                  )}
                </>
              ) : (
                <p className="subtitle-text">No free-license Wikimedia photos found for this exact title, using default palette.</p>
              )}
            </div>

            {/* Right Card: The Packing List */}
            <div className="card glass-panel">
              <div className="list-header-row">
                <div>
                  <h2>The 5-4-3-2-1 Packing List</h2>
                  <p className="subtitle-text">Tailored to {Math.round(packing.coldest)}°–{Math.round(packing.warmest)}°C & your activities</p>
                </div>
                <label className="toggle-wrap">
                  <input
                    type="checkbox"
                    checked={carryOn}
                    onChange={e => setCarryOn(e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                  <span className="toggle-label">Carry-on Mode (No Checked Bags)</span>
                </label>
              </div>
              <div className="tier">{packing.tier}</div>

              {capsule && (
                <div className="capsule-box">
                  <div className="capsule-header">
                    <strong>Carry-on Capsule Verified ({capsule.totalOutfits} Outfits)</strong>
                    <span className="capsule-badge">100% Palette Compatible</span>
                  </div>
                  <p className="capsule-summary">{capsule.summary}</p>
                  <div className="capsule-pairings">
                    {capsule.pairings.map((pair, i) => (
                      <span key={i} className="pairing-pill">{pair}</span>
                    ))}
                  </div>
                </div>
              )}

              <ul className="list">
                {packing.items.map((it, i) => (
                  <motion.li 
                    key={i}
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.25 }}
                    whileHover={{ scale: 1.012, x: 5, backgroundColor: 'rgba(217, 119, 87, 0.09)' }}
                  >
                    <span className="qty">{it.qty}</span>
                    <span className="name">{it.name}</span>
                    <span className="why">{it.why}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* Live APIs Grid */}
          <div className="live-api-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
            {/* Weather Widget */}
            <WeatherWidget weather={weather} packing={packing} />

            {/* Places Widget */}
            <div className="card glass-panel" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>Local Hidden Gems</h3>
              </div>
              <ul className="list">
                {attractions && attractions.length > 0 ? attractions.map((attr, idx) => (
                  <li key={idx} style={{ padding: '8px 0', borderBottom: idx === attractions.length - 1 ? '0' : '1px dashed var(--line)' }}>
                    <span className="name" style={{ gridArea: 'unset', width: '100%', textTransform: 'capitalize' }}>{attr.name}</span>
                    <span className="why" style={{ gridArea: 'unset', width: '100%', textTransform: 'capitalize' }}>Highly rated {attr.type}</span>
                  </li>
                )) : (
                  <li style={{ padding: '8px 0', borderBottom: '0' }}>
                    <span className="name" style={{ gridArea: 'unset', width: '100%' }}>Discover locally</span>
                    <span className="why" style={{ gridArea: 'unset', width: '100%' }}>No hidden gems found nearby.</span>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </motion.section>
      )}

      {/* Boarding Pass Modal */}
      {showShareModal && place && packing && (
        <BoardingPassModal
          place={place}
          start={start}
          end={end}
          tripDays={tripDays}
          coldest={packing.coldest || 18}
          warmest={packing.warmest || 24}
          palette={palette}
          items={packing.items || []}
          onClose={() => setShowShareModal(false)}
        />
      )}

      <footer className="main-footer">
        built with Antigravity by <a href="https://github.com/Harsh-raj001" target="_blank" rel="noreferrer">@harshraj</a> · weather by <a href="https://open-meteo.com" target="_blank" rel="noreferrer">Open-Meteo</a> · photos from Wikimedia Commons
      </footer>
    </div>
  )
}


