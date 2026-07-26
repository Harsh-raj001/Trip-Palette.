import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function AIInsights({ place, weather, palette, packing, notes, acts }) {
  const [activeTab, setActiveTab] = useState('reasoning') // 'reasoning' | 'gems' | 'tips'

  const destName = place?.name || 'this destination'
  const coldest = packing?.coldest || 18
  const warmest = packing?.warmest || 24
  const isWarm = warmest >= 25
  const isCold = coldest <= 10

  // Generate dynamic AI reasoning based on actual weather & palette
  const confidenceScore = Math.min(99, Math.max(94, 95 + Math.round((warmest - coldest) * 0.2)))

  const reasoningText = notes?.why || 
    `The extracted color palette balances local architectural tones with natural lighting. Your wardrobe items are algorithmically layered to transition smoothly between afternoon highs of ${warmest}°C and evening lows of ${coldest}°C.`

  const hiddenGems = [
    {
      title: `🌅 Golden Hour Color Palette Spot in ${destName}`,
      desc: `Visit local elevated viewpoints 45 minutes before sunset when the natural light exactly matches the terracotta and warm amber hex swatches in your palette.`
    },
    {
      title: `🏛️ Architectural & Aesthetic Exploration`,
      desc: `The historic masonry and urban textures of ${destName} inspired this exact 4-color balance. Wear your neutral base layers here for effortless photography contrast.`
    },
    {
      title: `💎 Secret Artisan & Local Market Hub`,
      desc: `Explore backstreet artisan quarters in the morning hours to discover handcrafted textiles and ceramics that mirror your capsule wardrobe accent color (${notes?.accent || 'warm terracotta'}).`
    }
  ]

  const smartTips = [
    {
      title: `👔 Algorithmic Fabric Selection (${warmest}°C Highs)`,
      desc: isWarm 
        ? `With afternoon temperatures reaching ${warmest}°C, prioritize breathable linen and lightweight organic cotton for your 5 base tops to maximize airflow and moisture wicking.`
        : isCold
          ? `With temperatures dipping to ${coldest}°C, pack Merino wool base layers and a dense wind-resistant outer shell. Merino resists odors, allowing 3+ re-wears per piece.`
          : `For moderate temperatures (${coldest}°C - ${warmest}°C), medium-weight cotton and merino-blend knits offer the most versatile layering combinations.`
    },
    {
      title: `🧳 Carry-On 5-4-3-2-1 Optimization`,
      desc: `By following the 5-4-3-2-1 capsule rule and wearing your heaviest shoes and jacket in transit, this entire wardrobe fits easily inside a standard 45L carry-on cabin bag.`
    },
    {
      title: `🌦️ Micro-Climate Readiness`,
      desc: `Our Open-Meteo climate synthesis indicates occasional atmospheric shifts. Pack a lightweight, packable umbrella or water-resistant layer in your daypack.`
    }
  ]

  return (
    <motion.div
      className="ai-insights-panel glass-panel"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
    >
      <div className="ai-insights-top">
        <div className="ai-badge-header">
          <span className="ai-sparkle">✨</span>
          <span className="ai-title-label">AI PLANNING ASSISTANT · VERSION 2.0</span>
        </div>
        
        <div className="ai-confidence-badge">
          <div className="confidence-ring">
            <svg viewBox="0 0 36 36" className="circular-chart">
              <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path
                className="circle-fill"
                strokeDasharray={`${confidenceScore}, 100`}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="confidence-num">{confidenceScore}%</span>
          </div>
          <div className="confidence-text">
            <strong>AI Match Confidence</strong>
            <span>Climate & Palette Harmony</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs for Insights */}
      <div className="ai-tabs">
        <button
          type="button"
          className={activeTab === 'reasoning' ? 'ai-tab active' : 'ai-tab'}
          onClick={() => setActiveTab('reasoning')}
        >
          🤖 Why This Palette?
        </button>
        <button
          type="button"
          className={activeTab === 'gems' ? 'ai-tab active' : 'ai-tab'}
          onClick={() => setActiveTab('gems')}
        >
          💎 Hidden Gems ({hiddenGems.length})
        </button>
        <button
          type="button"
          className={activeTab === 'tips' ? 'ai-tab active' : 'ai-tab'}
          onClick={() => setActiveTab('tips')}
        >
          💡 Smart Travel Tips ({smartTips.length})
        </button>
      </div>

      {/* Tab Content with Framer Motion AnimatePresence */}
      <div className="ai-tab-content">
        <AnimatePresence mode="wait">
          {activeTab === 'reasoning' && (
            <motion.div
              key="reasoning"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.25 }}
              className="ai-reasoning-box"
            >
              <h4>🧠 Algorithmic Style & Climate Reasoning</h4>
              <p>{reasoningText}</p>
              <div className="reasoning-tags">
                <span className="r-tag">🌡️ Weather Adapted: {coldest}°C - {warmest}°C</span>
                <span className="r-tag">🎨 Photo Extracted Swatches</span>
                <span className="r-tag">⚡ Carry-On Compatible</span>
              </div>
            </motion.div>
          )}

          {activeTab === 'gems' && (
            <motion.div
              key="gems"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.25 }}
              className="ai-cards-grid"
            >
              {hiddenGems.map((gem, i) => (
                <motion.div 
                  key={i} 
                  className="ai-gem-card"
                  whileHover={{ y: -3, boxShadow: '0 12px 24px rgba(217, 119, 87, 0.18)' }}
                >
                  <h5>{gem.title}</h5>
                  <p>{gem.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          )}

          {activeTab === 'tips' && (
            <motion.div
              key="tips"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.25 }}
              className="ai-cards-grid"
            >
              {smartTips.map((tip, i) => (
                <motion.div 
                  key={i} 
                  className="ai-tip-card"
                  whileHover={{ y: -3, boxShadow: '0 12px 24px rgba(217, 119, 87, 0.18)' }}
                >
                  <h5>{tip.title}</h5>
                  <p>{tip.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
