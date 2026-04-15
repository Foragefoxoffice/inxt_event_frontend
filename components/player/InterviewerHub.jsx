'use client'

import { useState, useEffect, useRef } from 'react'

const PERSONAS = [
  { id: 'cxo', icon: 'C', title: 'C-Suite / MD / CEO', desc: 'Senior leadership. Strategy and vision.' },
  { id: 'bdo', icon: 'B', title: 'Agency Mgr / BDM', desc: 'Distribution focus. Performance and productivity.' },
  { id: 'operator', icon: 'O', title: 'Operator', desc: 'Product, digital transformation roles.' },
  { id: 'agent', icon: 'A', title: 'Senior Agent', desc: 'Frontline practitioner. Day-to-day challenges.' },
  { id: 'association', icon: 'As', title: 'Association', desc: 'Industry-wide perspective. Policy.' },
  { id: 'insuretech', icon: 'IT', title: 'InsureTech', desc: 'Technology innovators. Future-focused.' }
]

export function InterviewerHub({ questions, onSubmit, submitting, eventId }) {
  const [step, setStep] = useState('hub') // hub | setup | start | select | interview | wrap | final
  const [guest, setGuest] = useState({ name: '', title: '', org: '', persona: '', li: '', email: '' })
  const [selectedQIds, setSelectedQIds] = useState([])
  const [currentQIdx, setCurrentQIdx] = useState(0)
  const [timer, setTimer] = useState(180) // 3 mins
  const [timerActive, setTimerActive] = useState(false)
  const [sessions, setSessions] = useState([]) // Track interviews done in this session
  const [answers, setAnswers] = useState({}) // Keyed by questionId: { notes: string }
  const [copied, setCopied] = useState(false)
  const timerRef = useRef(null)

  // Timer logic
  useEffect(() => {
    if (timerActive && timer > 0) {
      timerRef.current = setInterval(() => setTimer(t => t - 1), 1000)
    } else {
      clearInterval(timerRef.current)
    }
    return () => clearInterval(timerRef.current)
  }, [timerActive, timer])

  const recQuestions = questions.filter(q => q.personas && q.personas.includes(guest.persona))
  const otherQuestions = questions.filter(q => !q.personas || !q.personas.includes(guest.persona))
  const selectedQuestions = questions.filter(q => selectedQIds.includes(q.questionId))

  const handleComplete = () => {
    const payload = selectedQuestions.map((q, idx) => ({
      questionId: q.questionId,
      answer: answers[q.questionId] || '',
      timestamp: new Date().toISOString()
    }))
    onSubmit(payload)
    // Local log tracking
    setSessions(prev => [{ name: guest.name, org: guest.org, time: new Date().toLocaleTimeString() }, ...prev])
  }

  const handleCopyPost = () => {
    const post = `Just finished my interview for the 'Voices of AI' series at iorta TechNXT 2026. 🚀\n\nGreat insight sharing with the @iorta team!\n\n#VoicesOfAI #iortaTechNXT #SalesVerse #MTAxTIC`
    navigator.clipboard.writeText(post)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)', color: '#003B6E', fontFamily: "var(--font-outfit), sans-serif" }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.6; transform: scale(0.9); } }
        .animate-blink { animation: pulse 2s infinite ease-in-out; }
        .hub-card { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .hub-card:hover { transform: translateY(-4px); box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); }
      `}</style>

      {/* Top Static Bar */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg, #00ADEF, #7BC242)', zIndex: 100 }} />

      {/* Header */}
      <div style={{
        position: 'sticky', top: 4, zIndex: 90,
        background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #E2E8F0', px: '24px', padding: '16px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 32, height: 32, background: '#003B6E', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 16, fontWeight: 900 }}>H</div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.2em', color: '#00ADEF', textTransform: 'uppercase', lineHeight: 1 }}>iorta TechNXT</div>
            <div style={{ fontSize: 14, fontWeight: 900, textTransform: 'uppercase', color: '#003B6E', marginTop: 2 }}>Interviewer Hub</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid #E2E8F0', padding: '6px 16px', borderRadius: 20 }}>
          <div className="animate-blink" style={{ width: 8, height: 8, borderRadius: '50%', background: '#22C55E', boxShadow: '0 0 8px #22C55E' }} />
          <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', color: '#003B6E' }}>SYSTEM READY</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10 pb-20">

        {/* STEP: HUB */}
        {step === 'hub' && (
          <div style={{ animation: 'slideUp 0.6s ease both' }}>
            <div style={{ textAlign: 'center', marginBottom: 56 }}>
              <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.4em', color: '#00ADEF', textTransform: 'uppercase', marginBottom: 12 }}>Myth Buster Series</div>
              <h1 style={{ fontSize: 48, fontWeight: 900, color: '#003B6E', lineHeight: 1.1, letterSpacing: '-0.02em', textTransform: 'uppercase', margin: 0 }}>Voices of AI</h1>
              <div style={{ height: 4, width: 60, background: '#7BC242', margin: '24px auto', borderRadius: 2 }} />
              <p style={{ fontSize: 18, color: '#64748B', maxWidth: 500, margin: '0 auto', fontWeight: 500, lineHeight: 1.5 }}>
                Capture industry leadership insights for the <br />
                <span style={{ color: '#003B6E', fontWeight: 700 }}>iorta TechNXT 2026</span> content series.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24, marginBottom: 48 }}>
              <button
                onClick={() => setStep('start')}
                className="hub-card"
                style={{
                  gridColumn: 'span 2',
                  background: 'linear-gradient(135deg, #00ADEF 0%, #003B6E 100%)',
                  padding: '48px 32px',
                  borderRadius: 32,
                  border: 'none',
                  color: '#fff',
                  cursor: 'pointer',
                  textAlign: 'center',
                  boxShadow: '0 20px 40px rgba(0, 173, 239, 0.25)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div style={{ position: 'absolute', top: 0, right: 0, width: '40%', height: '100%', background: 'linear-gradient(to left, rgba(255,255,255,0.1), transparent)', pointerEvents: 'none' }} />
                <div style={{ fontSize: 40, marginBottom: 16 }}>🎙️</div>
                <div style={{ fontSize: 24, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Start New Interview</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 8, textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.15em' }}>Initialize Capture Protocol</div>
              </button>

              <button
                onClick={() => setStep('setup')}
                className="hub-card"
                style={{
                  background: '#fff',
                  padding: '32px 24px',
                  borderRadius: 24,
                  border: '1px solid #E2E8F0',
                  textAlign: 'center',
                  cursor: 'pointer'
                }}
              >
                <div style={{ fontSize: 32, marginBottom: 12 }}>📋</div>
                <div style={{ fontSize: 14, fontWeight: 900, color: '#003B6E', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Setup Checklist</div>
                <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 4, fontWeight: 600 }}>PRE-FLIGHT PROTOCOL</div>
              </button>

              <button
                onClick={() => setStep('log')}
                className="hub-card"
                style={{
                  background: '#fff',
                  padding: '32px 24px',
                  borderRadius: 24,
                  border: '1px solid #E2E8F0',
                  textAlign: 'center',
                  cursor: 'pointer'
                }}
              >
                <div style={{ fontSize: 32, marginBottom: 12 }}>🕒</div>
                <div style={{ fontSize: 14, fontWeight: 900, color: '#003B6E', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Interview Log</div>
                <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 4, fontWeight: 600 }}>SESSION RECORDS</div>
              </button>
            </div>

            <div style={{
              background: '#fff',
              border: '1px solid #E2E8F0',
              borderRadius: 24,
              padding: '32px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 6, background: '#00ADEF' }} />
              <div style={{ fontSize: 11, fontWeight: 800, color: '#00ADEF', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 12 }}>Field Prep: Invite Script</div>
              <p style={{ fontSize: 18, color: '#475569', fontStyle: 'italic', lineHeight: 1.6, margin: 0, fontWeight: 500 }}>
                "We're capturing 60-second real opinions from leaders today — would you share yours? It'll be on LinkedIn as part of our series. Takes 3 minutes."
              </p>
            </div>
          </div>
        )}

        {/* STEP: SETUP CHECKLIST */}
        {step === 'setup' && (
          <div style={{ animation: 'slideUp 0.6s ease both', textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, background: 'rgba(0, 173, 239, 0.1)', color: '#00ADEF', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 900, margin: '0 auto 24px', border: '1px solid rgba(0, 173, 239, 0.2)' }}>P</div>
            <div style={{ marginBottom: 40 }}>
              <h1 style={{ fontSize: 32, fontWeight: 900, color: '#003B6E', textTransform: 'uppercase', margin: 0 }}>Professional Setup</h1>
              <p style={{ fontSize: 15, color: '#64748B', marginTop: 8 }}>Follow these industry standards for premium quality.</p>
            </div>

            <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 40 }}>
              {[
                { n: "01", t: "Guest Comfort", d: "Ensure guest is comfortably seated and at eye-level with the camera." },
                { n: "02", t: "Audio Check", d: "Test the lapel or handheld mic. Listen for interference / clothing rustle." },
                { n: "03", t: "Lighting Check", d: "Guest must face the primary light source. Avoid strong shadows on eyes." },
                { n: "04", t: "Silence Protocol", d: "Turn off notifications. Interviewer and Guest phones on Silent/Airplane mode." },
                { n: "05", t: "Content Flow", d: "Rehearse the intro ('We're here with...') and the closing sign-off." }
              ].map(item => (
                <div key={item.n} style={{ background: '#fff', padding: '20px 24px', borderRadius: 20, border: '1px solid #E2E8F0', display: 'flex', gap: 20 }}>
                  <div style={{ fontSize: 12, fontWeight: 900, color: '#00ADEF', marginTop: 2 }}>{item.n}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 900, color: '#003B6E', textTransform: 'uppercase', marginBottom: 4 }}>{item.t}</div>
                    <div style={{ fontSize: 11, color: '#64748B', lineHeight: 1.5, fontWeight: 500 }}>{item.d}</div>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={() => setStep('hub')} style={{ width: '100%', padding: '18px', background: '#fff', borderRadius: 16, border: '2px solid #E2E8F0', color: '#003B6E', fontWeight: 800, cursor: 'pointer', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.1em' }}>RETURN TO HUB</button>
          </div>
        )}

        {/* STEP: INTERVIEW LOG */}
        {step === 'log' && (
          <div style={{ animation: 'slideUp 0.6s ease both', textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, background: 'rgba(123, 194, 66, 0.1)', color: '#7BC242', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 900, margin: '0 auto 24px', border: '1px solid rgba(123, 194, 66, 0.2)' }}>L</div>
            <div style={{ marginBottom: 40 }}>
              <h1 style={{ fontSize: 32, fontWeight: 900, color: '#003B6E', textTransform: 'uppercase', margin: 0 }}>Session Records</h1>
              <p style={{ fontSize: 15, color: '#64748B', marginTop: 8 }}>Historical log of interviews captured on this device.</p>
            </div>

            {sessions.length === 0 ? (
              <div style={{ padding: '64px', background: '#fff', borderRadius: 32, border: '2px dashed #E2E8F0', color: '#CBD5E1', fontSize: 14, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 40 }}>
                No records found for this session
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 40 }}>
                {sessions.map((s, idx) => (
                  <div key={idx} style={{ background: '#fff', padding: '20px 24px', borderRadius: 20, border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left' }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 900, color: '#003B6E', textTransform: 'uppercase' }}>{s.name}</div>
                      <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600, marginTop: 2 }}>{s.org}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 12, fontWeight: 800, color: '#00ADEF' }}>{s.time}</div>
                      <div style={{ fontSize: 10, fontWeight: 800, color: '#22C55E', marginTop: 4, letterSpacing: '0.05em' }}>SYNCED ✓</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button onClick={() => setStep('hub')} style={{ width: '100%', padding: '18px', background: '#fff', borderRadius: 16, border: '2px solid #E2E8F0', color: '#003B6E', fontWeight: 800, cursor: 'pointer', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.1em' }}>RETURN TO HUB</button>
          </div>
        )}

        {/* STEP: START (Guest Details) */}
        {step === 'start' && (
          <div style={{ animation: 'slideUp 0.6s ease both' }}>
            <div style={{ marginBottom: 40 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#00ADEF', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 8 }}>Capture Protocol</div>
              <h1 style={{ fontSize: 32, fontWeight: 800, color: '#003B6E', textTransform: 'uppercase', margin: 0 }}>Guest Interview Details</h1>
              <p style={{ fontSize: 15, color: '#64748B', marginTop: 8 }}>Please provide the professional profile of the interviewee.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 24, background: '#fff', padding: '40px', borderRadius: 32, border: '1px solid #E2E8F0', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <label style={{ fontSize: 11, fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Full Name *</label>
                <input
                  style={{ width: '100%', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, padding: '16px 20px', fontSize: 16, fontWeight: 700, color: '#003B6E', outline: 'none' }}
                  value={guest.name} onChange={e => setGuest({ ...guest, name: e.target.value })}
                  placeholder="e.g. Azlan Harun"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <label style={{ fontSize: 11, fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Professional Title</label>
                  <input placeholder='e.g. CEO' style={{ width: '100%', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, padding: '14px 20px', fontSize: 15, fontWeight: 700, color: '#003B6E', outline: 'none' }} value={guest.title} onChange={e => setGuest({ ...guest, title: e.target.value })} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <label style={{ fontSize: 11, fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Organization / Firm</label>
                  <input placeholder='e.g. iorta' style={{ width: '100%', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, padding: '14px 20px', fontSize: 15, fontWeight: 700, color: '#003B6E', outline: 'none' }} value={guest.org} onChange={e => setGuest({ ...guest, org: e.target.value })} />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <label style={{ fontSize: 11, fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Industry Segment Selection</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {PERSONAS.map(p => (
                    <button
                      key={p.id}
                      onClick={() => setGuest({ ...guest, persona: p.id })}
                      style={{
                        padding: '16px', borderRadius: 12, border: guest.persona === p.id ? '2px solid #00ADEF' : '1px solid #E2E8F0',
                        background: guest.persona === p.id ? 'rgba(0, 173, 239, 0.05)' : '#fff',
                        textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: guest.persona === p.id ? '#00ADEF' : '#003B6E', marginBottom: 4 }}>{p.title}</div>
                      <div style={{ fontSize: 11, color: '#64748B', lineHeight: 1.3 }}>{p.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 16, marginTop: 16 }}>
                <button onClick={() => setStep('hub')} style={{ padding: '18px 32px', background: '#F1F5F9', borderRadius: 16, border: 'none', color: '#64748B', fontWeight: 800, cursor: 'pointer', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.1em' }}>CANCEL</button>
                <button
                  onClick={() => setStep('select')}
                  disabled={!guest.name || !guest.persona}
                  style={{
                    flex: 1, background: 'linear-gradient(135deg, #00ADEF 0%, #003B6E 100%)', color: '#fff', border: 'none',
                    borderRadius: 16, padding: '18px', fontSize: 14, fontWeight: 900, textTransform: 'uppercase',
                    letterSpacing: '0.1em', cursor: 'pointer', opacity: (!guest.name || !guest.persona) ? 0.4 : 1,
                    boxShadow: '0 10px 25px rgba(0, 173, 239, 0.3)'
                  }}
                >CURATE QUESTIONS →</button>
              </div>
            </div>
          </div>
        )}

        {/* STEP: SELECT QUESTIONS */}
        {step === 'select' && (
          <div style={{ animation: 'slideUp 0.6s ease both' }}>
            <div style={{ marginBottom: 40 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#00ADEF', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 8 }}>Target Core: {PERSONAS.find(p => p.id === guest.persona)?.title}</div>
              <h1 style={{ fontSize: 32, fontWeight: 900, color: '#003B6E', textTransform: 'uppercase', margin: 0 }}>Curate Viewpoints</h1>
              <p style={{ fontSize: 15, color: '#64748B', marginTop: 8 }}>Select 3–5 items for a meaningful industry discourse.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ fontSize: 10, fontWeight: 900, color: '#00ADEF', letterSpacing: '0.15em', textTransform: 'uppercase', background: 'rgba(0, 173, 239, 0.05)', padding: '6px 16px', borderRadius: 8, alignSelf: 'flex-start' }}>Segment Recommendations</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {recQuestions.map((q, i) => {
                    const isSelected = selectedQIds.includes(q.questionId)
                    return (
                      <button
                        key={q.questionId}
                        onClick={() => {
                          setSelectedQIds(prev => isSelected ? prev.filter(id => id !== q.questionId) : [...prev, q.questionId])
                        }}
                        style={{
                          width: '100%', padding: '24px', borderRadius: 15, border: isSelected ? '2px solid #00ADEF' : '1px solid #E2E8F0',
                          background: isSelected ? 'rgba(0, 173, 239, 0.03)' : '#fff',
                          textAlign: 'left', transition: 'all 0.2s', display: 'flex', gap: 20, cursor: 'pointer'
                        }}
                      >
                        <div style={{
                          width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                          background: isSelected ? '#00ADEF' : '#F1F5F9',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 12, fontWeight: 900, color: isSelected ? '#fff' : '#003B6E'
                        }}>
                          {isSelected ? '✓' : i + 1}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                            <span style={{ fontSize: 9, fontWeight: 900, px: '8px', py: '2px', background: q.interviewType === 'tf' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(123, 194, 66, 0.1)', color: q.interviewType === 'tf' ? '#166534' : '#3F6212', borderRadius: 4, textTransform: 'uppercase' }}>
                              {q.interviewType === 'tf' ? 'CONSENSUS' : 'QUALITATIVE'}
                            </span>
                          </div>
                          <div style={{ fontSize: 16, fontWeight: 700, color: '#003B6E', lineHeight: 1.4 }}>{q?.text}</div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ fontSize: 10, fontWeight: 900, color: '#94A3B8', letterSpacing: '0.15em', textTransform: 'uppercase', background: '#F8FAFC', padding: '6px 16px', borderRadius: 8, alignSelf: 'flex-start', border: '1px solid #E2E8F0' }}>General Industry Topics</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {otherQuestions.map((q, i) => {
                    const isSelected = selectedQIds.includes(q.questionId)
                    return (
                      <button
                        key={q.questionId}
                        onClick={() => {
                          setSelectedQIds(prev => isSelected ? prev.filter(id => id !== q.questionId) : [...prev, q.questionId])
                        }}
                        style={{
                          width: '100%', padding: '24px', borderRadius: 24, border: isSelected ? '2px solid #00ADEF' : '1px solid #E2E8F0',
                          background: isSelected ? 'rgba(0, 173, 239, 0.03)' : '#fff',
                          textAlign: 'left', transition: 'all 0.2s', display: 'flex', gap: 20, cursor: 'pointer'
                        }}
                      >
                        <div style={{
                          width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                          background: isSelected ? '#00ADEF' : '#F1F5F9',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 12, fontWeight: 900, color: isSelected ? '#fff' : '#003B6E'
                        }}>
                          {isSelected ? '✓' : i + 1}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                            <span style={{ fontSize: 9, fontWeight: 900, px: '8px', py: '2px', background: '#F1F5F9', color: '#94A3B8', borderRadius: 4, textTransform: 'uppercase' }}>
                              {q.interviewType === 'tf' ? 'CONSENSUS' : 'QUALITATIVE'}
                            </span>
                          </div>
                          <div style={{ fontSize: 16, fontWeight: 700, color: '#003B6E', lineHeight: 1.4 }}>{q?.text}</div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            <div style={{ pt: '40px', display: 'flex', gap: 16, position: 'sticky', bottom: 24, zIndex: 100, marginTop: 48 }}>
              <button onClick={() => setStep('start')} style={{ px: '32px', padding: '18px 32px', background: '#fff', border: '1px solid #E2E8F0', borderRadius: 16, fontWeight: 800, cursor: 'pointer', fontSize: 13, textTransform: 'uppercase', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>BACK</button>
              <button
                onClick={() => { setStep('interview'); setTimerActive(true); }}
                disabled={selectedQIds.length === 0}
                style={{
                  flex: 1, background: 'linear-gradient(135deg, #00ADEF 0%, #003B6E 100%)', color: '#fff', border: 'none',
                  borderRadius: 16, padding: '18px', fontSize: 15, fontWeight: 900, textTransform: 'uppercase',
                  letterSpacing: '0.1em', cursor: 'pointer', opacity: selectedQIds.length === 0 ? 0.4 : 1,
                  boxShadow: '0 15px 35px rgba(0, 173, 239, 0.3)', transition: 'all 0.3s'
                }}
              >
                INITIALIZE RECORDING ({selectedQIds.length}) →
              </button>
            </div>
          </div>
        )}
        {/* STEP: INTERVIEW MODE */}
        {step === 'interview' && (
          <div style={{ animation: 'fadeIn 0.6s ease both' }}>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', padding: '24px 32px', borderRadius: 24, border: '1px solid #E2E8F0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', marginBottom: 32 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 4 }}>Protocol Timer</div>
                <div style={{ fontSize: 40, fontWeight: 900, color: timer < 30 ? '#EF4444' : '#00ADEF', fontVariantNumeric: 'tabular-nums' }}>
                  {formatTime(timer)}
                </div>
              </div>
              <div style={{ height: 40, width: 1, background: '#E2E8F0' }} />
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 4 }}>Live Interviewee</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#003B6E', textTransform: 'uppercase' }}>{guest.name}</div>
                <div style={{ fontSize: 11, color: '#00ADEF', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{guest.org}</div>
              </div>
            </div>

            <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #E2E8F0', boxShadow: '0 25px 50px -12px rgba(0, 59, 110, 0.12)', overflow: 'hidden' }}>
              <div style={{ background: '#003B6E', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#fff' }}>
                <span style={{ fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em' }}>Capture Interface</span>
                <span style={{ fontSize: 11, fontWeight: 800, opacity: 0.6 }}>SEQUENCE {currentQIdx + 1} OF {selectedQuestions.length}</span>
              </div>

              <div style={{ padding: '64px 48px', textAlign: 'center', minHeight: '340px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#00ADEF', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: 24 }}>Inquiry Objective</div>
                <h2 style={{ fontSize: '32px', fontWeight: 700, color: '#003B6E', lineHeight: 1.25, margin: 0 }}>"{selectedQuestions[currentQIdx]?.text}"</h2>

                {selectedQuestions[currentQIdx]?.hostProposal && (
                  <div style={{ marginTop: 40, background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 15, padding: '24px 32px', maxWidth: '560px', margin: '40px auto 0' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Delivery Guide</div>
                    <div style={{ fontSize: 16, fontWeight: 700, fontStyle: 'italic', color: '#003B6E', lineHeight: 1.5 }}>"{selectedQuestions[currentQIdx].hostProposal}"</div>
                  </div>
                )}
              </div>

              <div style={{ padding: '0 48px 48px' }}>
                <textarea
                  style={{ width: '100%', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 14, padding: '24px', fontSize: 15, fontWeight: 500, color: '#003B6E', outline: 'none', minHeight: '120px', transition: 'border-color 0.2s' }}
                  placeholder="Capture key insights or observation nodes here..."
                  value={answers[selectedQuestions[currentQIdx]?.questionId] || ''}
                  onChange={e => setAnswers({ ...answers, [selectedQuestions[currentQIdx]?.questionId]: e.target.value })}
                />
                <div style={{ display: 'flex', gap: 16, marginTop: 24 }}>
                  <button
                    onClick={() => setCurrentQIdx(i => Math.max(0, i - 1))}
                    disabled={currentQIdx === 0}
                    style={{ padding: '18px 24px', background: '#F1F5F9', border: 'none', borderRadius: 16, cursor: 'pointer', opacity: currentQIdx === 0 ? 0.2 : 1 }}
                  >←</button>
                  <button
                    onClick={() => {
                      if (currentQIdx < selectedQuestions.length - 1) setCurrentQIdx(i => i + 1)
                      else setStep('wrap')
                    }}
                    style={{
                      flex: 1, background: 'linear-gradient(135deg, #00ADEF 0%, #003B6E 100%)', color: '#fff', border: 'none',
                      borderRadius: 16, padding: '18px', fontSize: 15, fontWeight: 900, textTransform: 'uppercase',
                      letterSpacing: '0.1em', cursor: 'pointer', boxShadow: '0 10px 20px rgba(0, 173, 239, 0.3)'
                    }}
                  >
                    {currentQIdx === selectedQuestions.length - 1 ? 'CONCLUDE INTERVIEW →' : 'NEXT PROTOCOL →'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* STEP: WRAP UP */}
        {step === 'wrap' && (
          <div style={{ animation: 'slideUp 0.6s ease both' }}>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <div style={{ width: 80, height: 80, background: 'rgba(34, 197, 94, 0.1)', color: '#22C55E', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', marginBottom: 24, fontSize: 32, fontWeight: 900, border: '1px solid rgba(34, 197, 94, 0.2)', margin: '0 auto 24px' }}>✓</div>
              <h1 style={{ fontSize: 32, fontWeight: 900, color: '#003B6E', textTransform: 'uppercase', margin: 0 }}>Interview Captured</h1>
              <p style={{ fontSize: 15, color: '#64748B', marginTop: 8 }}>Finalizing documentation for the content sequence.</p>
            </div>

            <div style={{ background: '#fff', borderRadius: 32, padding: '40px', border: '1px solid #E2E8F0', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', gap: 32 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#00ADEF', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Post-Interview Action</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', gap: 16, alignItems: 'center', background: '#F8FAFC', padding: '16px 20px', borderRadius: 16 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#00ADEF' }} />
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>"You are now officially part of Voices of AI. We'll tag you when it goes live."</div>
                  </div>
                  <div style={{ display: 'flex', gap: 16, alignItems: 'center', background: '#F8FAFC', padding: '16px 20px', borderRadius: 16 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#00ADEF' }} />
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>Collect professional handle / LinkedIn for correct tagging.</div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <label style={{ fontSize: 11, fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>LinkedIn Profile / URL</label>
                  <input style={{ width: '100%', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 16, padding: '14px 20px', fontSize: 14, fontWeight: 700, color: '#003B6E', outline: 'none' }} value={guest.li} onChange={e => setGuest({ ...guest, li: e.target.value })} placeholder="In/profile-name" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <label style={{ fontSize: 11, fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Contact Email</label>
                  <input style={{ width: '100%', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 16, padding: '14px 20px', fontSize: 14, fontWeight: 700, color: '#003B6E', outline: 'none' }} value={guest.email} onChange={e => setGuest({ ...guest, email: e.target.value })} />
                </div>
              </div>

              <button
                onClick={() => { setStep('final'); handleComplete(); }}
                style={{
                  width: '100%', background: 'linear-gradient(135deg, #003B6E 0%, #001A33 100%)', color: '#fff', border: 'none',
                  borderRadius: 16, padding: '20px', fontSize: 14, fontWeight: 900, textTransform: 'uppercase',
                  letterSpacing: '0.2em', cursor: 'pointer', boxShadow: '0 10px 30px rgba(0, 59, 110, 0.3)', marginTop: 8
                }}
              >
                FINISH & GENERATE CARD →
              </button>
            </div>
          </div>
        )}

        {/* STEP: FINAL (Featured Card) */}
        {step === 'final' && (
          <div style={{ animation: 'fadeIn 1s ease both', textAlign: 'center' }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#22C55E', textTransform: 'uppercase', letterSpacing: '0.4em', marginBottom: 40 }}>Protocol Success</div>

            <div style={{
              background: 'linear-gradient(135deg, #003B6E 0%, #001A33 100%)',
              borderRadius: 48, padding: '80px 48px', position: 'relative', overflow: 'hidden',
              boxShadow: '0 40px 80px -20px rgba(0, 59, 110, 0.4)', marginBottom: 56
            }}>
              <div style={{ position: 'absolute', top: 0, right: 0, width: '60%', height: '100%', background: 'radial-gradient(circle at center, rgba(0, 173, 239, 0.15) 0%, transparent 70%)', transform: 'translate(20%, -20%)' }} />
              <div style={{ position: 'relative', zIndex: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.3em', color: 'rgba(255,255,255,0.4)', marginBottom: 32 }}>iorta TechNXT · MTA × TIC 2026</div>
                <div style={{ marginBottom: 48 }}>
                  <div style={{ fontSize: 56, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', textTransform: 'uppercase', lineHeight: 1 }}>MYTH BUSTER</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#00ADEF', textTransform: 'uppercase', letterSpacing: '0.2em', marginTop: 8 }}>Voices of AI</div>
                </div>

                <div style={{ width: 120, height: 120, background: 'rgba(255,255,255,0.05)', border: '2px solid rgba(255,255,255,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48, fontWeight: 900, color: '#fff', margin: '0 auto 32px' }}>
                  {guest.name.charAt(0)}
                </div>

                <div>
                  <div style={{ fontSize: 32, fontWeight: 900, color: '#fff', textTransform: 'uppercase' }}>{guest.name}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 8 }}>{guest.title} <span style={{ mx: 8, opacity: 0.3 }}>·</span> {guest.org}</div>
                </div>

                <div style={{ height: 1, background: 'rgba(255,255,255,0.1)', width: 100, margin: '40px auto' }} />
                <div style={{ fontSize: 11, fontWeight: 800, color: '#7BC242', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                  #VoicesOfAI #iortaTechNXT #SalesVerse
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 32, maxWidth: 800, margin: '0 auto 64px', textAlign: 'left' }}>
              <div style={{ background: '#fff', padding: '32px', borderRadius: 24, border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: 11, fontWeight: 900, color: '#00ADEF', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Share: Manual Copy</div>
                <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.5, marginBottom: 24 }}>Use this text to tag the guest and firm on LinkedIn/X instantly.</p>
                <button
                  onClick={handleCopyPost}
                  style={{
                    width: '100%', padding: '16px', borderRadius: 12, border: 'none',
                    background: copied ? '#22C55E' : '#F1F5F9', color: copied ? '#fff' : '#003B6E',
                    fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {copied ? 'COPIED TO CLIPBOARD ✓' : 'COPY SOCIAL SEQUENCE'}
                </button>
              </div>

              <div style={{ background: '#fff', padding: '32px', borderRadius: 24, border: '1px solid #E2E8F0', display: 'flex', gap: 20 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, fontWeight: 900, color: '#00ADEF', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Share: Mobile Scan</div>
                  <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.5, margin: 0 }}>Scan with guest's device for instant social dispatch.</p>
                </div>
                <div style={{ width: 100, height: 100, background: '#fff', padding: 8, borderRadius: 12, border: '1px solid #E2E8F0' }}>
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(`https://twitter.com/intent/tweet?text=Just finished my interview for 'Voices of AI' at iorta TechNXT 2026. 🚀 @iorta #VoicesOfAI #iortaTechNXT`)}&size=100x100&color=003B6E`}
                    alt="QR"
                    style={{ width: '100%', height: '100%' }}
                  />
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 40 }}>
              <button onClick={() => setStep('hub')} style={{ padding: '18px 48px', background: '#F1F5F9', border: 'none', borderRadius: 16, color: '#64748B', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer' }}>HUB</button>
              <button onClick={() => { setStep('start'); setGuest({ name: '', title: '', org: '', persona: '', li: '', email: '' }); setSelectedQIds([]); setCurrentQIdx(0); setTimer(180); setAnswers({}); }} style={{ padding: '18px 48px', background: '#C8922A', border: 'none', borderRadius: 16, color: '#fff', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', boxShadow: '0 10px 20px rgba(200, 146, 42, 0.3)' }}>NEW INTERVIEW</button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
