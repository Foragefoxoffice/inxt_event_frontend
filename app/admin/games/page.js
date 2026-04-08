'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'

const GAME_TYPES = ['QUIZ', 'AGENCY', 'MYTH', 'CROSSWORD', 'INTERVIEW']
const GAME_COLORS = { QUIZ: 'text-blue-400', AGENCY: 'text-emerald-400', MYTH: 'text-purple-400', CROSSWORD: 'text-amber-400', INTERVIEW: 'text-orange-500' }

export default function AdminGamesPage() {
  const router = useRouter()
  const [games, setGames] = useState([])
  const [eventId, setEventId] = useState(null)
  const [form, setForm] = useState({ title: '', type: 'QUIZ' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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

  async function deleteGame(id) {
    if (!confirm('Delete this game and all its questions and sessions?')) return
    await api.deleteGame(id)
    setGames(g => g.filter(x => String(x._id) !== id))
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/admin')} className="text-slate-400 hover:text-white transition text-sm">
            ← Back
          </button>
          <h1 className="text-3xl font-bold">Games</h1>
        </div>

        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
          <h2 className="text-xl font-bold mb-4">Create Game</h2>
          <form onSubmit={createGame} className="flex gap-3 flex-wrap">
            <input
              className="flex-1 min-w-48 bg-slate-700 border border-slate-600 rounded-xl px-4 py-2 outline-none focus:border-blue-500 transition text-white"
              placeholder="Game title"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              required
            />
            <select
              className="bg-slate-700 border border-slate-600 rounded-xl px-4 py-2 outline-none text-white"
              value={form.type}
              onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
            >
              {GAME_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <button type="submit" disabled={!eventId} className="bg-green-600 hover:bg-green-500 disabled:opacity-50 px-5 py-2 rounded-xl transition font-semibold">
              Create
            </button>
          </form>
          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
          {!eventId && !loading && <p className="text-amber-400 text-sm mt-2">No active event. Activate one in Admin first.</p>}
        </div>

        <div className="space-y-3">
          {loading ? (
            <p className="text-slate-400">Loading...</p>
          ) : games.length === 0 ? (
            <p className="text-slate-500">No games yet.</p>
          ) : (
            games.map(game => (
              <div key={game._id} className="flex items-center justify-between bg-slate-800 border border-slate-700 rounded-xl px-5 py-4">
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold ${GAME_COLORS[game.type]}`}>{game.type}</span>
                  <span className="font-semibold text-lg text-white">{game.title}</span>
                  {!game.isActive && <span className="text-xs text-slate-500 bg-slate-700 px-2 py-0.5 rounded">inactive</span>}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => toggleActive(game)} className="text-xs bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded-lg transition">
                    {game.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button onClick={() => router.push(`/admin/games/${game._id}`)} className="text-xs bg-slate-700 hover:bg-blue-600 px-3 py-1.5 rounded-lg transition">
                    Edit
                  </button>
                  <button onClick={() => deleteGame(String(game._id))} className="text-xs bg-slate-700 hover:bg-red-600 px-3 py-1.5 rounded-lg transition">
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
