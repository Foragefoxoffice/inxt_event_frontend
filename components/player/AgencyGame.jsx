'use client'

import { useState, useEffect } from 'react'

const AGENCY_TYPES = [
  { id: 'new', label: 'New Agency', description: 'Under 2 years · Finding product-market fit', range: 'Under 10 agents' },
  { id: 'growing', label: 'Growing Agency', description: 'Scaling headcount · Meeting growth challenges', range: '10–30 agents' },
  { id: 'mature', label: 'Mature Agency', description: 'Established book of business · Performance plateauing', range: '30–80 agents' },
  { id: 'enterprise', label: 'Enterprise', description: 'Multi-tier structure · Complex reporting', range: '80+ agents' },
]

const SECTION_PALETTE = {
  'Lead Pipeline & Acquisition': { accent: '#00ADEF', light: '#F0F9FF', label: '#003B6E' },
  'Agent Performance':            { accent: '#7BC242', light: '#F0FBF0', label: '#003B6E' },
  'Customer Lifecycle':           { accent: '#00ADEF', light: '#F0F9FF', label: '#003B6E' },
  'Visibility & Operations':      { accent: '#003B6E', light: '#F0F7FF', label: '#003B6E' },
  'Visibility & Ops':             { accent: '#003B6E', light: '#F0F7FF', label: '#003B6E' },
}

function ProgressBar({ current, total }) {
  const pct = Math.round((current / total) * 100)
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 11, fontWeight: 600, color: '#9CA3AF', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Step {current} of {total}
        </span>
        <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 11, fontWeight: 700, color: '#7BC242' }}>
          {pct}%
        </span>
      </div>
      <div style={{ height: 3, background: '#E2E8F0', borderRadius: 99 }}>
        <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, #00ADEF, #003B6E)', borderRadius: 99, transition: 'width 0.5s cubic-bezier(0.4,0,0.2,1)' }} />
      </div>
    </div>
  )
}

function OptionCard({ option, isSelected, onToggle, index }) {
  const isAI = option.badge === 'AI-POWERED'
  const optId = option.optionId || option._id || option.label

  return (
    <button
      onClick={onToggle}
      style={{
        width: '100%', textAlign: 'left', display: 'flex', alignItems: 'flex-start', gap: 16,
        padding: '20px 24px', borderRadius: 16, border: `1.5px solid ${isSelected ? '#00ADEF' : '#E2E8F0'}`,
        background: isSelected ? '#F0F9FF' : '#FFFFFF',
        boxShadow: isSelected ? '0 8px 20px -4px rgba(0, 173, 239, 0.12)' : '0 1px 3px rgba(0,0,0,0.04)',
        transition: 'all 0.18s ease', cursor: 'pointer', position: 'relative',
        borderLeft: isSelected ? '4px solid #00ADEF' : `4px solid ${isAI ? '#F0F9FF' : 'transparent'}`,
        animationDelay: `${index * 60}ms`,
      }}
      className="agency-option"
    >
      {/* Checkbox */}
      <div style={{
        width: 22, height: 22, borderRadius: 6, border: `2px solid ${isSelected ? '#00ADEF' : '#CBD5E1'}`,
        background: isSelected ? '#00ADEF' : '#fff', flexShrink: 0, marginTop: 2,
        display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s ease'
      }}>
        {isSelected && (
          <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
            <path d="M1 4L4.5 7.5L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 15,
          color: isSelected ? '#002147' : '#1F2937', lineHeight: 1.4, marginBottom: 4
        }}>
          {option.label}
        </div>
        {option.subtitle && (
          <div style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, fontWeight: 400,
            color: isSelected ? '#4B6B8A' : '#9CA3AF', lineHeight: 1.5
          }}>
            {option.subtitle}
          </div>
        )}
      </div>

      {/* AI Badge */}
      {isAI && (
        <div style={{
          flexShrink: 0, marginTop: 2, display: 'flex', alignItems: 'center', gap: 5,
          background: isSelected ? '#7BC242' : '#E0F2FE',
          padding: '4px 10px', borderRadius: 99,
          fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 9, fontWeight: 800,
          color: isSelected ? '#fff' : '#0369A1', letterSpacing: '0.08em', whiteSpace: 'nowrap'
        }}>
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
            <circle cx="4" cy="4" r="3" fill={isSelected ? '#fff' : '#D97706'}/>
            <path d="M4 2v2l1 1" stroke={isSelected ? '#C4962A' : '#fff'} strokeWidth="1" strokeLinecap="round"/>
          </svg>
          AI-POWERED
        </div>
      )}
    </button>
  )
}

export function AgencyGame({ questions = [], onSubmit, submitting, eventId }) {
  const [step, setStep] = useState(0)
  const [profile, setProfile] = useState({ type: '', agentCount: 25 })
  const [answers, setAnswers] = useState({})
  const [animKey, setAnimKey] = useState(0)

  useEffect(() => { setAnswers({}); setStep(0) }, [questions])

  const totalSteps = 1 + (questions?.length || 0)

  function goNext() {
    setAnimKey(k => k + 1)
    if (step < totalSteps - 1) setStep(step + 1)
    else {
      const mappedAnswers = questions.map(q => {
        const qId = q.questionId || q._id
        return { questionId: qId, selectedOptionIds: answers[qId] || [] }
      }).filter(a => a.selectedOptionIds.length > 0)
      onSubmit({ profile, answers: mappedAnswers, isHybridPayload: true, clientTimestamp: new Date().toISOString() })
    }
  }

  function goBack() { setAnimKey(k => k + 1); setStep(s => Math.max(0, s - 1)) }

  function handleToggle(questionId, optionId) {
    if (!questionId) return
    setAnswers(prev => {
      const cur = prev[questionId] || []
      return { ...prev, [questionId]: cur.includes(optionId) ? cur.filter(id => id !== optionId) : [...cur, optionId] }
    })
  }

  const qIdx = step - 1
  const q = step > 0 ? questions[qIdx] : null
  const qId = q?.questionId || q?._id
  const selectedIds = answers[qId] || []
  const sectionPalette = q ? (SECTION_PALETTE[q.sectionLabel] || { accent: '#002147', light: '#F0F4F9', label: '#002147' }) : null

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        .agency-wrap { min-height: 100vh; background: #F7F6F2; display: flex; flex-direction: column; }
        .agency-topbar { background: #fff; border-bottom: 1px solid #EBEBEB; padding: 16px 32px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 10; }
        .agency-content { flex: 1; display: flex; flex-direction: column; padding: 40px 24px 120px; }
        .agency-card { background: #fff; border-radius: 24px; box-shadow: 0 1px 4px rgba(0,0,0,0.05), 0 8px 32px rgba(0,0,0,0.04); padding: 48px; max-width: 720px; width: 100%; margin: 0 auto; animation: agencyFadeUp 0.35s ease forwards; }
        .agency-footer { position: fixed; bottom: 0; left: 0; right: 0; background: #fff; border-top: 1px solid #F0F0F0; padding: 20px 24px; }
        .agency-footer-inner { max-width: 720px; margin: 0 auto; display: flex; gap: 12px; }
        .agency-option:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.08) !important; }
        @keyframes agencyFadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .type-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.08); }
        input.agency-input { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 15px; color: #1F2937; background: #FAFAFA; border: 1.5px solid #E5E7EB; border-radius: 12px; padding: 14px 18px; outline: none; transition: border-color 0.15s; }
        input.agency-input:focus { border-color: #002147; background: #fff; }
        input.agency-input::placeholder { color: #9CA3AF; }
        input[type=range].agency-slider { -webkit-appearance: none; appearance: none; width: 100%; height: 4px; border-radius: 99px; background: linear-gradient(to right, #002147 0%, #002147 var(--val), #E5E7EB var(--val), #E5E7EB 100%); outline: none; }
        input[type=range].agency-slider::-webkit-slider-thumb { -webkit-appearance: none; width: 22px; height: 22px; border-radius: 50%; background: #002147; border: 3px solid #fff; box-shadow: 0 2px 8px rgba(0,33,71,0.3); cursor: pointer; }
      `}</style>

      <div className="agency-wrap">

        {/* Top Bar */}
        <div className="agency-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#7BC242' }} />
            <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 12, fontWeight: 800, color: '#003B6E', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              Agency Diagnostic
            </span>
          </div>

          {step > 0 && (
            <div style={{ display: 'flex', gap: 6 }}>
              {questions.map((_, i) => (
                <div key={i} style={{
                  width: i < qIdx ? 20 : 8, height: 8, borderRadius: 99,
                  background: i < qIdx ? '#003B6E' : i === qIdx ? '#7BC242' : '#E5E7EB',
                  transition: 'all 0.3s ease'
                }} />
              ))}
            </div>
          )}

          <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 12, fontWeight: 600, color: '#9CA3AF' }}>
            {step === 0 ? 'Profile Setup' : `Q ${qIdx + 1} of ${questions.length}`}
          </span>
        </div>

        {/* Content */}
        <div className="agency-content">

          {/* ── Step 0: Profile ── */}
          {step === 0 && (
            <div key={`step-${animKey}`} className="agency-card">

              <div style={{ marginBottom: 32 }}>
                <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 11, fontWeight: 800, color: '#C4962A', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 12 }}>
                  Step 1 of {totalSteps} · Profile
                </div>
                <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 32, fontWeight: 900, color: '#002147', lineHeight: 1.2, margin: 0 }}>
                  Tell us about<br />your agency
                </h1>
                <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14, color: '#9CA3AF', marginTop: 10, lineHeight: 1.6 }}>
                  This helps us tailor your 90-day action plan precisely to your context.
                </p>
              </div>

              {/* Agency Type */}
              <div style={{ marginBottom: 36 }}>
                <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 11, fontWeight: 700, color: '#6B7280', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14 }}>
                  Agency Type
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {AGENCY_TYPES.map((t, i) => {
                    const sel = profile.type === t.label
                    return (
                      <button key={t.id} className="type-card"
                        onClick={() => setProfile(p => ({ ...p, type: t.label }))}
                        style={{
                          textAlign: 'left', padding: '20px 20px', borderRadius: 16,
                          border: `1.5px solid ${sel ? '#002147' : '#E5E7EB'}`,
                          background: sel ? '#F0F4F9' : '#FAFAFA',
                          boxShadow: sel ? '0 0 0 3px rgba(0,33,71,0.06)' : 'none',
                          borderLeft: `4px solid ${sel ? '#C4962A' : 'transparent'}`,
                          transition: 'all 0.18s ease', cursor: 'pointer'
                        }}>
                        <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14, fontWeight: 800, color: sel ? '#002147' : '#374151', marginBottom: 4 }}>{t.label}</div>
                        <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 11, color: '#9CA3AF', lineHeight: 1.4 }}>{t.range}</div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Agent Count */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 11, fontWeight: 700, color: '#6B7280', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                    Agents Overseen
                  </span>
                  <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 22, fontWeight: 900, color: '#002147' }}>
                    {profile.agentCount}
                    <span style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', marginLeft: 4 }}>agents</span>
                  </span>
                </div>
                <input type="range" className="agency-slider" min="1" max="200" value={profile.agentCount}
                  style={{ '--val': `${(profile.agentCount / 200) * 100}%` }}
                  onChange={e => setProfile(p => ({ ...p, agentCount: parseInt(e.target.value) }))} />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                  <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 10, color: '#D1D5DB' }}>1</span>
                  <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 10, color: '#D1D5DB' }}>200+</span>
                </div>
              </div>
            </div>
          )}

          {/* ── Steps 1+: Questions ── */}
          {step > 0 && q && (
            <div key={`step-${animKey}`} className="agency-card">

              {/* Section label + progress */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 7,
                  background: sectionPalette.light, padding: '6px 14px', borderRadius: 99
                }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: sectionPalette.accent }} />
                  <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 11, fontWeight: 700, color: sectionPalette.label, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    {q.sectionLabel}
                  </span>
                </div>
                <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 12, fontWeight: 600, color: '#D1D5DB' }}>
                  {qIdx + 1} / {questions.length}
                </span>
              </div>

              {/* Question text */}
              <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 26, fontWeight: 800, color: '#002147', lineHeight: 1.3, margin: '0 0 8px' }}>
                {q?.text}
              </h2>
              <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, color: '#9CA3AF', margin: '0 0 28px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="#D1D5DB" strokeWidth="1.5"/><path d="M7 5v3M7 9.5v.5" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round"/></svg>
                Select all that apply to your agency
              </p>

              {/* Options */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {(q?.options || []).map((opt, i) => (
                  <OptionCard
                    key={opt.optionId || opt._id || i}
                    option={opt}
                    index={i}
                    isSelected={selectedIds.includes(opt.optionId || opt._id || opt.label)}
                    onToggle={() => handleToggle(qId, opt.optionId || opt._id || opt.label)}
                  />
                ))}
              </div>

              {/* Selected count */}
              {selectedIds.length > 0 && (
                <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#003B6E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 10, fontWeight: 800, color: '#fff' }}>{selectedIds.length}</span>
                  </div>
                  <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 12, color: '#6B7280', fontWeight: 500 }}>
                    {selectedIds.length} bottleneck{selectedIds.length > 1 ? 's' : ''} identified
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="agency-footer">
          <div className="agency-footer-inner">
            {step > 0 && (
              <button onClick={goBack} style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 14,
                padding: '14px 24px', borderRadius: 12, border: '1.5px solid #E5E7EB',
                background: '#fff', color: '#6B7280', cursor: 'pointer', transition: 'all 0.15s'
              }}>
                ← Back
              </button>
            )}
            <button onClick={goNext} disabled={step === 0 ? !profile.type : submitting}
              style={{
                flex: 1, fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 15,
                padding: '16px 32px', borderRadius: 12, border: 'none',
                background: (step === 0 && !profile.type) ? '#E5E7EB' : 'linear-gradient(135deg, #003B6E 0%, #004a99 100%)',
                color: (step === 0 && !profile.type) ? '#9CA3AF' : '#fff',
                cursor: (step === 0 && !profile.type) ? 'not-allowed' : 'pointer',
                boxShadow: (step === 0 && !profile.type) ? 'none' : '0 4px 16px rgba(0,59,110,0.25)',
                transition: 'all 0.2s', letterSpacing: '0.04em',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
              }}>
              {submitting ? (
                <>
                  <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                  Generating your plan...
                </>
              ) : step === totalSteps - 1 ? (
                <>Finish Audit <span style={{ opacity: 0.7 }}>→</span></>
              ) : step === 0 ? (
                <>Start Diagnostic <span style={{ opacity: 0.7 }}>→</span></>
              ) : (
                <>Continue <span style={{ opacity: 0.7 }}>→</span></>
              )}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </>
  )
}
