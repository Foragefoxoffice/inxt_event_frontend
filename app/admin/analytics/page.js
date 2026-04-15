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
    <main className="p-10 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-4xl font-black text-[#003B6E] tracking-tight uppercase">Live <span className="text-[#00ADEF]">Analytics</span></h1>
          <p className="text-sm text-[#003B6E]/40 font-bold uppercase tracking-widest mt-1">Real-time performance metrics and engagement insights</p>
        </div>
        
        <div className="flex bg-white p-2 rounded-2xl shadow-sm border border-[#00ADEF]/10">
          <div className="flex items-center gap-2 px-4 py-2">
            <span className="w-2 h-2 rounded-full bg-[#7BC242] animate-pulse" />
            <span className="text-[10px] font-black text-[#7BC242] uppercase tracking-widest">Live Flow</span>
          </div>
        </div>
      </div>

      {/* TOP METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="bg-white rounded-[32px] p-8 shadow-xl shadow-[#003B6E]/5 border border-[#00ADEF]/10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
            <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          </div>
          <p className="text-[10px] font-black text-[#003B6E]/30 uppercase tracking-[0.2em] mb-4">Unique Participants</p>
          <p className="text-6xl font-black text-[#003B6E] tracking-tighter">{data.totalPlayers}</p>
          <div className="mt-4 flex items-center gap-2 text-[#7BC242]">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
            <span className="text-[10px] font-black uppercase tracking-widest">Active Scale</span>
          </div>
        </div>

        <div className="bg-[#050e1a] rounded-[32px] p-8 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity">
            <svg className="w-24 h-24 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-4">Engaged Engines</p>
          <p className="text-6xl font-black text-white tracking-tighter">{data.games.length}</p>
          <div className="mt-4 flex items-center gap-2 text-[#00ADEF]">
            <span className="text-[10px] font-black uppercase tracking-widest">System Operational</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#00ADEF] to-[#0096D1] rounded-[32px] p-8 shadow-xl shadow-[#00ADEF]/20 relative overflow-hidden">
          <p className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em] mb-4">Global Response Rate</p>
          <p className="text-6xl font-black text-white tracking-tighter">84<span className="text-2xl ml-1 opacity-60">%</span></p>
          <div className="mt-4 w-full bg-white/20 rounded-full h-1.5 overflow-hidden">
            <div className="bg-white h-full w-[84%] rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
          </div>
        </div>
      </div>

      {/* GAME SPECIFIC CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {data.games.map(game => (
          <div key={game.gameId} className="bg-white rounded-[32px] p-8 border border-[#00ADEF]/10 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
            <div className="flex items-start justify-between mb-8">
              <div>
                <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg ${
                  game.gameType === 'QUIZ' ? 'bg-[#00ADEF]/10 text-[#00ADEF]' :
                  game.gameType === 'AGENCY' ? 'bg-[#7BC242]/10 text-[#7BC242]' : 'bg-purple-500/10 text-purple-500'
                }`}>
                  {game.gameType} Challenge
                </span>
                <h3 className="text-2xl font-black text-[#003B6E] tracking-tight mt-3">{game.title}</h3>
                <p className="text-[10px] font-bold text-[#003B6E]/30 uppercase tracking-widest mt-1">{game.totalSubmissions} Total Engagements</p>
              </div>
            </div>

            {game.gameType === 'QUIZ' && (
              <div className="bg-[#F8FBFF] rounded-2xl p-6 border border-[#00ADEF]/5">
                <div className="flex items-end justify-between mb-4">
                  <div>
                    <p className="text-[10px] font-black text-[#003B6E]/40 uppercase tracking-widest mb-1">AI Alignment Score</p>
                    <p className="text-4xl font-black text-[#00ADEF]">{game.aiMatchPercent}%</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-[#7BC242] uppercase tracking-[0.2em]">High Correlation</p>
                  </div>
                </div>
                <div className="w-full bg-[#00ADEF]/10 rounded-full h-2">
                  <div className="bg-[#00ADEF] h-full rounded-full shadow-[0_0_15px_rgba(0,173,239,0.3)] transition-all duration-1000" style={{ width: `${game.aiMatchPercent}%` }} />
                </div>
              </div>
            )}

            {game.gameType === 'AGENCY' && game.avgMetrics && (
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(game.avgMetrics).map(([m, v]) => (
                  <div key={m} className="bg-[#F8FBFF] rounded-2xl p-5 border border-[#00ADEF]/5 hover:border-[#00ADEF]/20 transition-all">
                    <p className="text-[10px] font-black text-[#003B6E]/30 uppercase tracking-widest mb-1">{m}</p>
                    <p className="text-2xl font-black text-[#003B6E]">{v}%</p>
                    <div className="mt-2 w-full bg-[#003B6E]/5 rounded-full h-1 overflow-hidden">
                      <div className="bg-[#7BC242] h-full rounded-full" style={{ width: `${v}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {game.gameType === 'CROSSWORD' && (
              <div className="flex items-center gap-10">
                <div className="flex-1">
                  <p className="text-[10px] font-black text-[#003B6E]/30 uppercase tracking-widest mb-2">Completions</p>
                  <p className="text-6xl font-black text-amber-500 tracking-tighter">{game.totalCompletions}</p>
                </div>
                <div className="w-24 h-24 bg-amber-500/10 rounded-full flex items-center justify-center">
                   <svg className="w-10 h-10 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
              </div>
            )}

            {game.gameType === 'MYTH' && (
              <div className="space-y-6">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[10px] font-black text-[#003B6E]/30 uppercase tracking-widest mb-1">Average Consensus</p>
                    <p className="text-5xl font-black text-purple-600">{game.avgScore || 0}%</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-[9px] font-black text-[#003B6E]/20 uppercase tracking-[0.2em]">Response Distribution</p>
                  <div className="grid grid-cols-4 gap-2">
                    {game.questionStats?.map((_, i) => (
                      <div key={i} className="h-10 bg-[#F8FBFF] rounded-lg border border-[#00ADEF]/5 flex items-center justify-center font-black text-[#003B6E]/20 text-[10px]">Q{i+1}</div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  )
}
