'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'

const GAME_COLORS = {
  QUIZ: 'from-blue-600 to-blue-800 border-blue-500',
  AGENCY: 'from-emerald-600 to-emerald-800 border-emerald-500',
  MYTH: 'from-purple-600 to-purple-800 border-purple-500',
  CROSSWORD: 'from-amber-600 to-amber-800 border-amber-500',
  INTERVIEW: 'from-[#993C1D] to-[#601D0B] border-[#993C1D]'
}

const GAME_ICONS = {
  QUIZ: '🤖',
  AGENCY: '🏢',
  MYTH: '🔍',
  CROSSWORD: '🧩',
  INTERVIEW: '🎙️'
}

export default function PlayPage() {
  const router = useRouter()
  const [eventData, setEventData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getActiveGames()
      .then(data => { setEventData(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F0F9FF]">
        <div className="w-8 h-8 border-2 border-[#00ADEF] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!eventData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F0F9FF] text-[#003B6E]">
        <p className="text-red-600 font-bold">No active event found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F0F9FF] p-6 font-sans">
      <div className="max-w-4xl mx-auto py-12">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <img src="/logo.png" alt="iorta TECHNXT" className="h-12 w-auto" />
          </div>
          <h1 className="text-5xl font-black text-[#003B6E] tracking-tight">
            Choose a Game
          </h1>
          <p className="text-[#64748B] mt-4 text-lg font-medium">Select an experience to begin your diagnostic journey</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {eventData.games.map(game => (
            <button
              key={game.gameId}
              onClick={() => router.push(`/play/games/${game.gameId}`)}
              className="group bg-white border border-[#E2E8F0] rounded-[32px] p-8 text-left transition-all duration-300 hover:border-[#00ADEF] hover:shadow-[0_20px_50px_rgba(0,173,239,0.12)] hover:-translate-y-1 relative overflow-hidden"
            >
              {/* Background Accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#F0F9FF] rounded-bl-[100px] -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-500 opacity-50" />
              
              <div className="relative z-10">
                <div className="w-16 h-16 bg-[#F8FAFC] rounded-2xl flex items-center justify-center text-4xl mb-6 shadow-sm border border-slate-100 group-hover:bg-[#00ADEF]/10 transition-colors">
                  {GAME_ICONS[game.type]}
                </div>
                
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] text-[#00ADEF] font-black uppercase tracking-widest">{game.type}</span>
                  <div className="h-px w-8 bg-[#00ADEF]/20" />
                </div>
                
                <div className="text-2xl font-black text-[#003B6E] group-hover:text-[#00ADEF] transition-colors leading-tight">
                  {game.title}
                </div>
                
                <div className="mt-8 flex items-center text-xs font-bold text-[#64748B] uppercase tracking-widest">
                  Start Experience 
                  <span className="ml-2 transform group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-20 text-center">
            <p className="text-[10px] font-bold text-[#64748B]/40 uppercase tracking-[0.3em]">
                Takaful AI Summit · 2026 · Digital Agency Audit
            </p>
        </div>
      </div>
    </div>
  )
}
