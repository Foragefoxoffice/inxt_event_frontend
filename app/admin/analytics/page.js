'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import styles from '../admin.module.css'

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
      <div className="flex items-center justify-center p-40">
        <div className="w-10 h-10 border-2 border-[#0ea5e9] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-40 text-red-500 font-bold">
        {error}
      </div>
    )
  }

  return (
    <main className="animate-in fade-in duration-300">

      {/* HEADER */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.titleMain}>Live <span className={styles.titleBlue}>Analytics</span></h1>
          <p className={styles.subtitle}>Real-time performance metrics and engagement insights.</p>
        </div>

        <div className={styles.statusBadge}>
          <div className="flex items-center gap-2 px-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span style={{ fontSize: '10px', fontWeight: '800', color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Live Flow</span>
          </div>
        </div>
      </div>

      {/* TOP METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className={styles.card} style={{ position: 'relative', overflow: 'hidden', padding: '2rem' }}>
          <div style={{ position: 'absolute', top: '1rem', right: '1rem', opacity: 0.05 }}>
            <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          </div>
          <p style={{ fontSize: '10px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '1rem' }}>Unique Participants</p>
          <p style={{ fontSize: '48px', fontWeight: '700', color: '#0f172a', letterSpacing: '-0.02em', lineHeight: '1' }}>{data.totalPlayers}</p>
          <div className="mt-4 flex items-center gap-2" style={{ color: '#10b981' }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
            <span style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase' }}>Active Scale</span>
          </div>
        </div>

        <div className={styles.card} style={{ backgroundColor: '#0f172a', position: 'relative', overflow: 'hidden', padding: '2rem' }}>
          <div style={{ position: 'absolute', top: '1rem', right: '1rem', opacity: 0.1 }}>
            <svg className="w-20 h-20 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <p style={{ fontSize: '10px', fontWeight: '800', color: 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '1rem' }}>Engaged Engines</p>
          <p style={{ fontSize: '48px', fontWeight: '700', color: '#ffffff', letterSpacing: '-0.02em', lineHeight: '1' }}>{data.games.length}</p>
          <div className="mt-4 flex items-center gap-2" style={{ color: '#38bdf8' }}>
            <span style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase' }}>System Operational</span>
          </div>
        </div>

        <div className={styles.card} style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)', border: 'none', padding: '2rem' }}>
          <p style={{ fontSize: '10px', fontWeight: '800', color: 'rgba(255, 255, 255, 0.7)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '1rem' }}>Global Response Rate</p>
          <p style={{ fontSize: '48px', fontWeight: '700', color: '#ffffff', letterSpacing: '-0.02em', lineHeight: '1' }}>84<span style={{ fontSize: '24px', opacity: 0.6, marginLeft: '4px' }}>%</span></p>
          <div style={{ marginTop: '1.5rem', width: '100%', height: '6px', backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: '10px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: '84%', backgroundColor: '#ffffff', boxShadow: '0 0 15px rgba(255, 255, 255, 0.5)' }} />
          </div>
        </div>
      </div>

      {/* GAME SPECIFIC CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {data.games.map(game => (
          <div key={game.gameId} className={styles.card} style={{ padding: '2.5rem', position: 'relative' }}>
            <div className="flex items-start justify-between mb-5">
              <div>
                <span className={styles.pillBadge} style={{
                  backgroundColor: game.gameType === 'QUIZ' ? '#e0f2fe' : game.gameType === 'AGENCY' ? '#dcfce7' : '#f3e8ff',
                  color: game.gameType === 'QUIZ' ? '#0369a1' : game.gameType === 'AGENCY' ? '#15803d' : '#7e22ce'
                }}>
                  {game.gameType} Challenge
                </span>
                <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', marginTop: '1rem' }}>{game.title}</h3>
                <p style={{ fontSize: '10px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '0.5rem' }}>
                  {game.totalSubmissions} Total Engagements
                </p>
              </div>
            </div>

            {game.gameType === 'QUIZ' && (
              <div style={{ backgroundColor: '#f8fafc', borderRadius: '16px', padding: '1.5rem', border: '1px solid #f1f5f9' }}>
                <div className="flex items-end justify-between mb-4">
                  <div>
                    <p style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>AI Alignment Score</p>
                    <p style={{ fontSize: '36px', fontWeight: '900', color: '#0ea5e9' }}>{game.aiMatchPercent}%</p>
                  </div>
                  <div className="text-right">
                    <p style={{ fontSize: '9px', fontWeight: '800', color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.1em' }}>High Correlation</p>
                  </div>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${game.aiMatchPercent}%`, backgroundColor: '#0ea5e9', boxShadow: '0 0 15px rgba(14, 165, 233, 0.3)' }} />
                </div>
              </div>
            )}

            {game.gameType === 'AGENCY' && game.avgMetrics && (
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(game.avgMetrics).map(([m, v]) => (
                  <div key={m} style={{ backgroundColor: '#f8fafc', borderRadius: '16px', padding: '1.25rem', border: '1px solid #f1f5f9' }}>
                    <p style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>{m}</p>
                    <p style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a' }}>{v}%</p>
                    <div style={{ marginTop: '0.75rem', width: '100%', height: '4px', backgroundColor: '#e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${v}%`, backgroundColor: '#10b981' }} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {game.gameType === 'CROSSWORD' && (
              <div className="flex items-center gap-10">
                <div className="flex-1">
                  <p style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Completions</p>
                  <p style={{ fontSize: '56px', fontWeight: '900', color: '#f59e0b' }}>{game.totalCompletions}</p>
                </div>
                <div style={{ width: '80px', height: '80px', backgroundColor: '#fff7ed', borderRadius: '50%', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center' }}>
                  <svg className="w-10 h-10 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
              </div>
            )}

            {game.gameType === 'MYTH' && (
              <div className="space-y-6">
                <div className="flex items-end justify-between">
                  <div>
                    <p style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Average Consensus</p>
                    <p style={{ fontSize: '48px', fontWeight: '900', color: '#9333ea' }}>{game.avgScore || 0}%</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <p style={{ fontSize: '9px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Response Distribution</p>
                  <div className="grid grid-cols-4 gap-2">
                    {game.questionStats?.map((_, i) => (
                      <div key={i} style={{ height: '40px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '800', color: '#cbd5e1' }}>
                        Q{i + 1}
                      </div>
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
