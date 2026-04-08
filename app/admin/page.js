'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'

export default function AdminPage() {
  const router = useRouter()
  const [events, setEvents] = useState([])
  const [form, setForm] = useState({ name: '', slug: '' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function load() {
    api.getEvents().then(data => { setEvents(data); setLoading(false) })
  }

  useEffect(() => { load() }, [])

  async function createEvent(e) {
    e.preventDefault()
    setError(null)
    try {
      await api.createEvent(form)
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

  return (
    <div className="min-h-screen bg-[#F0F9FF] text-[#003B6E] p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-black uppercase tracking-tight">Admin Dashboard</h1>
          <div className="flex gap-3 flex-wrap justify-end">
            <button onClick={() => router.push('/admin/manage')} className="bg-[#00ADEF] hover:bg-[#0096D1] text-white px-4 py-2 rounded-lg transition text-sm font-bold shadow-lg shadow-[#00ADEF]/20">
              Manage Questions
            </button>
            <button onClick={() => router.push('/admin/games')} className="bg-white hover:bg-[#F8FBFF] border border-[#00ADEF]/10 px-4 py-2 rounded-lg transition text-sm font-bold text-[#003B6E] shadow-sm">
              Games
            </button>
            <button onClick={() => router.push('/admin/sessions')} className="bg-white hover:bg-[#F8FBFF] border border-[#00ADEF]/10 px-4 py-2 rounded-lg transition text-sm font-bold text-[#003B6E] shadow-sm">
              Sessions
            </button>
            <button onClick={() => router.push('/admin/analytics')} className="bg-white hover:bg-[#F8FBFF] border border-[#00ADEF]/10 px-4 py-2 rounded-lg transition text-sm font-bold text-[#003B6E] shadow-sm">
              Analytics
            </button>
            <button onClick={() => router.push('/screen')} className="bg-white hover:bg-[#F8FBFF] border border-[#00ADEF]/10 px-4 py-2 rounded-lg transition text-sm font-bold text-[#003B6E] shadow-sm">
              Live Screen
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-[#00ADEF]/10 shadow-lg shadow-[#00ADEF]/5">
          <h2 className="text-xl font-bold mb-4">Create New Event</h2>
          <form onSubmit={createEvent} className="flex gap-3 flex-wrap">
            <input
              className="flex-1 min-w-48 bg-[#F8FBFF] border border-[#E2E8F0] rounded-xl px-4 py-2 outline-none focus:border-[#00ADEF] transition text-[#003B6E]"
              placeholder="Event name (e.g. INXT 2026)"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              required
            />
            <input
              className="flex-1 min-w-36 bg-[#F8FBFF] border border-[#E2E8F0] rounded-xl px-4 py-2 outline-none focus:border-[#00ADEF] transition text-[#003B6E]"
              placeholder="slug (e.g. inxt-2026)"
              value={form.slug}
              onChange={e => setForm(f => ({ ...f, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))}
              required
            />
            <button type="submit" className="bg-[#7BC242] hover:bg-[#6AB232] text-white px-5 py-2 rounded-xl transition font-black uppercase tracking-widest text-sm shadow-md">
              Create
            </button>
          </form>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>

        <div className="bg-white rounded-2xl p-6 border border-[#00ADEF]/10 shadow-lg shadow-[#00ADEF]/5">
          <h2 className="text-xl font-bold mb-4">Events</h2>
          {loading ? (
            <p className="text-[#003B6E]/30">Loading...</p>
          ) : events.length === 0 ? (
            <p className="text-[#003B6E]/30">No events yet. Create one above.</p>
          ) : (
            <div className="space-y-3">
              {events.map(event => (
                <div key={event._id} className="flex items-center justify-between bg-[#F8FBFF] border border-[#00ADEF]/5 rounded-xl px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div>
                      <span className="font-bold text-[#003B6E]">{event.name}</span>
                      <span className="text-[#003B6E]/40 text-sm ml-2">/{event.slug}</span>
                    </div>
                    {event.isActive && (
                      <span className="text-xs bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-0.5 rounded-full font-bold">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  {!event.isActive && (
                    <button
                      onClick={() => activateEvent(event._id)}
                      className="text-sm bg-slate-600 hover:bg-blue-600 px-4 py-1.5 rounded-lg transition"
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
    </div>
  )
}
