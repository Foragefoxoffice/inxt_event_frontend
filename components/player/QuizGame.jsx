'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { api } from '@/lib/api'

const TIMER_SECONDS = 30

// ── Stats bar shown at bottom of every screen ──────────────────────────────
function StatsBar({ stats }) {
  if (!stats) return (
    <div className="border-t border-[#00ADEF]/10 py-4 px-6 flex justify-center gap-10 bg-white">
      <StatItem value="—" label="Players Today" color="text-[#003B6E]" />
      <StatItem value="—%" label="Matched AI" color="text-[#10B981]" />
      <StatItem value="—%" label="Surprised" color="text-[#F87171]" />
    </div>
  )
  return (
    <div className="border-t border-[#00ADEF]/10 py-4 px-6 flex justify-center gap-10 bg-white">
      <StatItem value={stats.players} label="Players Today" color="text-[#003B6E]" />
      <StatItem value={`${stats.aiMatchPercent}%`} label="Matched AI" color="text-[#10B981]" />
      <StatItem value={`${stats.surprisedPercent}%`} label="Surprised" color="text-[#F87171]" />
    </div>
  )
}

function StatItem({ value, label, color }) {
  return (
    <div className="text-center">
      <div className={`font-quiz-display text-3xl font-black leading-none ${color}`}>{value}</div>
      <div className="text-[10px] font-bold tracking-widest text-[#64748B] uppercase mt-1">{label}</div>
    </div>
  )
}

// ── Circular countdown timer ────────────────────────────────────────────────
function TimerRing({ timeLeft, total = TIMER_SECONDS }) {
  const pct = timeLeft / total
  const radius = 22
  const circ = 2 * Math.PI * radius
  const offset = circ * (1 - pct)
  const urgent = timeLeft <= 10

  return (
    <div className={`relative w-16 h-16 flex items-center justify-center rounded-full border-2 ${urgent ? 'border-[#F87171]/20' : 'border-[#00ADEF]/20'}`}>
      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 52 52">
        <circle
          cx="26" cy="26" r={radius}
          fill="none"
          stroke={urgent ? '#F87171' : '#00ADEF'}
          strokeWidth="3"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s linear' }}
        />
      </svg>
      <span className={`font-quiz-display text-xl leading-none font-black ${urgent ? 'text-[#F87171]' : 'text-[#00ADEF]'}`}>
        {String(Math.floor(timeLeft / 60)).padStart(1, '0')}:{String(timeLeft % 60).padStart(2, '0')}
      </span>
    </div>
  )
}

// ── Option card ─────────────────────────────────────────────────────────────
function OptionCard({ option, index, selected, locked, onSelect }) {
  const letters = ['A', 'B', 'C', 'D', 'E']
  const isSelected = selected === option.optionId

  return (
    <button
      onClick={() => !locked && onSelect(option.optionId)}
      disabled={locked}
      className={`
        w-full text-left rounded-2xl border transition-all duration-300 p-5 group
        ${isSelected
          ? 'border-[#00ADEF] bg-[#F0F9FF] shadow-[0_10px_30px_rgba(0,173,239,0.12)]'
          : locked
            ? 'border-slate-100 bg-slate-50 opacity-50'
            : 'border-slate-200 bg-white hover:border-[#00ADEF]/50 hover:shadow-md cursor-pointer'
        }
      `}
      style={{ animation: `fade-up 0.4s ease ${index * 0.08}s both` }}
    >
      <div className="flex items-start gap-4">
        <div className={`
          shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black
          ${isSelected ? 'bg-[#00ADEF] text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-[#00ADEF]/10 group-hover:text-[#00ADEF]'}
          transition-all duration-200
        `}>
          {letters[index]}
        </div>
        <span className={`text-[15px] leading-relaxed font-bold ${isSelected ? 'text-[#003B6E]' : 'text-slate-600 group-hover:text-[#003B6E]'} transition-colors`}>
          {option.label}
        </span>
      </div>
    </button>
  )
}

// ── Main component ──────────────────────────────────────────────────────────
export function QuizGame({ questions, onSubmit, submitting, eventId }) {
  const [phase, setPhase] = useState('intro') // 'intro' | 'playing'
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState({})
  const [locked, setLocked] = useState(false)
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS)
  const [stats, setStats] = useState(null)
  const timerRef = useRef(null)

  // Fetch live stats
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

  const advance = useCallback(() => {
    clearInterval(timerRef.current)
    setLocked(true)

    setTimeout(() => {
      if (currentIdx < questions.length - 1) {
        setCurrentIdx(i => i + 1)
        setLocked(false)
        setTimeLeft(TIMER_SECONDS)
      } else {
        const payload = questions.map(q => ({
          questionId: q.questionId,
          selectedOptionId: answers[q.questionId] || null
        }))
        onSubmit(payload)
      }
    }, locked ? 200 : 600)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIdx, questions, answers, onSubmit])

  // Start/restart timer when question changes
  useEffect(() => {
    if (phase !== 'playing') return
    clearInterval(timerRef.current)
    setTimeLeft(TIMER_SECONDS)
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current)
          advance()
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, currentIdx])

  function handleSelect(optionId) {
    if (locked) return
    const q = questions[currentIdx]
    setAnswers(prev => ({ ...prev, [q.questionId]: optionId }))
  }

  function handleLock() {
    const q = questions[currentIdx]
    if (!answers[q.questionId] || locked) return
    clearInterval(timerRef.current)
    setLocked(true)
    setTimeout(() => advance(), 500)
  }

  const q = questions[currentIdx]
  const selected = q ? answers[q.questionId] : null
  const canLock = !!selected && !locked

  // ── INTRO SCREEN ──────────────────────────────────────────────────────────
  if (phase === 'intro') {
    return (
      <div
        className="min-h-screen flex flex-col bg-[#F0F9FF]"
      >
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
          {/* Brand line */}
          <div className="font-bold text-[10px] text-[#00ADEF] tracking-[0.3em] mb-10 uppercase">
            iorta TechNXT · SalesVerse · 2026
          </div>

          {/* Hero headline */}
          <div className="text-center mb-6">
            <div
              className="font-quiz-display text-[#003B6E] leading-none font-black"
              style={{ fontSize: 'clamp(4rem, 14vw, 9rem)' }}
            >
              CAN YOU
            </div>
            <div
              className="font-quiz-display text-[#00ADEF] leading-none font-black"
              style={{ fontSize: 'clamp(4rem, 14vw, 9rem)', marginTop: '-0.05em' }}
            >
              OUTSMART AI?
            </div>
          </div>

          {/* Subtitle */}
          <p className="text-[#64748B] text-lg mb-10 text-center font-medium">
            {questions.length}-question Takaful sales challenge
          </p>

          {/* CTA button */}
          <button
            onClick={() => setPhase('playing')}
            className="font-black text-base tracking-widest px-12 py-5 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg shadow-[#00ADEF]/20 bg-linear-to-r from-[#00ADEF] to-[#003B6E] text-white"
          >
            TAP TO START →
          </button>

          {/* Live teaser */}
          {stats && (
            <p className="mt-8 text-[#64748B] text-sm text-center font-medium">
              Today:{' '}
              <span className="text-[#003B6E] font-black">{stats.players} players</span>
              {' · '}
              <span className="text-[#10B981] font-black">{stats.aiMatchPercent}%</span> agreed with AI
              {' · '}
              <span className="text-[#F87171] font-black">{stats.surprisedPercent}%</span> were surprised
            </p>
          )}
        </div>

        <StatsBar stats={stats} />
      </div>
    )
  }

  // ── PLAYING SCREEN ────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen flex flex-col bg-[#F0F9FF]"
    >
      {/* Header bar */}
      <div
        className="flex items-center justify-between px-6 py-5 border-b border-[#00ADEF]/10 bg-white shadow-sm sticky top-0 z-10"
      >
        <div>
          <div className="font-bold text-[10px] tracking-[0.25em] text-[#00ADEF] uppercase opacity-80">
            SALESVERSE · AI CHALLENGE
          </div>
          <div
            className="font-quiz-display text-[#003B6E] font-black leading-tight mt-1 animate-fade-up"
            style={{ fontSize: 'clamp(1.1rem, 3vw, 1.5rem)' }}
            key={currentIdx}
          >
            {q?.text?.length > 55 ? q.text.slice(0, 55) + '…' : q?.text}
          </div>
        </div>
        <TimerRing timeLeft={timeLeft} />
      </div>

      {/* Question body */}
      <div className="flex-1 flex flex-col px-6 py-8 max-w-3xl mx-auto w-full" key={currentIdx}>

        {/* Progress dots */}
        <div className="flex gap-2 mb-8">
          {questions.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                i < currentIdx ? 'bg-[#003B6E]' :
                i === currentIdx ? 'bg-[#00ADEF]' :
                'bg-slate-200'
              }`}
            />
          ))}
        </div>

        {/* Question text (full) */}
        <div className="mb-4 animate-fade-up" style={{ animationDelay: '0.05s' }}>
          <p className="text-[#64748B] text-xs font-bold uppercase tracking-widest leading-relaxed">
            Question {currentIdx + 1} of {questions.length}
          </p>
          <p
            className="font-quiz-display text-[#003B6E] font-black mt-2 leading-tight"
            style={{ fontSize: 'clamp(1.2rem, 3vw, 1.6rem)' }}
          >
            {q?.text}
          </p>
        </div>

        {/* Options */}
        <div className="grid gap-3 mt-4 flex-1">
          {q?.options.map((opt, i) => (
            <OptionCard
              key={opt.optionId}
              option={opt}
              index={i}
              selected={selected}
              locked={locked}
              onSelect={handleSelect}
            />
          ))}
        </div>

        {/* Lock in button */}
        <button
          onClick={handleLock}
          disabled={!canLock || submitting}
          className={`
            w-full mt-8 py-5 rounded-2xl font-black text-sm tracking-widest transition-all duration-300
            ${canLock
              ? 'hover:scale-[1.02] shadow-xl shadow-[#00ADEF]/20 active:scale-[0.98]'
              : 'opacity-30 cursor-not-allowed'
            }
          `}
          style={{
            background: canLock ? 'linear-gradient(135deg, #00ADEF 0%, #003B6E 100%)' : '#E2E8F0',
            color: canLock ? '#fff' : '#64748B'
          }}
        >
          {submitting ? 'SUBMITTING...' : locked ? 'MOVING ON...' : 'LOCK IN MY ANSWER →'}
        </button>
      </div>

      <StatsBar stats={stats} />
    </div>
  )
}
