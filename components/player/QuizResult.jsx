'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'

function StatsBar({ stats }) {
  return (
    <div className="border-t border-white/10 py-4 px-6 flex justify-center gap-10">
      <StatItem value={stats?.players ?? '—'} label="Players Today" color="text-[#C4962A]" />
      <StatItem value={stats ? `${stats.aiMatchPercent}%` : '—%'} label="Matched AI" color="text-[#4ADE80]" />
      <StatItem value={stats ? `${stats.surprisedPercent}%` : '—%'} label="Surprised" color="text-[#F87171]" />
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

// Match message variants
function matchMessage(aiMatchPercent) {
  if (aiMatchPercent === 100) return {
    headline: 'Perfect alignment.',
    body: 'Every choice you made matched the AI. You think exactly like SalesVerse — now imagine that insight backing every agent, every lead, every day.',
    color: 'text-[#4ADE80]',
    border: 'border-[#4ADE80]/20',
    bg: 'bg-[#4ADE80]/5'
  }
  if (aiMatchPercent >= 67) return {
    headline: 'Great minds think alike.',
    body: `You and SalesVerse agreed on ${aiMatchPercent}% of decisions. Imagine AI backing the gaps — automatically, for every agent on your team.`,
    color: 'text-[#4ADE80]',
    border: 'border-[#4ADE80]/20',
    bg: 'bg-[#4ADE80]/5'
  }
  if (aiMatchPercent >= 34) return {
    headline: 'Interesting choices.',
    body: `You diverged from SalesVerse on most decisions. That's not wrong — it shows where human intuition and AI pattern-matching see differently. Worth exploring.`,
    color: 'text-[#C4962A]',
    border: 'border-[#C4962A]/20',
    bg: 'bg-[#C4962A]/5'
  }
  return {
    headline: 'AI sees it differently.',
    body: `Your instincts diverged from the AI on almost every question. SalesVerse processes thousands of conversion patterns — see what it sees with a live demo.`,
    color: 'text-[#F87171]',
    border: 'border-[#F87171]/20',
    bg: 'bg-[#F87171]/5'
  }
}

// Single question reveal card
function RevealCard({ reveal, index }) {
  return (
    <div
      className="rounded-xl border border-white/10 overflow-hidden animate-fade-up"
      style={{ animationDelay: `${index * 0.12}s` }}
    >
      {/* Question header */}
      <div className="px-5 py-3 border-b border-white/10 bg-white/5">
        <p className="text-white/50 text-xs uppercase tracking-wider">Q{index + 1}</p>
        <p className="text-white/80 text-sm mt-0.5 leading-snug">{reveal.questionText}</p>
      </div>

      {/* Side by side choices */}
      <div className="grid grid-cols-2 divide-x divide-white/10">
        {/* Your choice */}
        <div className={`p-5 ${reveal.matched ? 'bg-[#0c1d38]' : 'bg-[#0c1d38]'}`}>
          <div className="text-[10px] font-quiz-label tracking-[0.2em] text-white/40 mb-2">
            YOUR CHOICE
          </div>
          <div className={`font-quiz-display text-xl leading-tight ${reveal.matched ? 'text-white' : 'text-white/70'}`}>
            {reveal.playerChoiceLabel || 'No answer'}
          </div>
          {reveal.matched && (
            <div className="mt-2 flex items-center gap-1.5">
              <span className="text-[#4ADE80] text-xs">✓</span>
              <span className="text-[#4ADE80] text-xs font-semibold">Matched AI</span>
            </div>
          )}
        </div>

        {/* AI choice */}
        <div className={`p-5 ${reveal.matched ? 'bg-[#0a2a1a]' : 'bg-[#0a1e2e]'}`}>
          <div className="text-[10px] font-quiz-label tracking-[0.2em] text-[#22D3EE]/60 mb-2">
            AI CHOICE · SALESVERSE
          </div>
          <div className="font-quiz-display text-xl leading-tight text-[#22D3EE] flex items-start gap-2">
            {reveal.aiChoiceLabel || '—'}
            <span className="text-[#C4962A] text-base mt-0.5">★</span>
          </div>
          {reveal.aiRationale && (
            <p className="text-white/50 text-xs leading-relaxed mt-2">{reveal.aiRationale}</p>
          )}
          {!reveal.aiRationale && reveal.matched && (
            <p className="text-white/40 text-xs mt-2">SalesVerse identifies this pattern across thousands of leads.</p>
          )}
          {!reveal.aiRationale && !reveal.matched && (
            <p className="text-white/40 text-xs mt-2">SalesVerse sees a higher conversion probability with this choice.</p>
          )}
        </div>
      </div>
    </div>
  )
}

export function QuizResult({ result, eventId }) {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    
    if (!eventId) return
    api.getStats(eventId).then(data => {
      const quiz = data.games.find(g => g.gameType === 'QUIZ')
      setStats({
        players: data.totalPlayers,
        aiMatchPercent: quiz?.aiMatchPercent ?? 0,
        surprisedPercent: 100 - (quiz?.aiMatchPercent ?? 0)
      })
    }).catch(() => {})
  }, [])

  const reveals = result.reveals || []
  const msg = matchMessage(result.aiMatchPercent)

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, #0d1f3c 0%, #061122 60%, #040d1a 100%)' }}
    >
      {/* Header bar */}
      <div
        className="px-6 py-4 border-b border-white/10"
        style={{ background: '#0a1928' }}
      >
        <div className="font-quiz-label text-[10px] tracking-[0.25em] text-[#22D3EE] opacity-80">
          SALESVERSE · AI REVEAL
        </div>
        <div
          className="font-quiz-display text-white leading-tight mt-0.5"
          style={{ fontSize: 'clamp(1.2rem, 4vw, 1.8rem)' }}
        >
          HERE'S WHAT THE AI CHOSE
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto px-5 py-6 max-w-3xl mx-auto w-full space-y-4">

        {/* Score hero */}
        <div className="text-center py-4 animate-fade-up">
          <div
            className="font-quiz-display leading-none"
            style={{
              fontSize: 'clamp(5rem, 18vw, 8rem)',
              color: result.aiMatchPercent >= 67 ? '#4ADE80' :
                     result.aiMatchPercent >= 34 ? '#C4962A' : '#F87171'
            }}
          >
            {result.aiMatchPercent}%
          </div>
          <div className="text-white/50 text-sm mt-1">AI Match Rate</div>
          <div className="text-white/30 text-xs mt-0.5">
            {result.aiMatchedCount} of {result.totalQuestions} questions matched
          </div>
        </div>

        {/* Per-question reveals */}
        {reveals.map((reveal, i) => (
          <RevealCard key={String(reveal.questionId)} reveal={reveal} index={i} />
        ))}

        {/* Summary message */}
        <div
          className={`rounded-xl border p-5 mt-2 animate-fade-up ${msg.border} ${msg.bg}`}
          style={{ animationDelay: `${reveals.length * 0.12 + 0.1}s` }}
        >
          <p className={`font-quiz-display text-2xl leading-tight ${msg.color}`}>
            {msg.headline}
          </p>
          <p className="text-white/60 text-sm leading-relaxed mt-2">{msg.body}</p>
        </div>

        {/* CTAs */}
        <div
          className="flex flex-col gap-3 animate-fade-up"
          style={{ animationDelay: `${reveals.length * 0.12 + 0.2}s` }}
        >
          <button
            className="py-4 rounded-xl font-quiz-label text-sm tracking-widest transition-all hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(196,150,42,0.3)]"
            style={{ background: '#C4962A', color: '#061122' }}
            onClick={() => {
              Object.keys(sessionStorage).forEach(k => { if (k.startsWith('player_')) sessionStorage.removeItem(k) })
              window.location.href = '/play'
            }}
          >
            NEXT PLAYER →
          </button>
          <button
            onClick={() => window.location.href = '/play'}
            className="py-4 rounded-xl border border-white/20 font-quiz-label text-sm tracking-widest text-white/80 hover:border-white/40 hover:text-white transition-all"
          >
            PLAY ANOTHER GAME
          </button>
        </div>

        <div className="pb-2" />
      </div>

      <StatsBar stats={stats} />
    </div>
  )
}
