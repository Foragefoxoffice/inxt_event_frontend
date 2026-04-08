'use client'

import { useState, useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import { api } from '@/lib/api'

export default function ScreenPage() {
  const [statsData, setStatsData] = useState(null)
  const [leaderboards, setLeaderboards] = useState({})
  const [winner, setWinner] = useState(null)
  const socketRef = useRef(null)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    async function init() {
      try {
        const active = await api.getActiveGames()
        const stats = await api.getStats(active.eventId)
        setStatsData(stats)

        // Load initial leaderboards
        for (const game of active.games) {
          api.getLeaderboard(game.gameId).then(lb => {
            setLeaderboards(prev => ({ ...prev, [game.gameId]: lb }))
          })
        }

        // Socket (Prioritize dedicated socket URL if provided, otherwise fallback to API URL)
        const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000')
        socketRef.current = socket
        socket.on('connect', () => socket.emit('join:event', String(active.eventId)))

        socket.on('stats:update', ({ gameId, stats: updatedStats }) => {
          setStatsData(prev => {
            if (!prev) return prev
            return {
              ...prev,
              games: prev.games.map(g =>
                String(g.gameId) === String(gameId)
                  ? {
                    ...g,
                    totalSubmissions: updatedStats.totalSubmissions,
                    aiMatchPercent: updatedStats.aiMatchPercent,
                    totalCompletions: updatedStats.totalCompletions,
                    avgMetrics: updatedStats.avgMetrics
                  }
                  : g
              )
            }
          })
        })

        socket.on('leaderboard:update', ({ gameId, top5 }) => {
          setLeaderboards(prev => ({
            ...prev,
            [gameId]: { entries: top5 }
          }))
        })

        socket.on('player:joined', () => {
          setStatsData(prev => prev ? { ...prev, totalPlayers: (prev.totalPlayers || 0) + 1 } : prev)
        })

        socket.on('crossword:winner', setWinner)
      } catch (err) {
        console.error('Screen init failed:', err.message)
      }
    }

    init()
    return () => socketRef.current?.disconnect()
  }, [])

  if (!statsData) {
    return (
      <div className="min-h-screen bg-[#F0F9FF] flex items-center justify-center text-[#003B6E]">
        <div className="text-center space-y-6">
          <div className="w-12 h-12 border-2 border-[#00ADEF] border-t-transparent rounded-full animate-spin mx-auto shadow-lg shadow-[#00ADEF]/10" />
          <p className="text-[#00ADEF] font-black tracking-widest uppercase text-xs animate-pulse">Syncing SalesVerse Dashboard...</p>
        </div>
      </div>
    )
  }

  const activeGames = statsData.games
  const agencyGame = activeGames.find(g => g.gameType === 'AGENCY')
  const mythGame = activeGames.find(g => g.gameType === 'MYTH')
  const crosswordGame = activeGames.find(g => g.gameType === 'CROSSWORD')
  const interviewGame = activeGames.find(g => g.gameType === 'INTERVIEW')

  const lbAgency = leaderboards[agencyGame?.gameId]?.entries || []
  const lbCrossword = leaderboards[crosswordGame?.gameId]?.entries || []
  const lbMyth = leaderboards[mythGame?.gameId]?.entries || []

  const formattedDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  return (
    <div className="min-h-screen bg-[#F0F9FF] text-[#003B6E] font-sans flex flex-col overflow-hidden selection:bg-[#00ADEF]/20">

      {/* 1. TOP HEADER BAR */}
      <header className="px-8 py-6 flex items-center justify-between border-b border-[#00ADEF]/10 relative z-10 bg-[#00ADEF] shadow-sm">
        <div className="flex items-center gap-6">
          {/* Logo */}
          <div className="flex items-center">
            <img src="/logo_shield.png" alt="iorta TECHNXT" className="h-10 w-auto" />
          </div>
        </div>

        <div className="text-center absolute left-1/2 -translate-x-1/2">
          <div className="text-[10px] uppercase font-black tracking-[0.3em] text-[#ffff] mb-1">MTA × TIC 2026 · KUALA LUMPUR, MALAYSIA</div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-[#003B6E]">SalesVerse <span className="text-[#ffff]">Challenge</span> — Live Scores</h1>
          <p className="text-[9px] font-bold text-[#ffff]/40 uppercase tracking-widest">{formattedDate}</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-[#7BC242]/10 px-3 py-1.5 rounded-full border border-[#7BC242]/20">
            <div className="w-2 h-2 rounded-full bg-[#ffff] animate-pulse" />
            <span className="text-[10px] font-black text-[#ffff] tracking-widest uppercase">LIVE</span>
          </div>
          <button className="bg-[#ffff] text-[#003B6E] px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest shadow-lg shadow-[#00ADEF]/20 transition-transform active:scale-95">
            Update Scores
          </button>
        </div>
      </header>

      {/* 2. TICKER BAR */}
      <div className="bg-[#FFFFFF] border-b border-[#00ADEF]/10 py-3 px-8 flex items-center overflow-hidden whitespace-nowrap shadow-sm z-[5]">
       
        <div className="flex items-center gap-10 animate-marquee">
          <div className="flex items-center gap-2">
            <span className="text-[#003B6E]/40 text-[10px] uppercase font-bold tracking-widest">Top Scenario:</span>
            <span className="text-[#003B6E] font-black text-xs uppercase tracking-tight">Lead Prioritisation</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#003B6E]/40 text-[10px] uppercase font-bold tracking-widest">Crossword winners:</span>
            <span className="text-[#00ADEF] font-black text-xs uppercase tracking-tight">{lbCrossword.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#003B6E]/40 text-[10px] uppercase font-bold tracking-widest">Beat the AI:</span>
            <span className="text-[#00ADEF] font-black text-xs uppercase tracking-tight">{lbMyth.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#003B6E]/40 text-[10px] uppercase font-bold tracking-widest">Diagnostics done:</span>
            <span className="text-[#00ADEF] font-black text-xs uppercase tracking-tight">{agencyGame?.totalSubmissions || 0}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#003B6E]/40 text-[10px] uppercase font-bold tracking-widest">Players today:</span>
            <span className="text-[#00ADEF] font-black text-xs uppercase tracking-tight">{statsData.totalPlayers}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#003B6E]/40 text-[10px] uppercase font-bold tracking-widest">Agreed with AI:</span>
            <span className="text-[#7BC242] font-black text-xs uppercase tracking-tight">{mythGame?.aiMatchPercent || 0}%</span>
          </div>
          {/* Repeating for seamless marquee */}
          <div className="flex items-center gap-10 ml-10">
            <div className="flex items-center gap-2"><span className="text-[#003B6E]/40 text-[10px] uppercase font-bold tracking-widest">Top Scenario:</span><span className="text-[#003B6E] font-black text-xs uppercase tracking-tight">Lead Prioritisation</span></div>
            <div className="flex items-center gap-2"><span className="text-[#003B6E]/40 text-[10px] uppercase font-bold tracking-widest">Crossword winners:</span><span className="text-[#00ADEF] font-black text-xs uppercase tracking-tight">3</span></div>
          </div>
        </div>
      </div>

      {/* 3. MAIN CONTENT GRID */}
      <main className="flex-1 p-8 grid grid-cols-12 gap-8 overflow-hidden z-0">

        {/* LEFT COLUMN (Intelligence) */}
        <div className="col-span-12 lg:col-span-6 flex flex-col gap-8">

          {/* AI VS HUMAN RESULTS */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black tracking-[0.2em] text-[#00ADEF] uppercase opacity-50">AI VS HUMAN RESULTS</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 bg-white rounded-3xl border border-[#00ADEF]/10 p-10 flex flex-col items-center justify-center relative shadow-xl shadow-[#003B6E]/5">
                <div className="text-8xl font-black text-[#00ADEF] leading-none mb-2 tracking-tighter tabular-nums">{statsData.totalPlayers}</div>
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#003B6E]/30 text-center">Booth Challengers Today</div>
              </div>

              <div className="bg-[#FFFFFF] border border-[#00ADEF]/20 rounded-2xl p-6 text-center shadow-md transition-all hover:shadow-lg">
                <div className="text-4xl font-black text-[#7BC242] leading-none mb-1 tabular-nums">{mythGame?.aiMatchPercent || 0}%</div>
                <div className="text-[10px] font-black uppercase tracking-widest text-[#7BC242]/60 leading-tight">Agreed With AI</div>
              </div>
              <div className="bg-[#FFFFFF] border border-[#00ADEF]/20 rounded-2xl p-6 text-center shadow-md transition-all hover:shadow-lg">
                <div className="text-4xl font-black text-[#00ADEF] leading-none mb-1 tabular-nums">{100 - (mythGame?.aiMatchPercent || 0)}%</div>
                <div className="text-[10px] font-black uppercase tracking-widest text-[#00ADEF]/60 leading-tight">Surprised By AI</div>
              </div>

              <div className="col-span-2 space-y-6 pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-[#7BC242]/10 flex items-center justify-center font-black text-[9px] text-[#7BC242]">H</div>
                      <span className="text-[11px] font-black uppercase tracking-widest text-[#003B6E]/60">Humans matched AI</span>
                    </div>
                    <span className="text-sm font-black text-[#7BC242] tabular-nums">{mythGame?.aiMatchPercent || 0}%</span>
                  </div>
                  <div className="h-3 bg-white rounded-full overflow-hidden border border-[#00ADEF]/10">
                    <div className="h-full bg-[#7BC242] rounded-full transition-all duration-1000 ease-out shadow-sm" style={{ width: `${mythGame?.aiMatchPercent || 0}%` }} />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-[#00ADEF]/10 flex items-center justify-center font-black text-[9px] text-[#00ADEF]">AI</div>
                      <span className="text-[11px] font-black uppercase tracking-widest text-[#003B6E]/60">AI chose differently</span>
                    </div>
                    <span className="text-sm font-black text-[#00ADEF] tabular-nums">{100 - (mythGame?.aiMatchPercent || 0)}%</span>
                  </div>
                  <div className="h-3 bg-white rounded-full overflow-hidden border border-[#00ADEF]/10">
                    <div className="h-full bg-[#00ADEF] rounded-full transition-all duration-1000 ease-out shadow-sm" style={{ width: `${100 - (mythGame?.aiMatchPercent || 0)}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* TOP AGENCY DIAGNOSTICS TODAY */}
          <div className="flex-1 flex flex-col gap-4 overflow-hidden">
            <h3 className="text-[10px] font-black tracking-[0.2em] text-[#00ADEF] uppercase opacity-50 shrink-0">TOP AGENCY DIAGNOSTICS TODAY</h3>
            <div className="flex-1 space-y-3 overflow-auto pr-2 custom-scrollbar">
              {lbAgency.slice(0, 5).map((entry, i) => (
                <div key={i} className="flex items-center gap-5 p-4 rounded-2xl bg-white border border-[#00ADEF]/10 group hover:border-[#00ADEF]/40 transition-all hover:shadow-lg shadow-sm shadow-[#003B6E]/5">
                  <div className="text-3xl font-black text-[#003B6E]/10 w-8 text-center tabular-nums group-hover:text-[#00ADEF] transition-colors">{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-black text-xl text-[#003B6E] leading-tight truncate">{entry.name}</div>
                    <div className="text-[10px] font-bold text-[#003B6E]/30 uppercase tracking-widest truncate">{entry.company} · {entry.role || 'Enterprise / Unit'}</div>
                    <div className="mt-2 inline-block bg-[#7BC242]/10 text-[#7BC242] text-[9px] font-black px-2 py-0.5 rounded tracking-widest uppercase">{entry.score >= 90 ? 'High Growth' : entry.score >= 70 ? 'Strong Foundation' : 'Growing Agency'}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-black text-[#003B6E] leading-none tabular-nums">{entry.score}<span className="text-[10px] opacity-20">/100</span></div>
                    <div className="text-[9px] font-black text-[#7BC242] uppercase tracking-[0.15em] mt-1 tabular-nums italic">{i * 2 + 3} gaps identified</div>
                  </div>
                </div>
              ))}
              {lbAgency.length === 0 && (
                <div className="h-full bg-white border border-[#00ADEF]/10 rounded-3xl flex flex-col items-center justify-center text-[#003B6E]/20 font-black tracking-[0.3em] uppercase text-xs p-10 text-center">Waiting for daily insights</div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (Winners & Competition) */}
        <div className="col-span-12 lg:col-span-6 flex flex-col gap-8">

          {/* CROSSWORD CHALLENGE WINNERS */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black tracking-[0.2em] text-[#00ADEF] uppercase opacity-50 shrink-0">CROSSWORD CHALLENGE WINNERS</h3>
            <div className="bg-white rounded-3xl border border-[#00ADEF]/10 overflow-hidden shadow-xl shadow-[#003B6E]/5">
              <div className="divide-y divide-[#F0F9FF]">
                {lbCrossword.slice(0, 3).map((entry, i) => (
                  <div key={i} className="p-6 flex items-center justify-between group hover:bg-[#F8FBFF] transition-colors">
                    <div className="flex items-center gap-6">
                      <span className="text-xs font-black text-[#00ADEF] tracking-widest tabular-nums">{10 + i}:00</span>
                      <span className="text-xl font-black text-[#003B6E] group-hover:text-[#00ADEF] transition-colors">{entry.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] font-bold text-[#003B6E]/30 uppercase tracking-widest">{entry.company}</span>
                      <span className="text-[#7BC242] text-xl font-bold">✓</span>
                    </div>
                  </div>
                ))}
                {lbCrossword.length === 0 && (
                  <div className="p-12 text-center text-[#003B6E]/20 font-black tracking-widest uppercase text-xs">Waiting for daily solvers</div>
                )}
              </div>
            </div>

            {/* COUNTDOWN */}
            <div className="bg-[#F0F9FF] border border-[#00ADEF]/20 rounded-2xl p-6 flex items-center justify-between shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-2.5 h-2.5 rounded-full bg-[#00ADEF] animate-pulse" />
                <div className="text-[#003B6E] font-black text-xs tracking-widest uppercase">Next prize draw in</div>
              </div>
              <div className="text-4xl font-black text-[#00ADEF] tabular-nums tracking-tighter">29:48</div>
            </div>
          </div>

          {/* BEAT THE AI — TOP CHALLENGERS */}
          <div className="flex-1 flex flex-col gap-4 overflow-hidden">
            <h3 className="text-[10px] font-black tracking-[0.2em] text-[#00ADEF] uppercase opacity-50 shrink-0">BEAT THE AI — TOP CHALLENGERS</h3>
            <div className="flex-1 space-y-3 overflow-auto pr-2 custom-scrollbar">
              {lbMyth.slice(0, 5).map((entry, i) => (
                <div key={i} className="flex items-center gap-5 p-4 rounded-2xl bg-white border border-[#00ADEF]/10 group hover:border-[#00ADEF]/40 transition-all hover:shadow-lg shadow-sm shadow-[#003B6E]/5">
                  <div className="text-3xl font-black text-[#003B6E]/10 w-8 text-center tabular-nums group-hover:text-[#00ADEF] transition-colors">{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-black text-xl text-[#003B6E] leading-tight truncate">{entry.name}</div>
                    <div className="text-[10px] font-bold text-[#003B6E]/30 uppercase tracking-widest truncate">{entry.company}</div>
                    <div className="mt-2 flex gap-1">
                      {[...Array(5)].map((_, j) => (
                        <div key={j} className={`w-1.5 h-3.5 rounded-full ${j < (entry.score / 20) ? 'bg-[#7BC242]' : 'bg-[#F0F9FF]'}`} />
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-black text-[#003B6E] leading-none tabular-nums">{(entry.score / 10).toFixed(0)}<span className="text-[10px] opacity-20">/10</span></div>
                    <div className="text-[9px] font-black text-[#003B6E]/30 uppercase tracking-[0.15em] mt-1 tabular-nums">Matched AI</div>
                  </div>
                </div>
              ))}
              {lbMyth.length === 0 && (
                <div className="h-full bg-white border border-[#00ADEF]/10 rounded-3xl flex flex-col items-center justify-center text-[#003B6E]/20 font-black tracking-[0.3em] uppercase text-xs p-10 text-center">Waiting for challengers</div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* 4. FOOTER BAR */}
      <footer className="bg-[#00ADEF] py-4 px-8 flex items-center justify-between relative shadow-2xl z-20">
        <div className="text-white font-black text-sm tracking-tight flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-white animate-pulse shadow-[0_0_10px_white]" />
          Come join the challenge — the iorta TechNXT booth is waiting for you!
        </div>
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-5">
            <span className="text-white font-black tracking-[0.15em] text-[10px] uppercase opacity-90">#SalesVerse</span>
            <span className="text-white font-black tracking-[0.15em] text-[10px] uppercase opacity-90">#MTAxTIC</span>
          </div>
          <div className="h-4 w-px bg-white/30" />
          <span className="text-white font-black text-[10px] tracking-widest uppercase">iortatechnxt.com</span>
        </div>
      </footer>

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 45s linear infinite;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #F0F9FF;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 173, 239, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 173, 239, 0.4);
        }
      `}</style>
    </div>
  )
}
