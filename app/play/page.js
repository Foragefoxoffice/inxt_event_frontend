'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import styles from './play.module.css'

const GAME_ICONS = {
  QUIZ: '🤖',
  AGENCY: '🏢',
  MYTH: '🔍',
  CROSSWORD: '🧩',
  INTERVIEW: '🎙️'
}

export default function PlayPage() {
  const router = useRouter()
  const [eventData, setEventData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [player, setPlayer] = useState(null)
  const [selectedGame, setSelectedGame] = useState(null) 
  const [form, setForm] = useState({ name: '', company: '', email: '', phone: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.getActiveGames()
      .then(data => {
        setEventData(data)
        try {
          const stored = sessionStorage.getItem(`player_${data.eventId}`)
          if (stored) setPlayer(JSON.parse(stored))
        } catch (_) {}
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  async function handleRegister(e) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const data = await api.registerUser({ ...form, eventId: eventData.eventId })
      const playerData = {
        playerId: data.playerId,
        name: form.name,
        company: form.company,
        email: form.email,
        phone: form.phone
      }
      sessionStorage.setItem(`player_${eventData.eventId}`, JSON.stringify(playerData))
      setPlayer(playerData)
      router.push(`/play/games/${selectedGame.gameId}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  function handleGameClick(game) {
    if (player) {
      router.push(`/play/games/${game.gameId}`)
    } else {
      setSelectedGame(game)
    }
  }

  function handleNewPlayer() {
    if (!eventData) return
    sessionStorage.removeItem(`player_${eventData.eventId}`)
    setPlayer(null)
    setForm({ name: '', company: '', email: '', phone: '' })
    setError(null)
    setSelectedGame(null)
  }

  if (loading) {
    return (
      <div className={styles.playPage} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className={styles.spinner} style={{ borderTopColor: '#0EA5E9', borderLeftColor: '#E2E8F0', borderRightColor: '#E2E8F0', borderBottomColor: '#E2E8F0' }} />
      </div>
    )
  }

  if (!eventData) {
    return (
      <div className={styles.playPage} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: '3rem', background: '#FFFFFF', borderRadius: '2rem', boxShadow: '0 20px 50px rgba(0,0,0,0.05)' }}>
          <p style={{ color: '#EF4444', fontWeight: 'bold', fontSize: '1.25rem' }}>Active event not found</p>
          <p style={{ color: '#64748B', marginTop: '0.5rem' }}>Please contact the organizer or try again later.</p>
        </div>
      </div>
    )
  }

  if (selectedGame) {
    return (
      <div className={styles.regOverlay}>
        <div className={styles.regHeader}>
          <img src="/logo.png" alt="iorta TECHNXT" className={styles.logo} />
          <div className={styles.regGameBadge}>
            <span className={styles.regGameIcon}>{GAME_ICONS[selectedGame.type]}</span>
            <span className={styles.regGameTitle}>{selectedGame.title}</span>
          </div>
        </div>

        <div className={styles.regCard}>
          <h1 className={styles.regTitle}>Register to Play</h1>
          <p className={styles.regSubtitle}>Enter your details to begin the experience.</p>

          <form onSubmit={handleRegister} className={styles.form}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Your Name</label>
              <input className={styles.input} placeholder="e.g. Arjun Sharma" value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Company / Agency</label>
              <input className={styles.input} placeholder="e.g. Direct" value={form.company}
                onChange={e => setForm(f => ({ ...f, company: e.target.value }))} required />
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Email Address</label>
              <input className={styles.input} type="email" placeholder="e.g. arjun@.com" value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Phone Number</label>
              <input className={styles.input} type="tel" placeholder="e.g. +60 12 345 6789" value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} required />
            </div>

            {error && <div className={styles.errorBox}>{error}</div>}

            <button type="submit" disabled={submitting} className={styles.submitBtn}>
              {submitting ? (
                <>
                  <div className={styles.spinner} />
                  <span>Registering...</span>
                </>
              ) : (
                <span>Start {selectedGame.title} →</span>
              )}
            </button>

            <button type="button" onClick={() => setSelectedGame(null)} className={styles.backBtn}>
              ← Back to games
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.playPage}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.logoWrapper}>
            <img src="/logo.png" alt="iorta TECHNXT" className={styles.logo} />
          </div>
          <h1 className={styles.title}>Choose a Game</h1>
          <p className={styles.subtitle}>
            {player
              ? <>Welcome back, <span className={styles.playerName}>{player.name}</span> — select an experience</>
              : 'Select an experience to begin'}
          </p>
        </header>

        <div className={styles.grid}>
          {eventData.games.map(game => (
            <div
              key={game.gameId}
              onClick={() => handleGameClick(game)}
              className={styles.gameCard}
            >
              <div className={styles.cardGlow} />
              <div className={styles.iconBox}>
                {GAME_ICONS[game.type]}
              </div>
              <div className={styles.cardMeta}>
                <span className={styles.gameType}>{game.type}</span>
                <span className={styles.divider} />
              </div>
              <h2 className={styles.gameTitle}>{game.title}</h2>
              <div className={styles.cardAction}>
                Start Experience
                <span className={styles.arrow}>→</span>
              </div>
            </div>
          ))}
        </div>

        {player && (
          <div className={styles.footerActions}>
            <button onClick={handleNewPlayer} className={styles.newPlayerBtn}>
              ↺ New Player
            </button>
          </div>
        )}

        <footer className={styles.footerInfo}>
          AI Summit · 2026 · Digital Agency Audit
        </footer>
      </div>
    </div>
  )
}
