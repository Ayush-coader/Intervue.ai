import { useEffect, useState } from 'react'
import './LoadingScreen.scss'

const STEPS = [
  { id: 1, label: 'Parsing resume content',       icon: '📄', detail: 'Extracting skills, experience & keywords...' },
  { id: 2, label: 'Analysing job description',     icon: '🔍', detail: 'Mapping requirements to your profile...' },
  { id: 3, label: 'Detecting skill gaps',          icon: '⚡', detail: 'Comparing competencies against role...' },
  { id: 4, label: 'Generating interview questions', icon: '🧠', detail: 'Crafting tailored technical & behavioural Q&A...' },
  { id: 5, label: 'Building preparation plan',     icon: '🗓️', detail: 'Designing your 7-day roadmap...' },
  { id: 6, label: 'Finalising your report',        icon: '✨', detail: 'Almost there — polishing the final output...' },
]

const TIPS = [
  'Tip: Tailor your resume keywords to each job description for higher ATS scores.',
  'Tip: Use the STAR method (Situation, Task, Action, Result) for behavioural answers.',
  'Tip: Focus your prep on the top 3 skill gaps flagged in your report.',
  'Tip: Quantify achievements — numbers make bullets 40% more impactful to recruiters.',
  'Tip: Practice each technical question aloud — fluency matters as much as accuracy.',
  'Tip: Researching the company culture gives you an edge in behavioural interviews.',
]

export default function LoadingScreen() {
  const [activeStep, setActiveStep]   = useState(0)
  const [tipIndex,   setTipIndex]     = useState(0)
  const [progress,   setProgress]     = useState(0)

  // Cycle through steps
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep(prev => (prev + 1) % STEPS.length)
    }, 2800)
    return () => clearInterval(interval)
  }, [])

  // Cycle tips independently
  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex(prev => (prev + 1) % TIPS.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  // Smooth progress bar that fills over ~18s then holds near 95%
  useEffect(() => {
    let raf
    let start = null
    const DURATION = 18000

    const tick = (ts) => {
      if (!start) start = ts
      const elapsed = ts - start
      // Ease-out curve that approaches 95 asymptotically
      const raw = Math.min(elapsed / DURATION, 1)
      const eased = 1 - Math.pow(1 - raw, 2.5)
      setProgress(Math.min(eased * 95, 95))
      if (elapsed < DURATION) raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div className="ls-overlay">
      {/* Ambient background orbs */}
      <div className="ls-orb ls-orb--purple" />
      <div className="ls-orb ls-orb--indigo" />
      <div className="ls-orb ls-orb--cyan"   />

      {/* Grid noise texture */}
      <div className="ls-grid" />

      <div className="ls-card">

        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="ls-header">
          <div className="ls-logo-ring">
            <svg className="ls-logo-spinner" viewBox="0 0 80 80" fill="none">
              <circle cx="40" cy="40" r="34" stroke="url(#ring-grad)" strokeWidth="3"
                      strokeDasharray="180 40" strokeLinecap="round" />
              <defs>
                <linearGradient id="ring-grad" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#8b5cf6" />
                  <stop offset="1" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
            </svg>
            <span className="ls-logo-icon">✦</span>
          </div>
          <div className="ls-title-group">
            <h2 className="ls-title">Generating Your Report</h2>
            <p className="ls-subtitle">AI is deeply analysing your profile against the role</p>
          </div>
        </div>

        {/* ── Progress bar ────────────────────────────────────────── */}
        <div className="ls-progress-wrap">
          <div className="ls-progress-bar">
            <div className="ls-progress-fill" style={{ width: `${progress}%` }} />
            <div className="ls-progress-glow"  style={{ left:  `${progress}%` }} />
          </div>
          <span className="ls-progress-pct">{Math.round(progress)}%</span>
        </div>

        {/* ── Step list ───────────────────────────────────────────── */}
        <ul className="ls-steps">
          {STEPS.map((step, idx) => {
            const state =
              idx < activeStep  ? 'done'
              : idx === activeStep ? 'active'
              : 'pending'
            return (
              <li key={step.id} className={`ls-step ls-step--${state}`}>
                <div className="ls-step-icon-wrap">
                  {state === 'done' ? (
                    <svg className="ls-check" viewBox="0 0 20 20" fill="none">
                      <circle cx="10" cy="10" r="9" fill="rgba(16,185,129,0.15)" stroke="#10b981" strokeWidth="1.5"/>
                      <path d="M6 10l2.5 2.5L14 7" stroke="#10b981" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : state === 'active' ? (
                    <div className="ls-dot-pulse">
                      <div className="ls-dot" />
                    </div>
                  ) : (
                    <div className="ls-dot ls-dot--idle" />
                  )}
                </div>

                <div className="ls-step-text">
                  <span className="ls-step-label">{step.icon} {step.label}</span>
                  {state === 'active' && (
                    <span className="ls-step-detail">{step.detail}</span>
                  )}
                </div>

                {state === 'active' && (
                  <div className="ls-step-shimmer" />
                )}
              </li>
            )
          })}
        </ul>

        {/* ── Tip rotator ─────────────────────────────────────────── */}
        <div className="ls-tip-wrap">
          <div className="ls-tip-icon">💡</div>
          <p key={tipIndex} className="ls-tip-text fade-in">{TIPS[tipIndex]}</p>
        </div>

        {/* ── Footer note ─────────────────────────────────────────── */}
        <p className="ls-footer-note">
          This usually takes <strong>20–60 seconds</strong> — complex reports may take a little longer.
        </p>
      </div>
    </div>
  )
}
