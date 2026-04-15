'use client'

import { useState, useEffect, useRef } from 'react'
import { api } from '@/lib/api'

const TIMER_SECONDS = 30

// Parse pipe-separated subtitle into rows
function parseSubtitle(subtitle) {
  if (!subtitle) return []
  return subtitle.split('|').map(s => s.trim()).filter(Boolean)
}

function Timer({ seconds, total }) {
  const pct = (seconds / total) * 100
  const urgent = seconds <= 10
  return (
    <div style={{
      background: urgent ? 'rgba(239, 68, 68, 0.1)' : 'rgba(0, 173, 239, 0.1)',
      border: `1px solid ${urgent ? 'rgba(239, 68, 68, 0.3)' : 'rgba(0, 173, 239, 0.3)'}`,
      backdropFilter: 'blur(8px)',
      borderRadius: 12,
      padding: '8px 16px',
      fontFamily: "var(--font-outfit), sans-serif",
      fontSize: 16, fontWeight: 800,
      color: urgent ? '#F87171' : '#00ADEF',
      letterSpacing: '0.02em',
      minWidth: 80, textAlign: 'center',
      boxShadow: urgent ? '0 0 20px rgba(239, 68, 68, 0.15)' : 'none',
      transition: 'all 0.3s'
    }}>
      {String(Math.floor(seconds / 60)).padStart(2, '0')}:{String(seconds % 60).padStart(2, '0')}
    </div>
  )
}

function OptionCard({ option, selected, onSelect, index }) {
  const rows = parseSubtitle(option.subtitle)
  const isSelected = selected === option.optionId
  return (
    <button
      onClick={() => onSelect(option.optionId)}
      style={{
        background: isSelected ? 'rgba(0, 173, 239, 0.05)' : '#fff',
        border: `2px solid ${isSelected ? '#00ADEF' : '#E2E8F0'}`,
        borderRadius: 20,
        padding: '24px',
        textAlign: 'left',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        boxShadow: isSelected ? '0 20px 25px -5px rgba(0, 173, 239, 0.1), 0 10px 10px -5px rgba(0, 173, 239, 0.04)' : '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
        animation: `mythFadeUp 0.5s ease both`,
        animationDelay: `${index * 0.1}s`,
        transform: isSelected ? 'scale(1.02)' : 'scale(1)',
        overflow: 'hidden'
      }}
    >
      {isSelected && (
        <div style={{
          position: 'absolute', top: 0, right: 0,
          background: '#00ADEF',
          padding: '8px 16px',
          borderBottomLeftRadius: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, color: '#fff', fontWeight: 900,
          boxShadow: '-2px 2px 10px rgba(0, 173, 239, 0.2)'
        }}>SELECTED</div>
      )}
      <div style={{
        fontFamily: "var(--font-outfit), sans-serif",
        fontSize: 11, fontWeight: 800,
        letterSpacing: '0.15em', color: '#00ADEF',
        textTransform: 'uppercase', marginBottom: 8
      }}>{option.label}</div>
      {option.shortLabel && (
        <div style={{
          fontFamily: "var(--font-outfit), sans-serif",
          fontSize: 20, fontWeight: 800, color: '#003B6E',
          marginBottom: 12, lineHeight: 1.2,
          letterSpacing: '-0.01em'
        }}>{option.shortLabel}</div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {rows.map((row, i) => {
          const [key, ...rest] = row.split(':')
          const val = rest.join(':').trim()
          return (
            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{
                fontFamily: "var(--font-outfit), sans-serif",
                fontSize: 12, color: '#64748B',
                minWidth: 0, flexShrink: 0,
                whiteSpace: 'nowrap', fontWeight: 500
              }}>{key}:</span>
              <span style={{
                fontFamily: "var(--font-outfit), sans-serif",
                fontSize: 12, color: '#003B6E', fontWeight: 700
              }}>{val}</span>
            </div>
          )
        })}
      </div>
    </button>
  )
}

function RevealScreen({ question, playerOptionId, onNext, onSkipToResults, isLast, questionIndex, totalQuestions }) {
  const playerOpt = question.options.find(o => o.optionId === playerOptionId)
  const aiOpt = question.options.find(o => o.isCorrect)
  const matched = playerOptionId && playerOpt?.isCorrect

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: matched ? '#F0FDF4' : '#FFF7ED', fontFamily: "var(--font-outfit), sans-serif" }}>
      <style>{`
        @keyframes mythPop { 0% { opacity:0; transform: scale(0.9); } 60% { transform: scale(1.05); } 100% { opacity:1; transform: scale(1); } }
        @keyframes mythFadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* Top bar */}
      <div style={{ background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #E2E8F0', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', sticky: 'top', zIndex: 10 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.2em', color: '#00ADEF', textTransform: 'uppercase' }}>
            BEAT THE AI · VERDICT
          </div>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#003B6E', marginTop: 2 }}>
            Scenario {questionIndex + 1} <span style={{ color: '#E2E8F0', margin: '0 8px' }}>|</span> {question.scenarioTitle || question.text.slice(0, 32)}
          </div>
        </div>
        {question.sectionLabel && (
          <div style={{ background: 'rgba(0, 173, 239, 0.1)', border: '1px solid rgba(0, 173, 239, 0.2)', borderRadius: 8, padding: '6px 14px', fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', color: '#00ADEF', textTransform: 'uppercase' }}>
            {question.sectionLabel}
          </div>
        )}
      </div>

      <div style={{ flex: 1, padding: '40px 24px', maxWidth: 800, margin: '0 auto', width: '100%' }}>

        {/* Verdict Badge */}
        <div style={{ textAlign: 'center', marginBottom: 48, animation: 'mythPop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both' }}>
          <div style={{
            display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 12,
            background: matched ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.08)',
            border: `1.5px solid ${matched ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.15)'}`,
            borderRadius: 32, padding: '32px 48px',
            boxShadow: matched ? '0 20px 40px -10px rgba(34, 197, 94, 0.2)' : '0 20px 40px -10px rgba(239, 68, 68, 0.15)'
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: matched ? '#22C55E' : '#EF4444',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 32, color: '#fff', fontWeight: 900,
              marginBottom: 8,
              boxShadow: '0 10px 20px -5px rgba(0,0,0,0.2)'
            }}>{matched ? '✓' : '✗'}</div>
            <span style={{ fontSize: 24, fontWeight: 900, letterSpacing: '-0.02em', color: matched ? '#166534' : '#991B1B' }}>
              {matched ? 'Perfect Match!' : 'AI Analysis Differs'}
            </span>
            <p style={{ fontSize: 14, color: matched ? '#166534' : '#991B1B', opacity: 0.8, margin: 0, fontWeight: 500 }}>
              {matched ? "You're thinking exactly like our expert AI." : "The AI identified a more optimal path for this session."}
            </p>
          </div>
        </div>

        {/* Choice comparison */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, marginBottom: 24, animation: 'mythFadeUp 0.5s ease 0.2s both' }}>
          {/* Player */}
          <div style={{
            background: '#fff',
            border: `2px solid ${matched ? '#22C55E' : '#E2E8F0'}`,
            borderRadius: 24, padding: '24px',
            boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)'
          }}>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.15em', color: '#94A3B8', textTransform: 'uppercase', marginBottom: 12 }}>Your Decision</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: matched ? '#166534' : '#64748B', lineHeight: 1.4 }}>
              {playerOpt ? playerOpt.label : 'No response provided'}
            </div>
            {playerOpt?.shortLabel && (
              <div style={{ fontSize: 20, fontWeight: 900, color: '#003B6E', marginTop: 8 }}>{playerOpt.shortLabel}</div>
            )}
          </div>

          {/* AI */}
          <div style={{
            background: '#fff',
            border: '2px solid #00ADEF',
            borderRadius: 24, padding: '24px',
            boxShadow: '0 15px 35px -10px rgba(0, 173, 239, 0.15)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', top: 0, right: 0, background: '#00ADEF', color: '#fff', fontSize: 9, fontWeight: 900, padding: '6px 16px', borderBottomLeftRadius: 16 }}>AI PREFERENCE</div>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.15em', color: '#00ADEF', textTransform: 'uppercase', marginBottom: 12 }}>SalesVerse Choice</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#00ADEF', lineHeight: 1.4 }}>
              {aiOpt ? aiOpt.label : '—'}
            </div>
            {aiOpt?.shortLabel && (
              <div style={{ fontSize: 20, fontWeight: 900, color: '#003B6E', marginTop: 8 }}>{aiOpt.shortLabel}</div>
            )}
          </div>
        </div>

        {/* AI insight */}
        {question.aiRationale && (
          <div style={{
            background: 'linear-gradient(135deg, #003B6E 0%, #001A33 100%)',
            borderRadius: 24, padding: '32px', marginBottom: 32,
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 20px 50px -15px rgba(0, 59, 110, 0.4)',
            animation: 'mythFadeUp 0.5s ease 0.3s both'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(0, 173, 239, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 16 }}>💡</span>
              </div>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.15em', color: '#00ADEF', textTransform: 'uppercase' }}>
                Strategy Insight
              </div>
            </div>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.9)', lineHeight: 1.7, margin: 0, fontWeight: 400 }}>
              {question.aiRationale}
            </p>
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: 'grid', gridTemplateColumns: isLast ? '1fr' : '1fr 1fr', gap: 16, animation: 'mythFadeUp 0.5s ease 0.4s both' }}>
          {isLast ? (
            <button onClick={onNext} style={{
              padding: '20px', borderRadius: 16, border: 'none',
              background: 'linear-gradient(135deg, #00ADEF 0%, #003B6E 100%)',
              fontFamily: "var(--font-outfit), sans-serif", fontSize: 16, fontWeight: 800,
              letterSpacing: '0.1em', color: '#fff', cursor: 'pointer',
              boxShadow: '0 15px 35px -10px rgba(0, 173, 239, 0.4)',
              transition: 'all 0.3s'
            }}>COMPLETE CHALLENGE →</button>
          ) : (
            <>
              <button onClick={onNext} style={{
                padding: '18px', borderRadius: 16, border: '2px solid #E2E8F0',
                background: '#fff', fontFamily: "var(--font-outfit), sans-serif",
                fontSize: 14, fontWeight: 800, letterSpacing: '0.05em', color: '#003B6E', cursor: 'pointer',
                transition: 'all 0.3s'
              }}>NEXT SCENARIO →</button>
              <button onClick={onSkipToResults} style={{
                padding: '18px', borderRadius: 16, border: 'none',
                background: 'linear-gradient(135deg, #00ADEF 00%, #003B6E 100%)',
                fontFamily: "var(--font-outfit), sans-serif", fontSize: 14, fontWeight: 800,
                letterSpacing: '0.05em', color: '#fff', cursor: 'pointer',
                boxShadow: '0 10px 25px -5px rgba(0, 173, 239, 0.3)',
                transition: 'all 0.3s'
              }}>FINISH & SEE RESULTS</button>
            </>
          )}
        </div>

      </div>
    </div>
  )
}

function PreviewOptionCard({ option }) {
  const rows = parseSubtitle(option.subtitle)
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #E2E8F0',
      borderRadius: 12, padding: '14px 16px',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      flex: 1, minWidth: 0
    }}>
      <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.18em', color: '#00ADEF', textTransform: 'uppercase', marginBottom: 5 }}>
        {option.label}
      </div>
      {option.shortLabel && (
        <div style={{ fontSize: 14, fontWeight: 800, color: '#003B6E', marginBottom: 8, lineHeight: 1.2 }}>
          {option.shortLabel}
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {rows.map((row, i) => {
          const colonIdx = row.indexOf(':')
          const key = colonIdx > -1 ? row.slice(0, colonIdx) : row
          const val = colonIdx > -1 ? row.slice(colonIdx + 1).trim() : ''
          return (
            <div key={i} style={{ display: 'flex', gap: 5 }}>
              <span style={{ fontSize: 10, color: '#64748B', whiteSpace: 'nowrap', lineHeight: 1.5 }}>{key}:</span>
              <span style={{ fontSize: 10, color: '#003B6E', fontWeight: 600, lineHeight: 1.5 }}>{val}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function PreviewScreen({ questions, onBack, onStartFrom }) {
  const [expandedIdx, setExpandedIdx] = useState(null)

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'radial-gradient(circle at top right, #F0F9FF 0%, #E0F2FE 100%)', fontFamily: "var(--font-outfit), sans-serif" }}>
      <style>{`
        @keyframes mythFadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        .preview-row:hover { background: #f8fafc !important; transform: translateX(4px); }
        .preview-card { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
      `}</style>

      {/* Header */}
      <div style={{ background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(16px)', borderBottom: '1px solid #E2E8F0', padding: '24px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', sticky: 'top', zIndex: 10 }}>
        <div>
          <button
            onClick={onBack}
            style={{
              background: 'rgba(0, 173, 239, 0.05)', border: '1px solid rgba(0, 173, 239, 0.1)',
              color: '#00ADEF', cursor: 'pointer', fontFamily: "var(--font-outfit), sans-serif",
              fontSize: 12, fontWeight: 800, letterSpacing: '0.1em', marginBottom: 8,
              padding: '6px 16px', borderRadius: 8, transition: 'all 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,173,239,0.1)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,173,239,0.05)'}
          >← BACK TO LOBBY</button>
          <div style={{ fontSize: 24, fontWeight: 900, color: '#003B6E', letterSpacing: '-0.02em' }}>Scenario Explorer</div>
        </div>
        <div style={{
          fontSize: 14, fontWeight: 800, letterSpacing: '0.1em',
          color: '#64748B', textTransform: 'uppercase',
          background: '#fff', padding: '8px 20px', borderRadius: 12, border: '1px solid #E2E8F0'
        }}>{questions.length} TOTAL SCENARIOS</div>
      </div>

      {/* Scenario list */}
      <div style={{ flex: 1, overflow: 'auto', padding: '32px 24px 60px', maxWidth: 900, margin: '0 auto', width: '100%' }}>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {questions.map((q, i) => {
            const isOpen = expandedIdx === i
            return (
              <div key={i} className="preview-card" style={{
                borderRadius: 24, overflow: 'hidden',
                border: isOpen ? '2px solid #00ADEF' : '1px solid #E2E8F0',
                background: '#fff',
                boxShadow: isOpen ? '0 20px 40px -10px rgba(0, 173, 239, 0.15)' : '0 4px 6px -1px rgba(0,0,0,0.02)'
              }}>
                {/* Row header */}
                <button
                  className="preview-row"
                  onClick={() => setExpandedIdx(isOpen ? null : i)}
                  style={{
                    width: '100%', background: isOpen ? 'linear-gradient(to right, #F0F9FF, #fff)' : '#fff',
                    border: 'none', cursor: 'pointer',
                    padding: '24px 28px',
                    display: 'flex', alignItems: 'center', gap: 20,
                    textAlign: 'left', transition: 'all 0.3s'
                  }}
                >
                  <div style={{
                    width: 44, height: 44, borderRadius: 16, flexShrink: 0,
                    background: isOpen ? '#00ADEF' : '#F1F5F9',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: "var(--font-outfit), sans-serif",
                    fontSize: 18, fontWeight: 900,
                    color: isOpen ? '#fff' : '#003B6E',
                    boxShadow: isOpen ? '0 10px 15px -3px rgba(0, 173, 239, 0.3)' : 'none',
                    transition: 'all 0.3s'
                  }}>{i + 1}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.15em', color: isOpen ? '#00ADEF' : '#94A3B8', textTransform: 'uppercase', marginBottom: 4 }}>
                      {q.sectionLabel || 'Sales Strategy Scenario'}
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#003B6E', lineHeight: 1.2, letterSpacing: '-0.01em' }}>
                      {q.scenarioTitle || `Scenario ${i + 1}`}
                    </div>
                  </div>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', background: isOpen ? 'rgba(0,173,239,0.1)' : '#F8FAFC',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, color: isOpen ? '#00ADEF' : '#CBD5E1',
                    transition: 'all 0.3s',
                    transform: isOpen ? 'rotate(180deg)' : 'none'
                  }}>
                    ▼
                  </div>
                </button>

                {/* Expanded content */}
                {isOpen && (
                  <div style={{ padding: '0 28px 28px', background: '#fff' }}>
                    <div style={{ height: 1, background: '#F1F5F9', marginBottom: 24 }} />

                    <div style={{ marginBottom: 24 }}>
                      <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.15em', color: '#94A3B8', textTransform: 'uppercase', marginBottom: 12 }}>Case Context</div>
                      <p style={{ fontSize: 18, fontWeight: 600, color: '#003B6E', margin: 0, lineHeight: 1.6 }}>
                        {q.text}
                      </p>
                    </div>

                    {/* Options */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12, marginBottom: 32 }}>
                      {q.options.map((opt, oi) => (
                        <div key={oi} style={{ background: '#F8FAFC', borderRadius: 16, padding: '16px 20px', border: '1px solid #F1F5F9' }}>
                          <div style={{ fontSize: 10, fontWeight: 800, color: '#00ADEF', textTransform: 'uppercase', marginBottom: 4 }}>Option {String.fromCharCode(65 + oi)}</div>
                          <div style={{ fontSize: 15, fontWeight: 800, color: '#003B6E', marginBottom: 4 }}>{opt.shortLabel}</div>
                          <div style={{ fontSize: 13, color: '#64748B' }}>{opt.label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Start from here CTA */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => onStartFrom(i)}
                        style={{
                          background: 'linear-gradient(135deg, #00ADEF 0%, #003B6E 100%)',
                          border: 'none', borderRadius: 14,
                          padding: '14px 28px',
                          fontFamily: "var(--font-outfit), sans-serif",
                          fontSize: 13, fontWeight: 800, letterSpacing: '0.05em',
                          color: '#fff', cursor: 'pointer',
                          boxShadow: '0 10px 20px -5px rgba(0, 173, 239, 0.3)',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                      >START FROM THIS SCENARIO →</button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <div style={{ marginTop: 48, display: 'flex', gap: 16 }}>
          <button
            onClick={onBack}
            style={{
              flex: 1, padding: '20px', borderRadius: 18,
              border: '2px solid #E2E8F0',
              background: '#fff',
              fontFamily: "var(--font-outfit), sans-serif",
              fontSize: 14, fontWeight: 800, letterSpacing: '0.1em',
              color: '#64748B', cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >CANCEL</button>
          <button
            onClick={() => onStartFrom(0)}
            style={{
              flex: 2, padding: '20px', borderRadius: 18,
              background: 'linear-gradient(135deg, #00ADEF 0%, #003B6E 100%)',
              border: 'none',
              fontFamily: "var(--font-outfit), sans-serif",
              fontSize: 15, fontWeight: 900, letterSpacing: '0.1em',
              color: '#fff', cursor: 'pointer',
              boxShadow: '0 15px 35px -10px rgba(0, 173, 239, 0.4)',
              transition: 'all 0.2s'
            }}
          >START FULL CHALLENGE →</button>
        </div>

      </div>

      <div style={{ height: 6, background: 'linear-gradient(90deg, #00ADEF, #7BC242)' }} />
    </div>
  )
}

function StatPill({ value, label, color, icon }) {
  return (
    <div style={{
      textAlign: 'center',
      background: 'rgba(255, 255, 255, 0.03)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: 24,
      padding: '20px 32px',
      minWidth: 160,
      boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
    }}>
      <div style={{ fontFamily: "var(--font-outfit), sans-serif", fontSize: 32, fontWeight: 900, color, lineHeight: 1, letterSpacing: '-0.02em', marginBottom: 8 }}>{value}</div>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', color: 'rgba(255, 255, 255, 0.5)', textTransform: 'uppercase' }}>{label}</div>
    </div>
  )
}

export function MythGame({ questions, onSubmit, submitting, eventId }) {
  const [step, setStep] = useState('intro') // intro | preview | question | reveal
  const [currentIdx, setCurrentIdx] = useState(0)
  const [startFromIdx, setStartFromIdx] = useState(0) // which scenario pill is selected
  const [answers, setAnswers] = useState({})
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS)
  const [stats, setStats] = useState(null)
  const timerRef = useRef(null)

  useEffect(() => {
    if (!eventId || step !== 'reveal') return
    api.getStats(eventId).then(data => {
      const myth = data.games.find(g => g.gameType === 'MYTH')
      const matchedPct = myth?.aiMatchPercent ?? 0
      setStats({
        totalPlayers: data.totalPlayers,
        matchedPct,
        surprisedPct: 100 - matchedPct
      })
    }).catch(() => { })
  }, [step, currentIdx])

  // Timer management
  useEffect(() => {
    if (step !== 'question') return
    setTimeLeft(TIMER_SECONDS)
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current)
          setStep('reveal') // auto-advance on timeout
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [step, currentIdx])

  const q = questions[currentIdx]
  const selected = q ? (answers[q.questionId] ?? null) : null
  const isLast = currentIdx === questions.length - 1

  function handleSelect(optionId) {
    setAnswers(prev => ({ ...prev, [q.questionId]: optionId }))
  }

  function handleLockIn() {
    if (!selected) return
    clearInterval(timerRef.current)
    setStep('reveal')
  }

  function buildPayload() {
    // Only submit questions the player actually answered (not timed-out/skipped)
    const played = questions.slice(startFromIdx)
    return played
      .filter(q => answers[q.questionId])
      .map(q => ({ questionId: q.questionId, selectedOptionId: answers[q.questionId] }))
  }

  function handleNext() {
    if (isLast) {
      onSubmit(buildPayload())
    } else {
      setCurrentIdx(i => i + 1)
      setStep('question')
    }
  }

  function handleSkipToResults() {
    onSubmit(buildPayload())
  }

  // ── INTRO SCREEN ─────────────────────────────────────────────────────────
  if (step === 'intro') {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'radial-gradient(circle at top right, #003B6E 0%, #001A33 100%)',
        fontFamily: "var(--font-outfit), sans-serif",
        color: '#fff',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Animated background glows */}
        <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '40%', height: '40%', background: 'radial-gradient(circle, rgba(0, 173, 239, 0.15) 0%, transparent 70%)', filter: 'blur(60px)', zIndex: 0 }} />
        <div style={{ position: 'absolute', bottom: '-5%', left: '-5%', width: '30%', height: '30%', background: 'radial-gradient(circle, rgba(123, 194, 66, 0.1) 0%, transparent 70%)', filter: 'blur(50px)', zIndex: 0 }} />

        <style>{`
          @keyframes mythFadeUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes glowPulse { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } }
          .myth-pill:hover { background: rgba(255, 255, 255, 0.1) !important; transform: translateY(-2px); }
          .start-btn:hover { transform: scale(1.03) translateY(-2px); box-shadow: 0 20px 40px rgba(0, 173, 239, 0.4); }
          .start-btn:active { transform: scale(0.98); }
        `}</style>

        {/* Brand Bar */}
        <div style={{ height: 6, background: 'linear-gradient(90deg, #00ADEF, #7BC242, #00ADEF)', backgroundSize: '200% auto', animation: 'glowPulse 3s infinite linear' }} />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 24px', textAlign: 'center', zIndex: 1, position: 'relative' }}>

          {/* Brand line */}
          <div style={{
            fontSize: 12, fontWeight: 800, letterSpacing: '0.4em', color: '#00ADEF',
            textTransform: 'uppercase', marginBottom: 40, animation: 'mythFadeUp 0.6s ease both'
          }}>
            IORTA TECHNXT <span style={{ color: 'rgba(255,255,255,0.2)', margin: '0 12px' }}>·</span> SALESVERSE 2026
          </div>

          {/* Hero headline */}
          <div style={{ animation: 'mythFadeUp 0.6s ease 0.1s both', marginBottom: 32 }}>
            <h1 style={{
              fontSize: 'clamp(48px, 12vw, 80px)', fontWeight: 900, lineHeight: 0.9,
              letterSpacing: '-0.04em', margin: 0, textTransform: 'uppercase'
            }}>
              CAN YOU<br />
              <span style={{
                background: 'linear-gradient(to right, #00ADEF, #7BC242)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'inline-block',
                marginTop: 8
              }}>OUTSMART AI?</span>
            </h1>
          </div>

          {/* Description Card */}
          <div style={{
            animation: 'mythFadeUp 0.6s ease 0.2s both',
            marginBottom: 48,
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 20,
            padding: '24px 40px',
            maxWidth: 600
          }}>
            <p style={{ fontSize: 20, color: 'rgba(255, 255, 255, 0.9)', margin: '0 0 12px', fontWeight: 500, lineHeight: 1.4 }}>
              Test your strategy in the 30-second sales challenge.
            </p>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 12,
              fontSize: 12, fontWeight: 800, letterSpacing: '0.2em', color: '#7BC242', textTransform: 'uppercase'
            }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#7BC242', boxShadow: '0 0 10px #7BC242' }} />
              {questions.length} SCENARIOS · NEW CHALLENGE EVERY ROUND
            </div>
          </div>

          {/* Scenario Selection Grid */}
          <div style={{
            display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10,
            maxWidth: 800, margin: '0 auto 56px', animation: 'mythFadeUp 0.6s ease 0.3s both'
          }}>
            {questions.map((q, i) => {
              const isActive = i === startFromIdx
              return (
                <button
                  key={i}
                  onClick={() => setStartFromIdx(i)}
                  className="myth-pill"
                  style={{
                    background: isActive ? '#00ADEF' : 'rgba(255, 255, 255, 0.05)',
                    border: isActive ? '1px solid #00ADEF' : '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 16,
                    padding: '10px 18px',
                    fontSize: 13, fontWeight: 700,
                    color: isActive ? '#fff' : 'rgba(255, 255, 255, 0.6)',
                    boxShadow: isActive ? '0 10px 20px rgba(0, 173, 239, 0.3)' : 'none',
                    transition: 'all 0.3s',
                    cursor: 'pointer',
                    fontFamily: "var(--font-outfit), sans-serif",
                    display: 'flex', alignItems: 'center', gap: 10
                  }}
                >
                  <span style={{ opacity: isActive ? 1 : 0.4 }}>{String(i + 1).padStart(2, '0')}</span>
                  {q.scenarioTitle || `Scenario ${i + 1}`}
                </button>
              )
            })}
          </div>

          {/* Primary Action */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, animation: 'mythFadeUp 0.6s ease 0.4s both' }}>
            <button
              onClick={() => { setCurrentIdx(startFromIdx); setStep('question') }}
              className="start-btn"
              style={{
                background: 'linear-gradient(135deg, #00ADEF 0%, #003B6E 100%)',
                border: 'none', borderRadius: 20,
                padding: '24px 80px',
                fontFamily: "var(--font-outfit), sans-serif",
                fontSize: 18, fontWeight: 900,
                letterSpacing: '0.1em', color: '#fff',
                cursor: 'pointer',
                boxShadow: '0 20px 40px rgba(0, 173, 239, 0.3)',
                transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                minWidth: 320,
                textTransform: 'uppercase'
              }}
            >
              {startFromIdx === 0 ? 'Initialize Challenge' : `Start from Scenario ${startFromIdx + 1}`}
            </button>

            <button
              onClick={() => setStep('preview')}
              style={{
                background: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: 20, padding: '16px 40px',
                fontFamily: "var(--font-outfit), sans-serif",
                fontSize: 14, fontWeight: 700,
                letterSpacing: '0.1em', color: 'rgba(255, 255, 255, 0.8)',
                cursor: 'pointer', transition: 'all 0.3s', minWidth: 240,
                backdropFilter: 'blur(10px)'
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#00ADEF'; e.currentTarget.style.color = '#fff' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'; e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)' }}
            >EXPLORE ALL SCENARIOS</button>
          </div>
        </div>

        {/* Global Insights Section */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.2)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '40px 20px',
          display: 'flex',
          justifyContent: 'center',
          gap: 32,
          flexWrap: 'wrap'
        }}>
          <StatPill value={stats?.totalPlayers ?? '0'} label="Simulations Run" color="#fff" />
          <StatPill value={stats ? `${stats.matchedPct}%` : '0%'} label="AI Alignment" color="#7BC242" />
          <StatPill value={stats ? `${stats.surprisedPct}%` : '0%'} label="Insights Gained" color="#00ADEF" />
        </div>
      </div>
    )
  }

  // ── PREVIEW SCREEN ────────────────────────────────────────────────────────
  if (step === 'preview') {
    return (
      <PreviewScreen
        questions={questions}
        onBack={() => setStep('intro')}
        onStartFrom={(idx) => {
          setStartFromIdx(idx)
          setCurrentIdx(idx)
          setStep('question')
        }}
      />
    )
  }

  // ── REVEAL SCREEN ─────────────────────────────────────────────────────────
  if (step === 'reveal') {
    return (
      <RevealScreen
        question={q}
        playerOptionId={selected}
        onNext={handleNext}
        onSkipToResults={handleSkipToResults}
        isLast={isLast}
        questionIndex={currentIdx}
        totalQuestions={questions.length}
      />
    )
  }

  // ── QUESTION SCREEN ────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'radial-gradient(circle at top right, #F0F9FF 0%, #E0F2FE 100%)', fontFamily: "var(--font-outfit), sans-serif" }}>
      <style>{`
        @keyframes mythFadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes progressAnimation { from { width: 0%; } to { width: 100%; } }
      `}</style>

      {/* Progress bar */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 4, background: 'rgba(0,0,0,0.05)', zIndex: 100 }}>
        <div style={{
          height: '100%',
          background: 'linear-gradient(90deg, #00ADEF, #7BC242)',
          width: `${((currentIdx + 1) / questions.length) * 100}%`,
          transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '0 0 10px rgba(0, 173, 239, 0.5)'
        }} />
      </div>

      {/* Header */}
      <div style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(16px)', borderBottom: '1px solid #E2E8F0', padding: '20px 32px', marginTop: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
              <div style={{ background: '#003B6E', color: '#fff', fontSize: 10, fontWeight: 900, padding: '4px 12px', borderRadius: 20, letterSpacing: '0.1em' }}>
                SCENARIO {currentIdx + 1} / {questions.length}
              </div>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.2em', color: '#00ADEF', textTransform: 'uppercase' }}>
                SALESVERSE STRATEGY ENGINE
              </div>
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#003B6E', letterSpacing: '-0.01em' }}>
              {q?.scenarioTitle || 'Customer Interaction'}
            </div>
          </div>
          <Timer seconds={timeLeft} total={TIMER_SECONDS} />
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '48px 24px 140px', maxWidth: 1000, margin: '0 auto', width: '100%' }} key={currentIdx}>

        {/* Scenario Card */}
        <div style={{
          background: '#fff',
          borderRadius: 32,
          padding: '40px',
          marginBottom: 32,
          boxShadow: '0 20px 50px -15px rgba(0, 59, 110, 0.08)',
          animation: 'mythFadeUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) both',
          border: '1px solid rgba(0, 59, 110, 0.05)'
        }}>
          <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(0,173,239,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: 24 }}>💬</span>
            </div>
            <div>
              <p style={{ fontSize: 22, fontWeight: 700, color: '#003B6E', margin: '0 0 16px', lineHeight: 1.4 }}>
                {q?.text}
              </p>
              {q?.sectionLabel && (
                <div style={{
                  display: 'inline-flex',
                  background: 'rgba(123, 194, 66, 0.1)',
                  padding: '6px 16px', borderRadius: 8,
                  fontSize: 11, fontWeight: 800, letterSpacing: '0.1em',
                  color: '#7BC242', textTransform: 'uppercase'
                }}>Target Outcome: {q.sectionLabel}</div>
              )}
            </div>
          </div>
        </div>

        {/* Option cards grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 20,
          marginBottom: 32,
          animation: 'mythFadeUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) 0.1s both'
        }}>
          {q?.options.map((opt, i) => (
            <OptionCard key={opt.optionId} option={opt} selected={selected} onSelect={handleSelect} index={i} />
          ))}
        </div>
      </div>

      {/* Floating Action Menu */}
      <div style={{
        position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)',
        width: 'calc(100% - 48px)', maxWidth: 600,
        background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        borderRadius: 24, padding: '16px',
        boxShadow: '0 30px 60px -12px rgba(0, 59, 110, 0.25)',
        zIndex: 1000,
        animation: 'mythFadeUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) 0.2s both'
      }}>
        <button
          onClick={handleLockIn}
          disabled={!selected || submitting}
          style={{
            width: '100%', padding: '20px',
            borderRadius: 16, border: 'none',
            background: selected ? 'linear-gradient(135deg, #00ADEF 0%, #003B6E 100%)' : '#F1F5F9',
            color: selected ? '#fff' : '#94A3B8',
            fontFamily: "var(--font-outfit), sans-serif",
            fontSize: 16, fontWeight: 900, letterSpacing: '0.1em',
            cursor: selected ? 'pointer' : 'not-allowed',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: selected ? '0 10px 20px -5px rgba(0, 173, 239, 0.4)' : 'none',
            textTransform: 'uppercase'
          }}
        >
          {submitting ? 'VALIDATING...' : (selected ? 'CONFIRM DECISION →' : 'SELECT AN OPTION')}
        </button>
      </div>

      {/* Brand accent */}
      <div style={{ height: 4, background: 'linear-gradient(90deg, #00ADEF, #7BC242)', position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1001 }} />
    </div>
  )
}
