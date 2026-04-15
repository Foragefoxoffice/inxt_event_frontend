'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'

function StatsBar({ stats }) {
  return (
    <div className="border-t border-white/10 py-4 px-6 flex justify-center gap-10">
      <StatItem value={stats?.players ?? '—'} label="Solvers" color="text-amber-400" />
      <StatItem value={stats?.totalPlayers ?? '—'} label="Total Participants" color="text-white" />
    </div>
  )
}

function StatItem({ value, label, color }) {
  return (
    <div className="text-center">
      <div className={`font-quiz-display text-3xl leading-none ${color}`}>{value}</div>
      <div className="text-[10px] tracking-widest text-white/40 uppercase mt-1">{label}</div>
    </div>
  )
}

function RevealCard({ reveal, index }) {
  return (
    <div
      className="rounded-xl border border-white/10 overflow-hidden animate-fade-up bg-[#17110a]"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="px-5 py-3 border-b border-white/10">
        <p className="text-white/40 text-[10px] tracking-widest uppercase">Clue</p>
        <p className="text-white text-sm mt-1 leading-snug">{reveal.questionText}</p>
      </div>
      <div className="flex divide-x divide-white/10 h-16">
        <div className="flex-1 flex flex-col justify-center px-5">
          <span className="text-[9px] tracking-widest text-white/30 uppercase mb-0.5">Your Answer</span>
          <span className={`font-quiz-display text-xl uppercase ${reveal.isCorrect ? 'text-amber-400' : 'text-white/40'}`}>
            {reveal.playerAnswer || '—'}
          </span>
        </div>
        {!reveal.isCorrect && (
          <div className="flex-1 flex flex-col justify-center px-5 bg-white/2">
            <span className="text-[9px] tracking-widest text-white/30 uppercase mb-0.5">Correct</span>
            <span className="font-quiz-display text-xl text-white/80 uppercase">
              {reveal.correctAnswer}
            </span>
          </div>
        )}
        <div className={`w-12 flex items-center justify-center ${reveal.isCorrect ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-500'}`}>
          <span className="text-xl font-bold">{reveal.isCorrect ? '✓' : '✕'}</span>
        </div>
      </div>
    </div>
  )
}

export function CrosswordResult({ result, eventId }) {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    
    if (!eventId) return
    api.getStats(eventId).then(data => {
      const g = data.games.find(g => g.gameType === 'CROSSWORD')
      setStats({
        totalPlayers: data.totalPlayers,
        players: g?.totalCompletions ?? 0
      })
    }).catch(() => {})
  }, [])

  const reveals = result.reveals || []
  const isComplete = result.isComplete

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, #2b1d0e 0%, #17110a 60%, #0a0805 100%)' }}
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/10 bg-[#17110a]/50">
        <div className="font-quiz-label text-[10px] tracking-[0.25em] text-amber-500 opacity-80">
          AI CROSSWORD · RESULTS
        </div>
        <div className="font-quiz-display text-white text-2xl leading-tight mt-0.5 uppercase">
          {isComplete ? 'Challenge Mastered' : 'Progress Summary'}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-5 py-6 max-w-2xl mx-auto w-full space-y-4">
        
        {/* Score Hero */}
        <div className="text-center py-6 animate-fade-up">
          <div className="font-quiz-display leading-none text-amber-500" style={{ fontSize: '100px' }}>
            {result.correctWords}<span className="text-2xl text-white/20"> / {result.totalWords}</span>
          </div>
          <div className="text-white/40 font-quiz-label tracking-widest text-xs mt-2 uppercase">Correct Words Found</div>
        </div>

        {isComplete && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-5 text-center animate-fade-up" style={{ animationDelay: '0.2s' }}>
            <p className="text-amber-500 font-quiz-display text-2xl">SOLVER STATUS ACHIEVED</p>
            <p className="text-amber-400/60 text-xs mt-1">Your name has been added to the master solvers leaderboard.</p>
          </div>
        )}

        {/* Reveals */}
        <div className="space-y-3">
          {reveals.map((rev, i) => (
            <RevealCard key={i} reveal={rev} index={i} />
          ))}
        </div>

        {/* CTAs */}
        <div className="pt-6 flex flex-col gap-3 animate-fade-up" style={{ animationDelay: '0.5s' }}>
          <button
            onClick={() => {
              Object.keys(sessionStorage).forEach(k => { if (k.startsWith('player_')) sessionStorage.removeItem(k) })
              window.location.href = '/play'
            }}
            className="py-4 rounded-xl bg-amber-600 font-quiz-label text-sm tracking-widest text-black font-black transition-all hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(245,158,11,0.4)]"
          >
            NEXT PLAYER →
          </button>
          <button
            onClick={() => window.location.href = '/play'}
            className="py-4 rounded-xl border border-white/10 font-quiz-label text-sm tracking-widest text-white/50 hover:border-white/30 hover:text-white transition-all"
          >
            PLAY ANOTHER GAME
          </button>
        </div>

        <div className="pb-8" />
      </div>

      <StatsBar stats={stats} />
    </div>
  )
}
