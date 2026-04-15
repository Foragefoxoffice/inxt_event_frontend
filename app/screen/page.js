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

  const refreshData = async () => {
    try {
      const active = await api.getActiveGames()
      const stats = await api.getStats(active.eventId)
      setStatsData(stats)

      const lbs = {}
      for (const game of active.games) {
        const lb = await api.getLeaderboard(game.gameId)
        lbs[game.gameId] = lb
      }
      setLeaderboards(lbs)
      return active
    } catch (err) {
      console.error('Refresh failed:', err.message)
      throw err
    }
  }

  useEffect(() => {
    async function init() {
      try {
        const active = await refreshData()
        const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

        const socket = io(socketUrl, {
          transports: ['websocket', 'polling'],
          reconnection: true
        })
        socketRef.current = socket

        const joinRoom = () => {
          socket.emit('join:event', String(active.eventId))
        }

        if (socket.connected) joinRoom()
        socket.on('connect', joinRoom)

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
          setLeaderboards(prev => ({ ...prev, [gameId]: { entries: top5 } }))
        })

        socket.on('player:joined', () => {
          setStatsData(prev => prev ? { ...prev, totalPlayers: (prev.totalPlayers || 0) + 1 } : prev)
        })

        socket.on('crossword:winner', (data) => {
          setWinner(data)
        })
      } catch (err) {
        console.error('Screen init failed:', err.message)
      }
    }

    init()
    return () => socketRef.current?.disconnect()
  }, [])

  if (!statsData) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-emerald-500 font-bold uppercase tracking-widest text-xs">Initializing SalesVerse...</p>
        </div>
      </div>
    )
  }

  const activeGames = statsData.games
  const agencyGame = activeGames.find(g => g.gameType === 'AGENCY')
  const mythGame = activeGames.find(g => g.gameType === 'MYTH')
  const crosswordGame = activeGames.find(g => g.gameType === 'CROSSWORD')
  const interviewGame = activeGames.find(g => g.gameType === 'INTERVIEW')

  const lbCrossword = leaderboards[crosswordGame?.gameId]?.entries || []
  const lbMyth = leaderboards[mythGame?.gameId]?.entries || []

  const getCountdown = () => {
    const minutes = currentTime.getMinutes()
    const seconds = currentTime.getSeconds()
    const remainingSeconds = (30 * 60) - ((minutes % 30) * 60 + seconds)
    const m = Math.floor(remainingSeconds / 60)
    const s = remainingSeconds % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  const formattedDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans flex flex-col overflow-hidden">

      {/* 1. PROFESSIONAL HEADER */}
      <header className="px-10 py-5 bg-[#020617] border-b border-white/5 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-8">
          <img src="/logo_shield.png" alt="Logo" className="h-9 w-auto" />
          <div className="h-8 w-px bg-white/10 hidden md:block" />
          <div>
            <div className="text-[9px] uppercase font-bold tracking-[0.3em] text-emerald-500 mb-0.5">Live Engagement Hub</div>
            <h1 className="text-lg font-extrabold text-white tracking-tight">SALESVERSE CHALLENGE</h1>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end mr-4">
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{formattedDate}</span>
            <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] mt-1">Kuala Lumpur, Malaysia</span>
          </div>
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-full">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black text-emerald-500 tracking-widest uppercase">LIVE SYSTEM</span>
          </div>
          <button
            onClick={refreshData}
            className="bg-white/5 hover:bg-white/10 text-white px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-widest border border-white/10 transition-all active:scale-95"
          >
            Refresh
          </button>
        </div>
      </header>

      {/* 2. SUBTLE TICKER */}
      <div className="bg-white border-b border-slate-200 py-3 px-10 flex items-center overflow-hidden whitespace-nowrap z-40">
        <div className="flex items-center gap-12 animate-marquee">
          {[1, 2].map(i => (
            <div key={i} className="flex items-center gap-12">
              <StatItem label="Active Challengers" value={statsData.totalPlayers} color="text-blue-600" />
              <StatItem label="Global Submissions" value={crosswordGame?.totalSubmissions || 0} color="text-slate-600" />
              <StatItem label="AI Consensus" value={`${mythGame?.aiMatchPercent || 0}%`} color="text-emerald-600" />
              <StatItem label="Market Voices" value={interviewGame?.totalSubmissions || 0} color="text-blue-600" />
              <StatItem label="Current Phase" value="Lead Prioritisation" color="text-slate-900" />
            </div>
          ))}
        </div>
      </div>

      {/* 3. CORE DASHBOARD CONTENT */}
      <main className="flex-1 p-10 grid grid-cols-12 gap-10 overflow-hidden">

        {/* LEFT COLUMN: ANALYTICS */}
        <div className="col-span-12 lg:col-span-6 flex flex-col gap-10">

          <SectionHeader title="System Intelligence" subtitle="Real-time AI synchronization metrics" />

          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-2 bg-white rounded-[1rem] border border-slate-200/60 p-8 flex flex-col items-center justify-center relative shadow-sm hover:shadow-md transition-shadow">
              <div className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 mb-4">Total Booth Engagement</div>
              <div className="text-[80px] font-extrabold text-slate-900 leading-none tracking-tighter tabular-nums">{statsData.totalPlayers}</div>
              <div className="absolute top-8 right-8 flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-500">+14%</span>
                <div className="w-1.5 h-6 bg-emerald-100 rounded-full" />
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-8 rounded-xl shadow-sm text-center">
              <div className="text-4xl font-extrabold text-emerald-600 mb-2">{mythGame?.aiMatchPercent || 0}%</div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Aligned with AI</div>
            </div>

            <div className="bg-white border border-slate-200 p-8 rounded-xl shadow-sm text-center">
              <div className="text-4xl font-extrabold text-blue-600 mb-2">{100 - (mythGame?.aiMatchPercent || 0)}%</div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Independent Choice</div>
            </div>

            <div className="col-span-2 space-y-8 mt-4 bg-slate-50/50 p-8 rounded-[2rem] border border-dashed border-slate-200">
              <ProgressBar label="Consensus Rate" value={mythGame?.aiMatchPercent || 0} color="bg-emerald-500" />
              <ProgressBar label="Deviation Rate" value={100 - (mythGame?.aiMatchPercent || 0)} color="bg-blue-500" />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: COMPETITION */}
        <div className="col-span-12 lg:col-span-6 flex flex-col gap-10">

          <SectionHeader title="Leaderboard Matrix" subtitle="Elite performer classification" />

          <div className="flex flex-col gap-6">
            {/* CROSSWORD WINNERS */}
            <div className="bg-white rounded-[1rem] border border-slate-200 overflow-hidden shadow-sm">
              <div className="bg-slate-50 px-8 py-5 border-b border-slate-200 flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Crossword Protocol</span>
                <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-widest leading-none">Top Performers</span>
              </div>
              <div className="divide-y divide-slate-100">
                {lbCrossword.slice(0, 4).map((entry, i) => (
                  <LeaderboardRow key={i} rank={i + 1} entry={entry} type="score" />
                ))}
                {lbCrossword.length === 0 && <EmptyState message="Syncing daily solvers..." />}
              </div>
            </div>

            {/* COUNTDOWN BANNER */}
            <div className="bg-slate-900 rounded-xl p-8 flex items-center justify-between text-white shadow-lg overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[60px] rounded-full" />
              <div className="flex items-center gap-6 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-1">Next System Sync</div>
                  <div className="text-sm font-bold text-white/80">Scheduled Prize Draw Matrix</div>
                </div>
              </div>
              <div className="text-3xl font-extrabold tabular-nums text-white">
                {getCountdown()}
              </div>
            </div>

            {/* AI CHALLENGE */}
            <div className="bg-white rounded-[1rem] border border-slate-200 overflow-hidden shadow-sm flex-1">
              <div className="bg-slate-50 px-8 py-5 border-b border-slate-200">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Sales Accuracy Matrix</span>
              </div>
              <div className="p-8 space-y-4 max-h-[400px] overflow-auto custom-scrollbar">
                {lbMyth.length > 0 ? lbMyth.slice(0, 5).map((entry, i) => (
                  <div key={i} className="flex items-center gap-6 p-4 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all group">
                    <div className="text-2xl font-black text-slate-200 w-8 group-hover:text-blue-500 transition-colors">{i + 1}</div>
                    <div className="flex-1">
                      <div className="text-base font-bold text-slate-900">{entry.name}</div>
                      <div className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">{entry.company}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-black text-slate-900">{entry.score / 10}<span className="text-[10px] opacity-20 whitespace-pre"> / 10</span></div>
                      <div className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest mt-0.5">Verified</div>
                    </div>
                  </div>
                )) : <EmptyState message="Waiting for challengers..." />}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 4. PROFESSIONAL FOOTER */}
      <footer className="bg-white border-t border-slate-200 py-5 px-10 flex items-center justify-between z-50">
        <div className="flex items-center gap-4">
          <div className="px-3 py-1 bg-slate-900 rounded text-white text-[9px] font-black uppercase tracking-widest">Connect</div>
          <span className="text-xs font-bold text-slate-500">Visit the iorta TechNXT booth to join the challenge!</span>
        </div>
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-6">
            {['SalesVerse', 'MTAxTIC', 'FutureScale'].map(tag => (
              <span key={tag} className="text-[10px] font-black text-slate-300 uppercase tracking-widest whitespace-nowrap">#{tag}</span>
            ))}
          </div>
          <div className="h-5 w-px bg-slate-200" />
          <span className="text-[10px] font-black text-slate-900 tracking-widest uppercase">iortatechnxt.com</span>
        </div>
      </footer>

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 50s linear infinite;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>
  )
}

function StatItem({ label, value, color }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-slate-400 text-[9px] uppercase font-black tracking-widest">{label}:</span>
      <span className={`${color} font-black text-xs uppercase tracking-tight`}>{value}</span>
    </div>
  )
}

function SectionHeader({ title, subtitle }) {
  return (
    <div className="flex flex-col gap-1 border-l-4 border-slate-900 pl-5">
      <h3 className="text-lg font-black tracking-tight text-slate-900 uppercase">{title}</h3>
      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">{subtitle}</p>
    </div>
  )
}

function LeaderboardRow({ rank, entry, type }) {
  return (
    <div className="px-8 py-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
      <div className="flex items-center gap-6 text-slate-900">
        <div className="w-4 text-sm font-black text-slate-300 tabular-nums">{rank}</div>
        <div>
          <div className="text-base font-bold leading-none mb-1">{entry.name}</div>
          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{entry.company}</div>
        </div>
      </div>
      <div className="flex items-center gap-8">
        <div className="text-right">
          <div className="text-xs font-black text-blue-500 tabular-nums mb-0.5">
            {Math.floor(entry.duration / 60)}:{(entry.duration % 60).toString().padStart(2, '0')}
          </div>
          <div className="text-xl font-extrabold tabular-nums leading-none">
            {entry.score}<span className="text-[10px] opacity-20 ml-1">%</span>
          </div>
        </div>
        <div className="w-10 flex justify-center">
          {entry.score === 100 ? (
            <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white text-[10px] font-bold">✓</div>
          ) : (
            <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
          )}
        </div>
      </div>
    </div>
  )
}

function ProgressBar({ label, value, color }) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-end">
        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">{label}</span>
        <span className={`text-sm font-extrabold tabular-nums ${color.replace('bg-', 'text-')}`}>{value}%</span>
      </div>
      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-1000 ease-out`} style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

function EmptyState({ message }) {
  return (
    <div className="p-12 text-center text-slate-300 font-bold tracking-widest uppercase text-[10px]">
      {message}
    </div>
  )
}
