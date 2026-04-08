'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'

function parseSubtitle(subtitle) {
  if (!subtitle) return []
  return subtitle.split('|').map(s => s.trim()).filter(Boolean)
}

function ScenarioCard({ reveal, index }) {
  const matched = reveal.isCorrect
  return (
    <div style={{
      background: '#FFFFFF',
      border: `1px solid ${matched ? '#7BC242' : '#F0F9FF'}`,
      borderRadius: 14, overflow: 'hidden',
      boxShadow: '0 4px 12px rgba(0, 59, 110, 0.04)',
      animation: 'mythFadeUp 0.35s ease both',
      animationDelay: `${index * 0.06}s`,
      fontFamily: "'Plus Jakarta Sans', sans-serif"
    }}>
      <div style={{
        padding: '14px 18px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12
      }}>
        <div>
          {reveal.scenarioTitle && (
            <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.18em', color: '#00ADEF', textTransform: 'uppercase', marginBottom: 3 }}>
              Scenario {index + 1} · {reveal.scenarioTitle}
            </div>
          )}
          <p style={{ fontSize: 13, color: '#003B6E', margin: 0, lineHeight: 1.4, fontWeight: 700 }}>{reveal.questionText}</p>
        </div>
        <div style={{
          width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
          background: matched ? 'rgba(6,209,127,0.15)' : 'rgba(239,68,68,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, fontWeight: 900,
          color: matched ? '#06d17f' : '#EF4444'
        }}>{matched ? '✓' : '✕'}</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderTop: 'none' }}>
        <div style={{ padding: '12px 18px', borderRight: '1px solid #F0F9FF' }}>
          <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.15em', color: '#003B6E', opacity: 0.4, textTransform: 'uppercase', marginBottom: 4 }}>Your Choice</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: matched ? '#7BC242' : '#64748B' }}>
            {reveal.playerChoiceLabel}{reveal.playerChoiceShortLabel ? ` — ${reveal.playerChoiceShortLabel}` : ''}
          </div>
        </div>
        <div style={{ padding: '12px 18px' }}>
          <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.15em', color: '#7BC242', textTransform: 'uppercase', marginBottom: 4 }}>AI's Choice</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#003B6E' }}>
            {reveal.correctLabel}{reveal.correctChoiceShortLabel ? ` — ${reveal.correctChoiceShortLabel}` : ''}
          </div>
        </div>
      </div>
    </div>
  )
}

export function MythResult({ result, eventId }) {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    if (!eventId) return
    api.getStats(eventId).then(data => {
      const g = data.games.find(g => g.gameType === 'MYTH')
      const matchedPct = g?.aiMatchPercent ?? 0
      setStats({
        players: data.totalPlayers,
        matchedPct,
        surprisedPct: 100 - matchedPct
      })
    }).catch(() => {})
  }, [])

  const reveals = result.reveals || []
  const correct = result.correctCount ?? 0
  const total = result.totalQuestions ?? reveals.length
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0

  const scoreColor = pct >= 80 ? '#06d17f' : pct >= 50 ? '#C4962A' : '#F87171'
  const scoreLabel = pct >= 80 ? 'AI Thinker' : pct >= 50 ? 'Getting There' : 'Surprised By AI'

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#F0F9FF', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        @keyframes mythFadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* Blue top bar */}
      <div style={{ height: 4, background: 'linear-gradient(90deg, #00ADEF 0%, #7BC242 100%)' }} />

      {/* Header */}
      <div style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '16px 24px' }}>
        <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.2em', color: '#00ADEF', textTransform: 'uppercase', marginBottom: 2 }}>
          BEAT THE AI · FINAL RESULTS
        </div>
        <div style={{ fontSize: 22, fontWeight: 900, color: '#003B6E' }}>
          How Did You Match The AI?
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '24px 20px 32px', maxWidth: 760, margin: '0 auto', width: '100%' }}>

        {/* Score hero */}
        <div style={{ textAlign: 'center', padding: '28px 0 20px', animation: 'mythFadeUp 0.4s ease both' }}>
          <div style={{ fontSize: 100, fontWeight: 900, color: scoreColor, lineHeight: 1 }}>
            {correct}<span style={{ fontSize: 28, color: '#003B6E', opacity: 0.2, fontWeight: 400 }}> / {total}</span>
          </div>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.2em', color: scoreColor, textTransform: 'uppercase', marginTop: 8 }}>
            {scoreLabel}
          </div>
          <div style={{ fontSize: 14, color: '#003B6E', opacity: 0.5, marginTop: 6, fontWeight: 600 }}>
            You matched AI on {pct}% of scenarios
          </div>
        </div>

        {/* Live stats */}
        {stats && (
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
            background: '#FFFFFF',
            border: '1px solid #00ADEF',
            borderRadius: 14, overflow: 'hidden',
            marginBottom: 24, animation: 'mythFadeUp 0.4s ease 0.1s both',
            boxShadow: '0 8px 30px rgba(0, 173, 239, 0.12)'
          }}>
            {[
              { val: stats.players, label: 'Players Today', color: '#00ADEF' },
              { val: `${stats.matchedPct}%`, label: 'Matched AI', color: '#7BC242' },
              { val: `${stats.surprisedPct}%`, label: 'Were Surprised', color: '#EF4444' }
            ].map((s, i) => (
              <div key={i} style={{
                padding: '18px', textAlign: 'center',
                borderRight: i < 2 ? '1px solid #F0F9FF' : 'none'
              }}>
                <div style={{ fontSize: 26, fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.val}</div>
                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.15em', color: '#003B6E', opacity: 0.4, textTransform: 'uppercase', marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Scenario breakdown */}
        <div style={{ marginBottom: 8, fontSize: 10, fontWeight: 800, letterSpacing: '0.15em', color: '#003B6E', opacity: 0.3, textTransform: 'uppercase' }}>
          Scenario Breakdown
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
          {reveals.map((rev, i) => (
            <ScenarioCard key={i} reveal={rev} index={i} />
          ))}
        </div>

        {/* CTAs */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, animation: 'mythFadeUp 0.4s ease 0.3s both' }}>
          <button
            onClick={() => window.location.href = '/play'}
            style={{
              padding: '16px', borderRadius: 12,
              border: '1.5px solid #E2E8F0',
              background: '#FFFFFF',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 12, fontWeight: 800, letterSpacing: '0.15em',
              color: '#003B6E', cursor: 'pointer'
            }}
          >PLAY AGAIN</button>
          <button
            onClick={() => window.location.href = '/play'}
            style={{
              padding: '16px', borderRadius: 12,
              background: 'linear-gradient(135deg, #00ADEF 0%, #003B6E 100%)',
              border: 'none',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 12, fontWeight: 900, letterSpacing: '0.15em',
              color: '#FFFFFF', cursor: 'pointer',
              boxShadow: '0 8px 25px rgba(0, 173, 239, 0.3)'
            }}
          >SEE SALESVERSE LIVE →</button>
        </div>

      </div>

      {/* Blue bottom bar */}
      <div style={{ height: 4, background: 'linear-gradient(90deg, #7BC242 0%, #00ADEF 100%)' }} />
    </div>
  )
}
