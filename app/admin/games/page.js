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
    <main className="p-10 animate-in fade-in duration-500">
      
      {/* TOP HEADER */}
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-4xl font-black text-[#003B6E] tracking-tight uppercase">Game <span className="text-[#00ADEF]">Dashboard</span></h1>
          <p className="text-sm text-[#003B6E]/40 font-bold uppercase tracking-widest mt-1">Configure and monitor active event challenges</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#003B6E]/30">Active Environments</p>
            <p className="text-xs font-bold text-[#00ADEF]">{games.length} Games Live</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-10">
        
        {/* CREATE SIDEBAR */}
        <div className="col-span-12 xl:col-span-4">
          <div className="bg-white rounded-3xl p-8 shadow-xl shadow-[#003B6E]/5 border border-[#00ADEF]/10 sticky top-10">
            <h3 className="text-xs font-black tracking-[0.3em] text-[#00ADEF] uppercase mb-8 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
              New Challenge
            </h3>
            
            <form onSubmit={createGame} className="space-y-6">
              <div>
                <label className="block text-[10px] text-[#003B6E]/40 uppercase font-black tracking-widest mb-2">Challenge Title</label>
                <input
                  required
                  className="w-full bg-[#F8FBFF] border border-[#E2E8F0] rounded-2xl px-5 py-4 text-sm font-bold text-[#003B6E] outline-none focus:border-[#00ADEF] transition-all"
                  placeholder="e.g. Sales IQ"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-[10px] text-[#003B6E]/40 uppercase font-black tracking-widest mb-2">Game Engine</label>
                <select
                  className="w-full bg-[#F8FBFF] border border-[#E2E8F0] rounded-2xl px-5 py-4 text-sm font-bold text-[#003B6E] outline-none focus:border-[#00ADEF] appearance-none"
                  value={form.type}
                  onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                >
                  {GAME_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <button 
                type="submit" 
                disabled={!eventId}
                className="w-full bg-[#050e1a] hover:bg-[#00ADEF] text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-lg shadow-black/10 transition-all active:scale-95 disabled:opacity-30"
              >
                Create Challenge
              </button>
              
              {!eventId && !loading && <p className="text-amber-500 text-[10px] font-bold text-center uppercase tracking-widest">No active event selected</p>}
              {error && <p className="text-red-500 text-[10px] font-bold text-center uppercase tracking-widest">{error}</p>}
            </form>
          </div>
        </div>

        {/* GAMES LIST */}
        <div className="col-span-12 xl:col-span-8 space-y-4">
          {loading ? (
            <div className="p-20 text-center"><div className="w-10 h-10 border-2 border-[#00ADEF] border-t-transparent rounded-full animate-spin mx-auto" /></div>
          ) : games.length === 0 ? (
            <div className="bg-white rounded-3xl p-20 text-center border border-dashed border-[#00ADEF]/20">
              <p className="text-[#003B6E]/20 text-xs font-black uppercase tracking-widest">No challenges configured yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {games.map(game => (
                <div key={game._id} className="bg-white rounded-3xl p-8 border border-[#00ADEF]/10 shadow-sm hover:shadow-xl hover:border-[#00ADEF]/40 transition-all group flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border ${
                        game.isActive ? 'bg-[#7BC242]/10 text-[#7BC242] border-[#7BC242]/20' : 'bg-slate-100 text-slate-400 border-slate-200'
                      }`}>
                        {game.isActive ? 'Active' : 'Offline'}
                      </span>
                      <span className={`text-[10px] font-black uppercase tracking-widest ${GAME_COLORS[game.type]}`}>{game.type}</span>
                    </div>
                    
                    <h4 className="text-2xl font-black text-[#003B6E] tracking-tight group-hover:text-[#00ADEF] transition-colors mb-2">{game.title}</h4>
                    <p className="text-[10px] font-bold text-[#003B6E]/30 uppercase tracking-widest mb-8">System ID: {String(game._id).slice(-6)}</p>
                  </div>

                  <div className="space-y-3">
                    <button 
                      onClick={() => router.push(`/admin/manage?gameId=${game._id}`)}
                      className="w-full bg-[#00ADEF] hover:bg-[#0096D1] text-white py-3 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-[#00ADEF]/20 transition-all"
                    >
                      Manage Content
                    </button>
                    <div className="grid grid-cols-3 gap-2">
                       <button onClick={() => toggleActive(game)} className="bg-[#F8FBFF] hover:bg-slate-100 text-[#003B6E] text-[9px] font-black py-2.5 rounded-xl uppercase tracking-widest border border-[#E2E8F0]">
                        {game.isActive ? 'Pause' : 'Play'}
                      </button>
                      <button onClick={() => router.push(`/admin/games/${game._id}`)} className="bg-[#F8FBFF] hover:bg-slate-100 text-[#003B6E] text-[9px] font-black py-2.5 rounded-xl uppercase tracking-widest border border-[#E2E8F0]">
                        Edit
                      </button>
                      <button onClick={() => deleteGame(String(game._id))} className="bg-red-50 hover:bg-red-100 text-red-500 text-[9px] font-black py-2.5 rounded-xl uppercase tracking-widest border border-red-200/50 transition-colors">
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
