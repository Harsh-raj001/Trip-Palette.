"use client";
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const STEPS = [
  { icon: '•', text: 'Navigating 3D spherical coordinates & flight routes...', progress: 18 },
  { icon: '•', text: 'Analysing climate & Open-Meteo historical weather averages...', progress: 42 },
  { icon: '•', text: 'Extracting real photographic color swatches & harmony ratios...', progress: 68 },
  { icon: '•', text: 'Executing algorithmic 5-4-3-2-1 capsule wardrobe pairing...', progress: 88 },
  { icon: '•', text: 'Assembling your personalized Trip Palette 2.0...', progress: 96 }
]

export default function AILoader({ destination }) {
  const [stepIx, setStepIx] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIx(prev => (prev < STEPS.length - 1 ? prev + 1 : prev))
    }, 850)
    return () => clearInterval(interval)
  }, [])

  const currentStep = STEPS[stepIx]

  return (
    <motion.div
      className="ai-loader-container glass-panel"
      initial={{ opacity: 0, y: 20, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="ai-loader-header">
        <div className="ai-badge-pulse">
          <span className="pulse-dot"></span>
          ITINERARY & CAPSULE CURATOR ACTIVE
        </div>
        <h3>Synthesizing {destination || 'Your Destination'}</h3>
      </div>

      <div className="ai-loader-progress-wrap">
        <div className="progress-bar-bg">
          <motion.div
            className="progress-bar-fill"
            initial={{ width: '5%' }}
            animate={{ width: `${currentStep.progress}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>
        <span className="progress-pct">{currentStep.progress}%</span>
      </div>

      <div className="ai-loader-step">
        <AnimatePresence mode="wait">
          <motion.div
            key={stepIx}
            className="step-content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <span className="step-icon">{currentStep.icon}</span>
            <span className="step-text">{currentStep.text}</span>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="ai-loader-hint">
        Pro Tip: Trip Palette uses the 5-4-3-2-1 wardrobe method to eliminate luggage bulk while matching local climate aesthetics.
      </div>
    </motion.div>
  )
}

