'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import styles from '../admin.module.css'

const GAME_TYPES = ['QUIZ', 'AGENCY', 'MYTH', 'CROSSWORD', 'INTERVIEW']
const GAME_COLORS = {
  QUIZ: '#0ea5e9',
  AGENCY: '#10b981',
  MYTH: '#a855f7',
  CROSSWORD: '#f59e0b',
  INTERVIEW: '#6366f1'
}

export default function AdminGamesPage() {
  const router = useRouter()
  const [games, setGames] = useState([])
  const [eventId, setEventId] = useState(null)
  const [form, setForm] = useState({ title: '', type: 'QUIZ' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deleteId, setDeleteId] = useState(null)

  async function load() {
    try {
      const active = await api.getActiveGames()
      setEventId(active.eventId)
      const adminGames = await api.getAdminGames()
      setGames(adminGames)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function createGame(e) {
    e.preventDefault()
    setError(null)
    try {
      await api.createGame({ ...form, eventId })
      setForm({ title: '', type: 'QUIZ' })
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  async function toggleActive(game) {
    await api.updateGame(game._id, { isActive: !game.isActive })
    load()
  }

  async function confirmDelete() {
    if (!deleteId) return
    try {
      await api.deleteGame(deleteId)
      setGames(g => g.filter(x => String(x._id) !== deleteId))
    } catch (err) {
      setError(err.message)
    } finally {
      setDeleteId(null)
    }
  }

  return (
    <main className="animate-in fade-in duration-300">

      {/* DELETE MODAL */}
      {deleteId && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modal}>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <div className={styles.modalIcon}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </div>
            </div>
            <h3 className={styles.modalTitle}>Delete Challenge?</h3>
            <p className={styles.modalText}>Are you sure you want to remove this game engine? All associated content and sessions will be permanently lost.</p>
            <div className={styles.modalActions}>
              <button onClick={() => setDeleteId(null)} className={styles.btnCancel}>Cancel</button>
              <button onClick={confirmDelete} className={styles.btnDelete}>Delete Game</button>
            </div>
          </div>
        </div>
      )}

      {/* TOP HEADER */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.titleMain}>Game <span className={styles.titleBlue}>Dashboard</span></h1>
          <p className={styles.subtitle}>Configure and monitor active event challenges.</p>
        </div>

        <div className={styles.statusBadge}>
          <div className={styles.statusIndicator} style={{ backgroundColor: '#10b981' }} />
          <span style={{ fontSize: '10px', color: '#64748b' }}>ACTIVE ENVIRONMENTS:</span>
          <span style={{ color: '#0ea5e9', fontWeight: '700' }}>{games.length} LIVE</span>
        </div>
      </div>

      <div className={styles.grid}>

        {/* CREATE SIDEBAR */}
        <div className={`col-span-12 xl:col-span-4 ${styles.stickySidebar}`}>
          <div className={styles.card}>
            <div className={styles.cardTitle}>
              <svg className="w-5 h-5 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
              New Challenge
            </div>

            <form onSubmit={createGame} className={styles.formGroup}>
              <div className={styles.inputWrapper}>
                <label className={styles.label}>Challenge Title</label>
                <input
                  required
                  className={styles.input}
                  placeholder="e.g. Sales IQ"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                />
              </div>

              <div className={styles.inputWrapper}>
                <label className={styles.label}>Game Engine</label>
                <select
                  className={styles.input}
                  value={form.type}
                  onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                >
                  {GAME_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <button
                type="submit"
                disabled={!eventId || loading}
                className={styles.submitButton}
              >
                {loading ? 'Creating...' : 'Create Challenge'}
              </button>

              {!eventId && !loading && <p className="text-amber-500 text-[11px] font-bold text-center uppercase tracking-widest mt-2">No active event selected</p>}
              {error && <p className="text-red-500 text-[11px] font-bold text-center uppercase tracking-widest mt-2">{error}</p>}
            </form>
          </div>
        </div>

        {/* GAMES LIST */}
        <div className="col-span-12 xl:col-span-8">
          <h2 className={styles.listSectionTitle}>Registered Challenges ({games.length})</h2>

          {loading ? (
            <div className="flex items-center justify-center p-20">
              <div className="w-6 h-6 border-2 border-[#0ea5e9] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : games.length === 0 ? (
            <div className={styles.emptyState}>
              No challenges configured yet for this environment.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {games.map(game => (
                <div key={game._id} className={styles.card} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', minHeight: '220px' }}>
                  <div style={{ flex: 1 }}>
                    <div className="flex items-center justify-between mb-4">
                      <span className={styles.pillBadge} style={{
                        backgroundColor: game.isActive ? '#dcfce7' : '#f1f5f9',
                        color: game.isActive ? '#15803d' : '#64748b'
                      }}>
                        {game.isActive ? 'Active' : 'Offline'}
                      </span>
                      <span className={styles.pillBadge} style={{
                        backgroundColor: `${GAME_COLORS[game.type]}15`,
                        color: GAME_COLORS[game.type]
                      }}>
                        {game.type}
                      </span>
                    </div>

                    <h4 style={{ fontSize: '20px', fontWeight: '600', color: '#0f172a', marginBottom: '0.25rem' }}>{game.title}</h4>
                    <p style={{ fontSize: '10px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      ID: {String(game._id).slice(-6)}
                    </p>
                  </div>

                  <div className="mt-4 space-y-3">
                    <button
                      onClick={() => router.push(`/admin/manage?gameId=${game._id}`)}
                      className={styles.submitButton}
                      style={{ padding: '0.6rem', fontSize: '14px', background: '#0ea5e9' }}
                    >
                      Manage Content
                    </button>
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      <button onClick={() => toggleActive(game)} className={styles.activateButton} style={{ width: '100%', fontSize: '12px' }}>
                        {game.isActive ? 'Pause' : 'Play'}
                      </button>
                      <button onClick={() => router.push(`/admin/games/${game._id}`)} className={styles.activateButton} style={{ width: '100%', fontSize: '12px' }}>
                        Edit
                      </button>
                      <button onClick={() => setDeleteId(String(game._id))} className={styles.activateButton} style={{ width: '100%', color: '#ef4444', fontSize: '12px' }}>
                        Drop
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </main>
  )
}
