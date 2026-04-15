'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'

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
  const [selectedGame, setSelectedGame] = useState(null) // game tapped before registering
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
      // Go straight to the game they tapped
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
      <div className="min-h-screen flex items-center justify-center bg-[#F0F9FF]">
        <div className="w-8 h-8 border-2 border-[#00ADEF] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!eventData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F0F9FF]">
        <p className="text-red-600 font-bold">No active event found</p>
      </div>
    )
  }

  // ── Registration overlay (shown after tapping a game) ──────────────────────
  if (selectedGame) {
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

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginBottom: 32 }}>
            <img src="/logo.png" alt="iorta TECHNXT" style={{ height: 40, width: 'auto' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 22 }}>{GAME_ICONS[selectedGame.type]}</span>
              <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 11, fontWeight: 800, color: '#00ADEF', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
                {selectedGame.title}
              </span>
            </div>
          </div>

          <div style={{ width: '100%', maxWidth: 440, background: '#fff', borderRadius: 24, boxShadow: '0 20px 40px rgba(0,173,239,0.08)', border: '1px solid #F0F9FF', padding: 44, animation: 'regFadeUp 0.4s ease forwards' }}>
            <div style={{ marginBottom: 28 }}>
              <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 26, fontWeight: 900, color: '#003B6E', margin: '0 0 8px', lineHeight: 1.2 }}>
                Register to Play
              </h1>
              <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14, color: '#9CA3AF', margin: 0, lineHeight: 1.6 }}>
                Enter your details to begin the experience.
              </p>
            </div>

            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 11, fontWeight: 700, color: '#6B7280', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Your Name</label>
                <input className="reg-input" placeholder="e.g. Arjun Sharma" value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div>
                <label style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 11, fontWeight: 700, color: '#6B7280', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Company / Agency</label>
                <input className="reg-input" placeholder="e.g. Takaful Direct" value={form.company}
                  onChange={e => setForm(f => ({ ...f, company: e.target.value }))} required />
              </div>
              <div>
                <label style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 11, fontWeight: 700, color: '#6B7280', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Email</label>
                <input className="reg-input" type="email" placeholder="e.g. arjun@takaful.com" value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
              </div>
              <div>
                <label style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 11, fontWeight: 700, color: '#6B7280', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Phone Number</label>
                <input className="reg-input" type="tel" placeholder="e.g. +60 12 345 6789" value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} required />
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
                ) : `Start ${selectedGame.title} →`}
              </button>

              <button type="button" onClick={() => setSelectedGame(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, color: '#9CA3AF', textAlign: 'center', marginTop: 4 }}>
                ← Back to games
              </button>
            </form>
          </div>
        </div>
      </>
    )
  }

  // ── Game selection screen ──────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F0F9FF] p-6 font-sans">
      <div className="max-w-4xl mx-auto py-12">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <img src="/logo.png" alt="iorta TECHNXT" className="h-12 w-auto" />
          </div>
          <h1 className="text-5xl font-black text-[#003B6E] tracking-tight">Choose a Game</h1>
          <p className="text-[#64748B] mt-4 text-lg font-medium">
            {player
              ? <>Welcome back, <span className="font-bold text-[#003B6E]">{player.name}</span> — select an experience</>
              : 'Select an experience to begin'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {eventData.games.map(game => (
            <button
              key={game.gameId}
              onClick={() => handleGameClick(game)}
              className="group bg-white border border-[#E2E8F0] rounded-[32px] p-8 text-left transition-all duration-300 hover:border-[#00ADEF] hover:shadow-[0_20px_50px_rgba(0,173,239,0.12)] hover:-translate-y-1 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#F0F9FF] rounded-bl-[100px] -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-500 opacity-50" />
              <div className="relative z-10">
                <div className="w-16 h-16 bg-[#F8FAFC] rounded-2xl flex items-center justify-center text-4xl mb-6 shadow-sm border border-slate-100 group-hover:bg-[#00ADEF]/10 transition-colors">
                  {GAME_ICONS[game.type]}
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] text-[#00ADEF] font-black uppercase tracking-widest">{game.type}</span>
                  <div className="h-px w-8 bg-[#00ADEF]/20" />
                </div>
                <div className="text-2xl font-black text-[#003B6E] group-hover:text-[#00ADEF] transition-colors leading-tight">
                  {game.title}
                </div>
                <div className="mt-8 flex items-center text-xs font-bold text-[#64748B] uppercase tracking-widest">
                  Start Experience
                  <span className="ml-2 transform group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {player && (
          <div className="mt-12 text-center">
            <button
              onClick={handleNewPlayer}
              className="px-8 py-3 rounded-full border-2 border-[#003B6E]/20 text-sm text-[#003B6E]/50 hover:border-[#003B6E]/50 hover:text-[#003B6E] transition font-bold uppercase tracking-widest"
            >
              ↺ New Player
            </button>
          </div>
        )}

        <div className="mt-8 text-center">
          <p className="text-[10px] font-bold text-[#64748B]/40 uppercase tracking-[0.3em]">
            Takaful AI Summit · 2026 · Digital Agency Audit
          </p>
        </div>
      </div>
    </div>
  )
}
