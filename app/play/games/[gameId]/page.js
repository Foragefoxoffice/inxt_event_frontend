'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { api } from '@/lib/api'
import { AgencyGame } from '@/components/player/AgencyGame'
import { MythGame } from '@/components/player/MythGame'
import { CrosswordGame } from '@/components/player/CrosswordGame'
import { InterviewerHub } from '@/components/player/InterviewerHub'

export default function GamePage() {
  const { gameId } = useParams()
  const router = useRouter()
  const [step, setStep] = useState('loading') // loading | register | game | error
  const [gameData, setGameData] = useState(null)
  const [eventId, setEventId] = useState(null)
  const [playerId, setPlayerId] = useState(null) // held in memory only — never stored
  const [form, setForm] = useState({ name: '', company: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    Promise.all([
      api.getQuestions(gameId),
      api.getActiveGames()
    ])
      .then(([qData, eventData]) => {
        setGameData(qData)
        setEventId(eventData.eventId)
        setStep('register') // always register — nothing persisted
      })
      .catch(err => {
        setError(err.message)
        setStep('error')
      })
  }, [gameId])

  async function handleRegister(e) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const data = await api.registerUser({ ...form, eventId })
      setPlayerId(data.playerId) // stored in React state only
      setStep('game')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleSubmit(answers, duration = null) {
    setSubmitting(true)
    setError(null)
    try {
      const data = await api.submitSession({ playerId, gameId, answers, duration })
      router.push(`/play/games/${gameId}/result?session=${data.sessionId}`)
    } catch (err) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  if (step === 'loading') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F7FAFF' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 32, height: 32, border: '2.5px solid #E2E8F0', borderTopColor: '#00ADEF', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 12px' }} />
          <p style={{ fontFamily: 'sans-serif', fontSize: 13, color: '#64748B' }}>Loading Experience...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (step === 'error') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F7F6F2' }}>
        <p style={{ color: '#EF4444', fontFamily: 'sans-serif' }}>{error}</p>
      </div>
    )
  }

  const GAME_THEMES = {
    AGENCY: {
      label: 'Agency Diagnostic Audit',
      subtitle: 'Answer a few questions and receive your personalised 90-day agency roadmap.',
      button: 'Begin Diagnostic →',
      icon: '🏢'
    },
    MYTH: {
      label: 'Myth Buster Challenge',
      subtitle: 'Think you can beat the AI? Test your industry knowledge against the strategist.',
      button: 'Start Challenge →',
      icon: '🔍'
    },
    CROSSWORD: {
      label: 'Takaful AI Crossword',
      subtitle: 'Solve the puzzle to prove your mastery of modern Takaful mechanics.',
      button: 'Solve Puzzle →',
      icon: '🧩'
    },
    INTERVIEW: {
      label: 'Interviewer Hub',
      subtitle: 'Capture professional industry viewpoints and share your expert perspective.',
      button: 'Open Hub →',
      icon: '🎙️'
    }
  }

  if (step === 'register') {
    const theme = GAME_THEMES[gameData.type] || GAME_THEMES.AGENCY
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&display=swap');
          @keyframes regFadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes spin { to { transform: rotate(360deg); } }
          .reg-input { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 15px; color: #003B6E; background: #F8FBFF; border: 1.5px solid #E2E8F0; border-radius: 12px; padding: 14px 18px; outline: none; width: 100%; transition: all 0.15s ease; box-sizing: border-box; }
          .reg-input:focus { border-color: #00ADEF; background: #fff; box-shadow: 0 0 0 4px rgba(0, 173, 239, 0.08); }
          .reg-input::placeholder { color: #94A3B8; }
        `}</style>
        <div style={{ minHeight: '100vh', background: '#F7F6F2', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>

          {/* Logo strip */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, marginBottom: 40 }}>
            <img src="/logo.png" alt="iorta TECHNXT" style={{ height: 48, width: 'auto' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ fontSize: 24 }}>{theme.icon}</div>
              <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 11, fontWeight: 800, color: '#00ADEF', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
                {theme.label}
              </span>
            </div>
          </div>

          <div style={{ width: '100%', maxWidth: 440, background: '#fff', borderRadius: 24, boxShadow: '0 4px 6px -1px rgba(0, 173, 239, 0.05), 0 20px 25px -5px rgba(0, 173, 239, 0.05)', border: '1px solid #F0F9FF', padding: 44, animation: 'regFadeUp 0.4s ease forwards' }}>
            <div style={{ marginBottom: 32 }}>
              <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 28, fontWeight: 900, color: '#003B6E', margin: '0 0 8px', lineHeight: 1.2 }}>
                Let's get started
              </h1>
              <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14, color: '#9CA3AF', margin: 0, lineHeight: 1.6 }}>
                {theme.subtitle}
              </p>
            </div>

            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 11, fontWeight: 700, color: '#6B7280', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                  Your Name
                </label>
                <input className="reg-input" placeholder="e.g. Arjun Sharma" value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div>
                <label style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 11, fontWeight: 700, color: '#6B7280', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                  Company / Agency
                </label>
                <input className="reg-input" placeholder="e.g. Takaful Direct" value={form.company}
                  onChange={e => setForm(f => ({ ...f, company: e.target.value }))} required />
              </div>

              {error && (
                <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '10px 14px', fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, color: '#DC2626' }}>
                  {error}
                </div>
              )}

              <button type="submit" disabled={submitting} style={{
                marginTop: 8, width: '100%', padding: '16px', borderRadius: 12, border: 'none',
                background: submitting ? '#E2E8F0' : 'linear-gradient(135deg, #00ADEF 0%, #003B6E 100%)',
                color: submitting ? '#94A3B8' : '#fff', cursor: submitting ? 'not-allowed' : 'pointer',
                fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 15,
                boxShadow: submitting ? 'none' : '0 8px 25px -5px rgba(0, 173, 239, 0.3)',
                transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
              }}>
                {submitting ? (
                  <>
                    <div style={{ width: 16, height: 16, border: '2px solid rgba(0,0,0,0.15)', borderTopColor: '#9CA3AF', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                    Registering...
                  </>
                ) : theme.button}
              </button>
            </form>
          </div>

          <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 12, color: '#D1D5DB', marginTop: 24 }}>
            Takaful Summit 2026 · Powered by SalesVerse
          </p>
        </div>
      </>
    )
  }

  const GameComponents = {
    AGENCY: <AgencyGame questions={gameData.questions} onSubmit={handleSubmit} submitting={submitting} eventId={eventId} />,
    MYTH: <MythGame questions={gameData.questions} onSubmit={handleSubmit} submitting={submitting} eventId={eventId} />,
    CROSSWORD: <CrosswordGame questions={gameData.questions} onSubmit={handleSubmit} submitting={submitting} eventId={eventId} />,
    INTERVIEW: <InterviewerHub questions={gameData.questions} onSubmit={handleSubmit} submitting={submitting} eventId={eventId} />
  }

  const component = GameComponents[gameData.type]
  if (component) return component

  return (
    <div className="min-h-screen flex items-center justify-center text-white" style={{ background: '#061122' }}>
      <p>Unknown game type</p>
    </div>
  )
}
