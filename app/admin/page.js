'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'

export default function AdminPage() {
  const router = useRouter()
  const [events, setEvents] = useState([])
  const [form, setForm] = useState({ name: '', slug: '' })
  const [copyFromActive, setCopyFromActive] = useState(true)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function load() {
    try {
      const data = await api.getEvents()
      setEvents(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const activeEvent = events.find(event => event.isActive) || null

  async function createEvent(e) {
    e.preventDefault()
    setError(null)
    try {
      await api.createEvent({
        ...form,
        cloneFromEventId: copyFromActive && activeEvent ? activeEvent._id : undefined
      })
      setForm({ name: '', slug: '' })
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  async function activateEvent(id) {
    await api.activateEvent(id)
    load()
  }

  const navItems = [
    { label: 'Event Center', path: '/admin', active: true, icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
    { label: 'Manage Content', path: '/admin/manage', icon: 'M11 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-5m-5 5l8.5-8.5a2.121 2.121 0 00-3-3L9 7l5 5z' },
    { label: 'Game Dashboard', path: '/admin/games', icon: 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { label: 'Session Records', path: '/admin/sessions', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    { label: 'Live Analytics', path: '/admin/analytics', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    { label: 'Live Screen', path: '/screen', icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
  ]

  return (
    <main className="p-10 animate-in fade-in duration-500">
      
      {/* TOP BAR */}
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-4xl font-black text-[#003B6E] tracking-tight uppercase">Event <span className="text-[#00ADEF]">Center</span></h1>
          <p className="text-sm text-[#003B6E]/40 font-bold uppercase tracking-widest mt-1">Manage global event states and content inheritance</p>
        </div>
        
        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-[#00ADEF]/10">
          <div className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-[0.2em] uppercase ${activeEvent ? 'bg-[#7BC242]/10 text-[#7BC242]' : 'bg-red-500/10 text-red-500'}`}>
            System Status: {activeEvent ? 'LIVE' : 'IDLE'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-10">
        
        {/* CREATE BOX */}
        <div className="col-span-12 xl:col-span-5">
          <div className="bg-white rounded-3xl p-8 shadow-xl shadow-[#003B6E]/5 border border-[#00ADEF]/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
              <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 4V20M20 12H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            </div>

            <h2 className="text-xs font-black tracking-[0.3em] text-[#00ADEF] uppercase mb-8">Initialize New Event</h2>
            
            <form onSubmit={createEvent} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] text-[#003B6E]/40 uppercase font-black tracking-widest mb-2">Display Name</label>
                  <input
                    required
                    className="w-full bg-[#F8FBFF] border border-[#E2E8F0] rounded-2xl px-5 py-4 text-sm font-bold text-[#003B6E] outline-none focus:border-[#00ADEF] transition-all"
                    placeholder="e.g. Takaful Summit 2026"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-[#003B6E]/40 uppercase font-black tracking-widest mb-2">System Slug</label>
                  <input
                    required
                    className="w-full bg-[#F8FBFF] border border-[#E2E8F0] rounded-2xl px-5 py-4 text-sm font-mono text-[#00ADEF] outline-none focus:border-[#00ADEF] transition-all"
                    placeholder="takaful-2026"
                    value={form.slug}
                    onChange={e => setForm(f => ({ ...f, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))}
                  />
                </div>
              </div>

              <label className="flex items-center gap-3 p-4 rounded-2xl bg-[#7BC242]/5 border border-[#7BC242]/10 cursor-pointer group transition-all hover:bg-[#7BC242]/10">
                <input
                  type="checkbox"
                  className="w-5 h-5 rounded-lg border-[#7BC242]/30 text-[#7BC242] focus:ring-offset-0 focus:ring-0"
                  checked={copyFromActive && !!activeEvent}
                  onChange={e => setCopyFromActive(e.target.checked)}
                  disabled={!activeEvent}
                />
                <div>
                  <p className="text-[11px] font-black text-[#003B6E] uppercase tracking-wide">Inherit Content</p>
                  <p className="text-[9px] text-[#003B6E]/40 uppercase font-bold tracking-widest">Clone all games/questions from active</p>
                </div>
              </label>

              <button type="submit" className="w-full bg-linear-to-r from-[#7BC242] to-[#6AB232] text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-lg shadow-[#7BC242]/20 transition-transform active:scale-95">
                Deploy Event
              </button>
              {error && <p className="text-red-500 text-[10px] font-bold text-center uppercase tracking-widest">{error}</p>}
            </form>
          </div>
        </div>

        {/* LIST BOX */}
        <div className="col-span-12 xl:col-span-7 space-y-6">
          <h2 className="text-xs font-black tracking-[0.3em] text-[#003B6E]/40 uppercase px-2">Registered Environments</h2>
          
          {loading ? (
            <div className="flex items-center justify-center p-20">
              <div className="w-8 h-8 border-2 border-[#00ADEF] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : events.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-[#00ADEF]/20">
              <p className="text-[#003B6E]/30 text-sm font-bold uppercase tracking-widest text-center">No active environments found</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {events.map(event => (
                <div key={event._id} className={`bg-white rounded-3xl p-6 border transition-all flex items-center justify-between group ${event.isActive ? 'border-[#7BC242] shadow-xl shadow-[#7BC242]/5' : 'border-[#00ADEF]/10 hover:border-[#00ADEF]/40 shadow-sm'}`}>
                  <div className="flex items-center gap-6">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${event.isActive ? 'bg-[#7BC242]/10 text-[#7BC242]' : 'bg-[#F8FBFF] text-[#00ADEF]/30'}`}>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-7h.01M9 16h.01M15 16h.01M12 12h.01M12 16h.01M12 8h.01" /></svg>
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <p className="font-black text-xl text-[#003B6E]">{event.name}</p>
                        {event.isActive && (
                          <span className="bg-[#7BC242] text-white text-[8px] font-black px-2 py-0.5 rounded tracking-[0.2em]">ACTIVE</span>
                        )}
                      </div>
                      <p className="text-[10px] font-mono text-[#00ADEF] uppercase tracking-widest mt-1 opacity-60">/{event.slug}</p>
                    </div>
                  </div>

                  {!event.isActive && (
                    <button
                      onClick={() => activateEvent(event._id)}
                      className="bg-[#050e1a] hover:bg-[#00ADEF] text-white text-[10px] font-black px-6 py-3 rounded-xl transition-all uppercase tracking-widest"
                    >
                      Activate
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </main>
  )
}
