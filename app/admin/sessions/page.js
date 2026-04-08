'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'

const GAME_COLORS = { QUIZ: 'text-blue-400', AGENCY: 'text-emerald-400', MYTH: 'text-purple-400', CROSSWORD: 'text-amber-400' }

export default function AdminSessionsPage() {
  const router = useRouter()
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getAdminSessions().then(data => { setSessions(data); setLoading(false) })
  }, [])

  async function resetSession(id) {
    if (!confirm('Delete this player session? They will be able to replay the game.')) return
    await api.deleteSession(id)
    setSessions(s => s.filter(x => String(x._id) !== id))
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/admin')} className="text-slate-400 hover:text-white transition text-sm">
            ← Back
          </button>
          <h1 className="text-3xl font-bold">Player Sessions</h1>
          <span className="text-slate-400 text-sm">{sessions.length} total</span>
        </div>

        {loading ? (
          <p className="text-slate-400">Loading...</p>
        ) : sessions.length === 0 ? (
          <p className="text-slate-500">No sessions yet.</p>
        ) : (
          <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-slate-400 text-left border-b border-slate-700 bg-slate-800/80">
                    <th className="px-5 py-4">Player</th>
                    <th className="px-5 py-4">Company</th>
                    <th className="px-5 py-4">Game</th>
                    <th className="px-5 py-4">Score</th>
                    <th className="px-5 py-4">Submitted</th>
                    <th className="px-5 py-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {sessions.map(s => (
                    <tr key={s._id} className="hover:bg-slate-700/30 transition">
                      <td className="px-5 py-4 font-semibold text-white">{s.userId?.name || '—'}</td>
                      <td className="px-5 py-4 text-slate-400">{s.userId?.company || '—'}</td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-bold uppercase ${GAME_COLORS[s.gameType]}`}>
                          {s.gameType}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-bold text-white">{s.result?.score ?? '—'}%</td>
                      <td className="px-5 py-4 text-slate-400 text-xs">
                        {new Date(s.completedAt).toLocaleString()}
                      </td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => resetSession(String(s._id))}
                          className="text-red-400 hover:text-red-300 text-xs transition"
                        >
                          Reset
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
