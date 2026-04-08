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
      background: urgent ? 'rgba(239,68,68,0.08)' : 'rgba(0,173,239,0.08)',
      border: `1px solid ${urgent ? 'rgba(239,68,68,0.2)' : 'rgba(0,173,239,0.2)'}`,
      borderRadius: 8,
      padding: '6px 14px',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      fontSize: 15, fontWeight: 900,
      color: urgent ? '#EF4444' : '#00ADEF',
      letterSpacing: '0.05em',
      minWidth: 64, textAlign: 'center'
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
        background: isSelected ? '#F0F9FF' : '#fff',
        border: `2px solid ${isSelected ? '#00ADEF' : '#E2E8F0'}`,
        borderRadius: 14,
        padding: '20px',
        textAlign: 'left',
        cursor: 'pointer',
        transition: 'all 0.2s',
        position: 'relative',
        boxShadow: isSelected ? '0 8px 20px -4px rgba(0, 173, 239, 0.15)' : 'none',
        animation: `mythFadeUp 0.35s ease both`,
        animationDelay: `${index * 0.07}s`
      }}
    >
      {isSelected && (
        <div style={{
          position: 'absolute', top: 12, right: 12,
          width: 22, height: 22, borderRadius: '50%',
          background: '#00ADEF',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, color: '#fff', fontWeight: 900
        }}>✓</div>
      )}
      <div style={{
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontSize: 10, fontWeight: 800,
        letterSpacing: '0.18em', color: '#00ADEF',
        textTransform: 'uppercase', marginBottom: 6
      }}>{option.label}</div>
      {option.shortLabel && (
        <div style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: 16, fontWeight: 800, color: '#003B6E',
          marginBottom: 10, lineHeight: 1.2
        }}>{option.shortLabel}</div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {rows.map((row, i) => {
          const [key, ...rest] = row.split(':')
          const val = rest.join(':').trim()
          return (
            <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
              <span style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 11, color: '#64748B', lineHeight: 1.5,
                minWidth: 0, flexShrink: 0,
                whiteSpace: 'nowrap'
              }}>{key}:</span>
              <span style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 11, color: '#003B6E', lineHeight: 1.5, fontWeight: 600
              }}>{val}</span>
            </div>
          )
        })}
      </div>
    </button>
  )
}

function RevealScreen({ question, playerOptionId, onNext, isLast, stats, questionIndex, totalQuestions }) {
  const playerOpt = question.options.find(o => o.optionId === playerOptionId)
  const aiOpt = question.options.find(o => o.isCorrect)
  const matched = playerOptionId && playerOpt?.isCorrect

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#F0F9FF', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        @keyframes mythFadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* Top bar */}
      <div style={{ background: '#fff', borderBottom: '1px solid #E2E8F0', padding: '16px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.2em', color: '#00ADEF', textTransform: 'uppercase', marginBottom: 2 }}>
              SALESVERSE — AI REVEAL
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#003B6E' }}>
              Scenario {questionIndex + 1} — {question.scenarioTitle || question.text.slice(0, 30)}
            </div>
          </div>
          {question.sectionLabel && (
            <div style={{
              background: 'rgba(0,173,239,0.08)', border: '1px solid rgba(0,173,239,0.12)',
              borderRadius: 6, padding: '4px 10px',
              fontSize: 10, fontWeight: 800, letterSpacing: '0.12em',
              color: '#00ADEF', textTransform: 'uppercase', whiteSpace: 'nowrap'
            }}>{question.sectionLabel}</div>
          )}
        </div>
      </div>

      <div style={{ flex: 1, padding: '24px 20px', maxWidth: 760, margin: '0 auto', width: '100%', overflow: 'auto' }}>

        {/* Choice comparison */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16, animation: 'mythFadeUp 0.4s ease both' }}>
          {/* Player's choice */}
          <div style={{
            background: matched ? 'rgba(16,185,129,0.04)' : '#fff',
            border: `1px solid ${matched ? 'rgba(16,185,129,0.3)' : '#E2E8F0'}`,
            borderRadius: 14, padding: '20px', position: 'relative'
          }}>
            <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.2em', color: '#64748B', textTransform: 'uppercase', marginBottom: 8 }}>
              YOUR CHOICE
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#003B6E', marginBottom: 8, lineHeight: 1.3 }}>
              {playerOpt ? `${playerOpt.label} — ${playerOpt.shortLabel || ''}` : 'No answer given'}
            </div>
            <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.6, margin: 0 }}>
              {playerOpt?.badge || '—'}
            </p>
            {matched && (
              <div style={{
                marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'rgba(16,185,129,0.1)', borderRadius: 6, padding: '4px 10px'
              }}>
                <span style={{ color: '#10B981', fontSize: 12 }}>✓</span>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#10B981', letterSpacing: '0.1em' }}>MATCHED AI</span>
              </div>
            )}
          </div>

          {/* AI's choice */}
          <div style={{
            background: '#fff',
            border: '1.5px solid #00ADEF',
            borderRadius: 14, padding: '20px'
          }}>
            <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.2em', color: '#00ADEF', textTransform: 'uppercase', marginBottom: 8 }}>
              AI'S CHOICE — SALESVERSE
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#003B6E', marginBottom: 8, lineHeight: 1.3 }}>
              {aiOpt ? `${aiOpt.label} — ${aiOpt.shortLabel || ''}` : '—'}
            </div>
            <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.6, margin: '0 0 8px' }}>
              {aiOpt?.badge || '—'}
            </p>
            {aiOpt?.badge && (
              <p style={{ fontSize: 12, color: '#00ADEF', fontStyle: 'italic', lineHeight: 1.5, margin: 0 }}>
                « {aiOpt.badge.split('.')[0]}. »
              </p>
            )}
          </div>
        </div>

        {/* AI insight highlight */}
        {question.aiRationale && (
          <div style={{
            background: '#fff',
            border: '1px solid #E2E8F0',
            borderLeft: '4px solid #00ADEF',
            borderRadius: 12, padding: '16px 20px', marginBottom: 16,
            animation: 'mythFadeUp 0.4s ease 0.1s both'
          }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#003B6E', lineHeight: 1.65, margin: 0 }}>
              {question.aiRationale}
            </p>
          </div>
        )}

        {/* Host script */}
        {question.aiRationale && (
          <div style={{
            borderLeft: '3px solid rgba(0,173,239,0.4)',
            paddingLeft: 16, marginBottom: 24,
            animation: 'mythFadeUp 0.4s ease 0.15s both'
          }}>
            <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.2em', color: '#00ADEF', textTransform: 'uppercase', marginBottom: 6 }}>
              HOST CLOSING SCRIPT
            </div>
            <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.65, margin: 0 }}>
              "{question.aiRationale} Want to see how it works live?"
            </p>
          </div>
        )}

        {/* Stats row */}
        <div style={{
          display: 'flex', justifyContent: 'center', gap: 40, marginBottom: 24,
          animation: 'mythFadeUp 0.4s ease 0.2s both'
        }}>
          {stats && (
            <>
              <StatPill value={stats.totalPlayers} label="Players Today" color="#003B6E" />
              <StatPill value={`${stats.matchedPct ?? 0}%`} label="Matched AI" color="#10B981" />
              <StatPill value={`${stats.surprisedPct ?? 0}%`} label="Surprised" color="#F87171" />
            </>
          )}
        </div>

        {/* Navigation */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, animation: 'mythFadeUp 0.4s ease 0.25s both' }}>
          {!isLast && (
            <button
              onClick={onNext}
              style={{
                gridColumn: '1 / 2',
                padding: '14px', borderRadius: 10,
                border: '1.5px solid #E2E8F0',
                background: '#fff',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 12, fontWeight: 800, letterSpacing: '0.15em',
                color: '#003B6E', cursor: 'pointer'
              }}
            >NEXT SCENARIO →</button>
          )}
          <button
            onClick={() => window.location.href = '/play'}
            style={{
              padding: '14px', borderRadius: 10,
              border: '1.5px solid #E2E8F0',
              background: '#fff',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 12, fontWeight: 800, letterSpacing: '0.15em',
              color: '#64748B', cursor: 'pointer'
            }}
          >ALL SCENARIOS</button>
          {isLast && (
            <button
              onClick={onNext}
              style={{
                padding: '14px', borderRadius: 10,
                background: 'linear-gradient(135deg, #00ADEF 0%, #003B6E 100%)',
                border: 'none',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 12, fontWeight: 800, letterSpacing: '0.15em',
                color: '#fff', cursor: 'pointer'
              }}
            >SEE MY RESULTS →</button>
          )}
          {!isLast && (
            <button
              onClick={() => window.location.href = '/play'}
              style={{
                padding: '14px', borderRadius: 10,
                background: 'linear-gradient(135deg, #00ADEF 0%, #003B6E 100%)',
                border: 'none',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 12, fontWeight: 800, letterSpacing: '0.15em',
                color: '#fff', cursor: 'pointer'
              }}
            >SEE SALESVERSE LIVE →</button>
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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#F0F9FF', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        @keyframes mythFadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        .preview-row:hover { background: #f8fafc !important; }
      `}</style>

      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #E2E8F0', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <button
            onClick={onBack}
            style={{ background: 'none', border: 'none', color: '#00ADEF', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 12, fontWeight: 800, letterSpacing: '0.1em', marginBottom: 4, padding: 0 }}
          >← BACK TO LOBBY</button>
          <div style={{ fontSize: 20, fontWeight: 900, color: '#003B6E', marginTop: 2 }}>All Scenarios</div>
        </div>
        <div style={{
          fontSize: 11, fontWeight: 800, letterSpacing: '0.15em',
          color: '#64748B', textTransform: 'uppercase'
        }}>{questions.length} SCENARIOS</div>
      </div>

      {/* Scenario list */}
      <div style={{ flex: 1, overflow: 'auto', padding: '16px 20px 32px', maxWidth: 820, margin: '0 auto', width: '100%' }}>

        <p style={{ fontSize: 12, color: '#64748B', marginBottom: 20, lineHeight: 1.6 }}>
          Tap a scenario to preview its options. Use "Start from here" to begin the timed challenge from any scenario.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {questions.map((q, i) => {
            const isOpen = expandedIdx === i
            return (
              <div key={i} style={{ borderRadius: 16, overflow: 'hidden', border: isOpen ? '1px solid #00ADEF' : '1px solid #E2E8F0', background: '#fff', transition: 'border-color 0.2s' }}>
                {/* Row header */}
                <button
                  className="preview-row"
                  onClick={() => setExpandedIdx(isOpen ? null : i)}
                  style={{
                    width: '100%', background: isOpen ? '#F0F9FF' : '#fff',
                    border: 'none', cursor: 'pointer',
                    padding: '16px 20px',
                    display: 'flex', alignItems: 'center', gap: 14,
                    textAlign: 'left', transition: 'background 0.15s'
                  }}
                >
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                    background: isOpen ? '#00ADEF' : '#F1F5F9',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: 12, fontWeight: 900,
                    color: isOpen ? '#fff' : '#003B6E'
                  }}>{i + 1}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.15em', color: isOpen ? '#00ADEF' : '#64748B', textTransform: 'uppercase', marginBottom: 2 }}>
                      {q.sectionLabel || 'SCENARIO'}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#003B6E', lineHeight: 1.3 }}>
                      {q.scenarioTitle || `Scenario ${i + 1}`}
                    </div>
                  </div>
                  <div style={{ fontSize: 16, color: isOpen ? '#00ADEF' : '#CBD5E1', transition: 'transform 0.2s, color 0.2s', transform: isOpen ? 'rotate(180deg)' : 'none' }}>
                    ▾
                  </div>
                </button>

                {/* Expanded content */}
                {isOpen && (
                  <div style={{ padding: '0 20px 20px', borderTop: '1px solid #E2E8F0', background: '#fff' }}>
                    {/* Question text */}
                    <p style={{ fontSize: 15, fontWeight: 600, color: '#003B6E', margin: '16px 0 14px', lineHeight: 1.5 }}>
                      {q.text}
                    </p>

                    {/* Options */}
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                      {q.options.map((opt, oi) => (
                        <PreviewOptionCard key={oi} option={opt} />
                      ))}
                    </div>

                    {/* Start from here CTA */}
                    <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => onStartFrom(i)}
                        style={{
                          background: 'linear-gradient(135deg, #00ADEF 0%, #003B6E 100%)',
                          border: 'none', borderRadius: 10,
                          padding: '10px 20px',
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          fontSize: 11, fontWeight: 900, letterSpacing: '0.15em',
                          color: '#fff', cursor: 'pointer'
                        }}
                      >START FROM SCENARIO {i + 1} →</button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <div style={{ marginTop: 28, display: 'flex', gap: 12 }}>
          <button
            onClick={onBack}
            style={{
              flex: 1, padding: '16px', borderRadius: 12,
              border: '1.5px solid #E2E8F0',
              background: '#fff',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 12, fontWeight: 800, letterSpacing: '0.15em',
              color: '#64748B', cursor: 'pointer'
            }}
          >← BACK TO LOBBY</button>
          <button
            onClick={() => onStartFrom(0)}
            style={{
              flex: 2, padding: '16px', borderRadius: 12,
              background: 'linear-gradient(135deg, #00ADEF 0%, #003B6E 100%)',
              border: 'none',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 13, fontWeight: 900, letterSpacing: '0.18em',
              color: '#fff', cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(0,173,239,0.2)'
            }}
          >I'M READY — START ALL SCENARIOS →</button>
        </div>

      </div>

      <div style={{ height: 4, background: 'linear-gradient(90deg, #06d17f 0%, #C4962A 100%)' }} />
    </div>
  )
}

function StatPill({ value, label, color }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 28, fontWeight: 900, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', color: '#64748B', textTransform: 'uppercase', marginTop: 4 }}>{label}</div>
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
    if (!eventId) return
    api.getStats(eventId).then(data => {
      const myth = data.games.find(g => g.gameType === 'MYTH')
      const matchedPct = myth?.aiMatchPercent ?? 0
      setStats({
        totalPlayers: data.totalPlayers,
        matchedPct,
        surprisedPct: 100 - matchedPct
      })
    }).catch(() => {})
  }, [])

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

  function handleNext() {
    if (isLast) {
      // Submit answers for questions that were actually shown (from startFromIdx to end)
      const played = questions.slice(startFromIdx)
      const payload = played.map(q => ({
        questionId: q.questionId,
        selectedOptionId: answers[q.questionId] || null
      }))
      onSubmit(payload)
    } else {
      setCurrentIdx(i => i + 1)
      setStep('question')
    }
  }

  // ── INTRO SCREEN ─────────────────────────────────────────────────────────
  if (step === 'intro') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#F0F9FF', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
          @keyframes mythFadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
          .myth-pill:hover { border-color: #00ADEF !important; color: #00ADEF !important; }
        `}</style>

        {/* Brand Bar */}
        <div style={{ height: 4, background: 'linear-gradient(90deg, #00ADEF 0%, #003B6E 100%)' }} />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', textAlign: 'center' }}>

          {/* Brand line */}
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.2em', color: '#00ADEF', textTransform: 'uppercase', marginBottom: 32, animation: 'mythFadeUp 0.4s ease both' }}>
            iorta TechNXT · SalesVerse · 2026
          </div>

          {/* Hero headline */}
          <div style={{ animation: 'mythFadeUp 0.4s ease 0.05s both', marginBottom: 8 }}>
            <div style={{ fontSize: 'clamp(52px, 12vw, 88px)', fontWeight: 900, color: '#003B6E', lineHeight: 0.95, letterSpacing: '-0.02em' }}>
              CAN YOU
            </div>
            <div style={{ fontSize: 'clamp(52px, 12vw, 88px)', fontWeight: 900, color: '#00ADEF', lineHeight: 0.95, letterSpacing: '-0.02em' }}>
              OUTSMART AI?
            </div>
          </div>

          {/* Sub */}
          <div style={{ animation: 'mythFadeUp 0.4s ease 0.1s both', marginBottom: 4 }}>
            <p style={{ fontSize: 16, color: '#64748B', margin: '16px 0 4px', fontWeight: 500 }}>
              30-second Takaful sales challenge — powered by SalesVerse
            </p>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.18em', color: '#00ADEF', textTransform: 'uppercase', margin: 0 }}>
              {questions.length} SCENARIOS · NEW CHALLENGE EVERY ROUND
            </p>
          </div>

          {/* Scenario pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8, maxWidth: 680, margin: '28px auto', animation: 'mythFadeUp 0.4s ease 0.15s both' }}>
            {questions.map((q, i) => {
              const isActive = i === startFromIdx
              return (
                <button
                  key={i}
                  onClick={() => setStartFromIdx(i)}
                  style={{
                    border: isActive ? '1.5px solid #00ADEF' : '1px solid #E2E8F0',
                    borderRadius: 20,
                    padding: '6px 14px',
                    fontSize: 12, fontWeight: 700,
                    color: isActive ? '#00ADEF' : '#64748B',
                    background: isActive ? '#fff' : 'transparent',
                    boxShadow: isActive ? '0 4px 12px rgba(0,173,239,0.1)' : 'none',
                    transition: 'all 0.15s',
                    cursor: 'pointer',
                    fontFamily: "'Plus Jakarta Sans', sans-serif"
                  }}
                >{i + 1}. {q.scenarioTitle || `Scenario ${i + 1}`}</button>
              )
            })}
          </div>

          {/* CTAs */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, animation: 'mythFadeUp 0.4s ease 0.2s both' }}>
            <button
              onClick={() => { setCurrentIdx(startFromIdx); setStep('question') }}
              style={{
                background: 'linear-gradient(135deg, #00ADEF 0%, #003B6E 100%)',
                border: 'none', borderRadius: 12,
                padding: '18px 60px',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 15, fontWeight: 900,
                letterSpacing: '0.18em', color: '#fff',
                cursor: 'pointer',
                boxShadow: '0 8px 32px rgba(0,173,239,0.3)',
                transition: 'transform 0.15s', minWidth: 280
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >{startFromIdx === 0 ? 'TAP TO START' : `START FROM SCENARIO ${startFromIdx + 1}`}</button>

            <button
              onClick={() => setStep('preview')}
              style={{
                background: '#fff',
                border: '1px solid #E2E8F0',
                borderRadius: 12, padding: '12px 32px',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 12, fontWeight: 700,
                letterSpacing: '0.15em', color: '#003B6E',
                cursor: 'pointer', transition: 'all 0.15s', minWidth: 280
              }}
            >PREVIEW ALL SCENARIOS</button>
          </div>
        </div>

        {/* Bottom stats */}
        <div style={{ borderTop: '1px solid #E2E8F0', padding: '20px', display: 'flex', justifyContent: 'center', gap: 48, background: '#fff' }}>
          <StatPill value={stats?.totalPlayers ?? '—'} label="Played Today" color="#003B6E" />
          <StatPill value={stats ? `${stats.matchedPct}%` : '—%'} label="Matched AI" color="#10B981" />
          <StatPill value={stats ? `${stats.surprisedPct}%` : '—%'} label="Were Surprised" color="#F87171" />
        </div>

        {/* Brand bottom bar */}
        <div style={{ height: 4, background: 'linear-gradient(90deg, #00ADEF 0%, #003B6E 100%)' }} />
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
        isLast={isLast}
        stats={stats}
        questionIndex={currentIdx}
        totalQuestions={questions.length}
      />
    )
  }

  // ── QUESTION SCREEN ────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#F0F9FF', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        @keyframes mythFadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* Gold top bar */}
      <div style={{ height: 3, background: 'linear-gradient(90deg, #00ADEF 0%, #7BC242 100%)' }} />

      {/* Header */}
      <div style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)', borderBottom: '1px solid #E2E8F0', padding: '14px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.2em', color: '#00ADEF', textTransform: 'uppercase', marginBottom: 2 }}>
              SALESVERSE — BEAT THE AI
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#003B6E', marginBottom: 8 }}>
              Scenario {currentIdx + 1} of {questions.length} — {q?.scenarioTitle || ''}
            </div>
            {q?.sectionLabel && (
              <div style={{
                display: 'inline-block',
                background: 'rgba(0,173,239,0.08)',
                border: '1px solid rgba(0,173,239,0.1)',
                borderRadius: 4, padding: '3px 10px',
                fontSize: 10, fontWeight: 800, letterSpacing: '0.12em',
                color: '#00ADEF', textTransform: 'uppercase'
              }}>{q.sectionLabel}</div>
            )}
          </div>
          <Timer seconds={timeLeft} total={TIMER_SECONDS} />
        </div>
      </div>

      {/* Question */}
      <div style={{ flex: 1, padding: '28px 20px 100px', maxWidth: 860, margin: '0 auto', width: '100%' }} key={currentIdx}>

        <div style={{ textAlign: 'center', marginBottom: 28, animation: 'mythFadeUp 0.35s ease both' }}>
          <p style={{ fontSize: 18, fontWeight: 600, color: '#003B6E', margin: '0 0 6px', lineHeight: 1.5 }}>
            {q?.text.split('.')[0]}.
          </p>
          <p style={{ fontSize: 20, fontWeight: 900, color: '#00ADEF', margin: 0 }}>
            {q?.text.includes('?') ? q.text.split('?')[0].split('.').pop().trim() + '?' : q?.text.split('.').pop().trim()}
          </p>
          {q?.text && (
            <p style={{ fontSize: 12, fontStyle: 'italic', color: '#64748B', margin: '8px 0 0' }}>
              Host: "{q.text}"
            </p>
          )}
        </div>

        {/* Option cards grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 28 }}>
          {q?.options.map((opt, i) => (
            <OptionCard key={opt.optionId} option={opt} selected={selected} onSelect={handleSelect} index={i} />
          ))}
        </div>

      </div>

      {/* Fixed footer */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)',
        borderTop: '1px solid #E2E8F0',
        padding: '14px 20px',
        boxShadow: '0 -4px 10px rgba(0, 59, 110, 0.03)'
      }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <button
            onClick={handleLockIn}
            disabled={!selected || submitting}
            style={{
              width: '100%', padding: '16px',
              borderRadius: 12, border: 'none',
              background: selected ? 'linear-gradient(135deg, #00ADEF 0%, #003B6E 100%)' : '#F1F5F9',
              color: selected ? '#fff' : '#94A3B8',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 14, fontWeight: 900, letterSpacing: '0.18em',
              cursor: selected ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s',
              boxShadow: selected ? '0 8px 25px -5px rgba(0, 173, 239, 0.3)' : 'none'
            }}
          >
            {submitting ? 'PROCESSING...' : 'LOCK IN MY ANSWER'}
          </button>
        </div>
      </div>

      {/* Bottom accent */}
      <div style={{ height: 3, background: 'linear-gradient(90deg, #00ADEF 0%, #7BC242 100%)', position: 'fixed', bottom: 0, left: 0, right: 0 }} />
    </div>
  )
}
