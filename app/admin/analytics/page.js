'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'

const METRICS_CFG = {
  revenue: { label: 'Revenue', color: 'text-emerald-400' },
  productivity: { label: 'Productivity', color: 'text-blue-400' },
  conversion: { label: 'Conversion', color: 'text-purple-400' },
  persistency: { label: 'Persistency', color: 'text-amber-400' }
}

export default function AdminAnalyticsPage() {
  const router = useRouter()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const active = await api.getActiveGames()
        const stats = await api.getStats(active.eventId)
        setData(stats)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-red-400">
        {error}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/admin')} className="text-slate-400 hover:text-white transition text-sm">
            ← Back
          </button>
          <h1 className="text-3xl font-bold">Analytics</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-800 rounded-2xl p-8 text-center border border-slate-700">
            <p className="text-slate-400 text-sm uppercase tracking-wider">Total Players</p>
            <p className="text-7xl font-black text-white mt-3">{data.totalPlayers}</p>
          </div>
          <div className="bg-slate-800 rounded-2xl p-8 text-center border border-slate-700">
            <p className="text-slate-400 text-sm uppercase tracking-wider">Games Running</p>
            <p className="text-7xl font-black text-white mt-3">{data.games.length}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {data.games.map(game => (
            <div key={game.gameId} className="bg-slate-800 rounded-2xl p-6 border border-slate-700 space-y-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-400">{game.gameType}</span>
                <h2 className="text-xl font-bold text-white mt-0.5">{game.title}</h2>
                <p className="text-slate-400 text-sm mt-1">{game.totalSubmissions} submissions</p>
              </div>

              {game.gameType === 'QUIZ' && (
                <div>
                  <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">AI Match Rate</p>
                  <p className="text-5xl font-black text-blue-400">{game.aiMatchPercent}%</p>
                  <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${game.aiMatchPercent}%` }} />
                  </div>
                </div>
              )}

              {game.gameType === 'AGENCY' && game.avgMetrics && (
                <div>
                  <p className="text-slate-400 text-xs uppercase tracking-wider mb-3">Average Metrics</p>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(game.avgMetrics).map(([m, v]) => (
                      <div key={m} className="bg-slate-700 rounded-xl p-3">
                        <p className="text-slate-400 text-xs">{METRICS_CFG[m]?.label}</p>
                        <p className={`text-2xl font-black ${METRICS_CFG[m]?.color}`}>{v}%</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {game.gameType === 'CROSSWORD' && (
                <div>
                  <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Full Completions</p>
                  <p className="text-5xl font-black text-amber-400">{game.totalCompletions}</p>
                </div>
              )}

              {game.gameType === 'MYTH' && game.questionStats?.length > 0 && (
                <div>
                  <div className="mb-6">
                    <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Average Correct Rate</p>
                    <p className="text-5xl font-black text-purple-400">{game.avgScore || 0}%</p>
                  </div>
                  <p className="text-slate-400 text-xs uppercase tracking-wider mb-3">Answer Distribution</p>
                  <div className="space-y-2">
                    {game.questionStats.map((qs, i) => {
                      const total = (qs.trueCount + qs.falseCount) || 1
                      const truePct = Math.round((qs.trueCount / total) * 100)
                      return (
                        <div key={i} className="bg-slate-700 rounded-lg p-3">
                          <p className="text-slate-400 text-xs mb-2">Question {i + 1}</p>
                          <div className="flex gap-4 text-sm">
                            <span className="text-green-400 font-bold">True: {qs.trueCount} ({truePct}%)</span>
                            <span className="text-red-400 font-bold">False: {qs.falseCount} ({100 - truePct}%)</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
