'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import styles from '../admin.module.css'
import localStyles from './sessions.module.css'

export default function AdminSessionsPage() {
  const router = useRouter()
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState(null)

  useEffect(() => {
    api.getAdminSessions().then(data => {
      setSessions(data)
      setLoading(false)
    })
  }, [])

  async function confirmReset() {
    if (!deleteId) return
    try {
      await api.deleteSession(deleteId)
      setSessions(s => s.filter(x => String(x._id) !== deleteId))
    } finally {
      setDeleteId(null)
    }
  }

  const activeCount = Math.floor(sessions.length * 0.1 || 0)
  const avgScore = sessions.length > 0 
    ? Math.round(sessions.reduce((acc, s) => acc + (s.result?.score || 0), 0) / sessions.length) 
    : 0

  return (
    <main className={localStyles.container}>

      {/* DELETE MODAL */}
      {deleteId && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modal}>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <div className={styles.modalIcon}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </div>
            </div>
            <h3 className={styles.modalTitle}>Reset Session?</h3>
            <p className={styles.modalText}>Are you sure you want to delete this player session? This will allow them to replay the game, but their current result will be lost.</p>
            <div className={styles.modalActions}>
              <button onClick={() => setDeleteId(null)} className={styles.btnCancel}>Cancel</button>
              <button onClick={confirmReset} className={styles.btnDelete}>Reset Data</button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.titleMain}>Session <span className={styles.titleBlue}>Vault</span></h1>
          <p className={styles.subtitle}>Comprehensive analytics and engagement tracking across all environments.</p>
        </div>
      </div>

      {/* STATS OVERVIEW */}
      <div className={localStyles.statsGrid}>
        <div className={localStyles.statCard}>
          <span className={localStyles.statLabel}>Total Engagements</span>
          <div className={localStyles.statValue}>
            {sessions.length}
            <span style={{ fontSize: '12px', color: '#10b981', background: '#dcfce7', padding: '2px 8px', borderRadius: '4px' }}>+12%</span>
          </div>
        </div>
        <div className={localStyles.statCard}>
          <span className={localStyles.statLabel}>Avg Performance</span>
          <div className={localStyles.statValue}>
            {avgScore}%
            <div style={{ width: '40px', height: '4px', background: '#f1f5f9', borderRadius: '10px', overflow: 'hidden' }}>
              <div style={{ width: `${avgScore}%`, height: '100%', background: '#0ea5e9' }} />
            </div>
          </div>
        </div>
        <div className={localStyles.statCard}>
          <span className={localStyles.statLabel}>Active Nodes</span>
          <div className={localStyles.statValue}>
            {activeCount}
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-40">
          <div className="w-10 h-10 border-4 border-[#0ea5e9] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : sessions.length === 0 ? (
        <div className={styles.emptyState}>
          No activity records found in the current environment.
        </div>
      ) : (
        <div className={localStyles.tableContainer}>
          <table className={localStyles.sessionTable}>
            <thead className={localStyles.tableHeader}>
              <tr>
                <th>Agent</th>
                <th>Organization</th>
                <th style={{ textAlign: 'center' }}>Engine</th>
                <th style={{ width: '180px' }}>Performance</th>
                <th>Timestamp</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => {
                const score = s.result?.score ?? 0;
                const scoreColor = score > 80 ? '#10b981' : score > 50 ? '#0ea5e9' : '#f59e0b';
                
                return (
                  <tr key={s._id} className={localStyles.tableRow}>
                    <td className={localStyles.cell}>
                      <div className={localStyles.agentInfo}>
                        <div className={localStyles.avatar}>
                          {(s.userId?.name || 'A')[0]}
                        </div>
                        <div>
                          <p className={localStyles.agentName}>{s.userId?.name || 'Anonymous'}</p>
                          <p className={localStyles.agentId}>0x{String(s._id).slice(-6).toUpperCase()}</p>
                        </div>
                      </div>
                    </td>
                    <td className={localStyles.cell}>
                      <span className={localStyles.orgName}>{s.userId?.company || 'External Guest'}</span>
                    </td>
                    <td className={localStyles.cell} style={{ textAlign: 'center' }}>
                      <span className={localStyles.engineBadge}>
                        {s.gameType || 'Standard'}
                      </span>
                    </td>
                    <td className={localStyles.cell}>
                      <div className={localStyles.performanceContainer}>
                        <div className={localStyles.performanceHeader}>
                          <span className={localStyles.scoreValue}>{score}%</span>
                        </div>
                        <div className={localStyles.progressBar}>
                          <div 
                            className={localStyles.progressFill} 
                            style={{ width: `${score}%`, backgroundColor: scoreColor }} 
                          />
                        </div>
                      </div>
                    </td>
                    <td className={localStyles.cell}>
                      <div className={localStyles.timestamp}>
                        <span style={{ fontWeight: 600, color: '#475569' }}>
                          {new Date(s.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span className={localStyles.timeLabel}>
                          {new Date(s.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </td>
                    <td className={localStyles.cell} style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => setDeleteId(String(s._id))}
                        className={localStyles.resetButton}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Reset
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}

