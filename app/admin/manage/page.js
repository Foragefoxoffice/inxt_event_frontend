'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { api } from '@/lib/api'
import styles from '../admin.module.css'

function ManageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const targetGameId = searchParams.get('gameId')

  const [games, setGames] = useState([])
  const [selectedGame, setSelectedGame] = useState(null)
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    text: '',
    order: 0,
    answer: '',
    sectionLabel: '',
    aiRationale: '',
    gridLen: '',
    personas: [],
    interviewType: 'open',
    options: []
  })

  const [deleteId, setDeleteId] = useState(null)

  useEffect(() => {
    async function loadGames() {
      try {
        const data = await api.getAdminGames()
        setGames(data)

        if (data.length > 0) {
          const active = targetGameId
            ? data.find(g => String(g._id) === targetGameId) || data[0]
            : data[0]

          setSelectedGame(active)
          const qData = await api.getAdminQuestions(active._id)
          setQuestions(qData)
          setFormData(prev => ({ ...prev, order: qData.length + 1 }))
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    loadGames()
  }, [targetGameId])

  async function handleSelectGame(game) {
    setSelectedGame(game)
    setLoading(true)
    try {
      const qData = await api.getAdminQuestions(game._id)
      setQuestions(qData)
      resetForm(game, qData.length + 1)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function resetForm(game, nextOrder = 1) {
    setEditingId(null)
    setFormData({
      text: '',
      order: nextOrder,
      answer: '',
      sectionLabel: '',
      aiRationale: '',
      gridLen: '',
      personas: [],
      interviewType: 'open',
      options: game?.type === 'CROSSWORD' ? [] : game?.type === 'INTERVIEW' ? [] : game?.type === 'MYTH' ? [
        { label: '', shortLabel: '', subtitle: '', badge: '', isCorrect: false },
        { label: '', shortLabel: '', subtitle: '', badge: '', isCorrect: false },
        { label: '', shortLabel: '', subtitle: '', badge: '', isCorrect: false }
      ] : [
        { label: '', isCorrect: false },
        { label: '', isCorrect: false }
      ]
    })
  }

  function handleEdit(q) {
    setEditingId(q._id)
    setFormData({
      text: q.text,
      order: q.order,
      answer: q.answer || '',
      sectionLabel: q.sectionLabel || '',
      aiRationale: q.aiRationale || '',
      gridLen: q.gridLen || '',
      personas: q.personas || [],
      interviewType: q.interviewType || 'open',
      options: q.options || []
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      if (editingId) {
        await api.updateQuestion(editingId, formData)
      } else {
        await api.createQuestion(selectedGame._id, formData)
      }
      const updated = await api.getAdminQuestions(selectedGame._id)
      setQuestions(updated)
      resetForm(selectedGame, updated.length + 1)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function confirmDelete() {
    if (!deleteId) return
    try {
      await api.deleteQuestion(deleteId)
      const updated = await api.getAdminQuestions(selectedGame._id)
      setQuestions(updated)
    } catch (err) {
      setError(err.message)
    } finally {
      setDeleteId(null)
    }
  }

  return (
    <main className="animate-in fade-in duration-300">

      {/* DELETE MODAL */}
      {deleteId && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modal}>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <div className={styles.modalIcon}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </div>
            </div>
            <h3 className={styles.modalTitle}>Delete Question?</h3>
            <p className={styles.modalText}>Are you sure you want to remove this module? This action cannot be undone.</p>
            <div className={styles.modalActions}>
              <button onClick={() => setDeleteId(null)} className={styles.btnCancel}>Cancel</button>
              <button onClick={confirmDelete} className={styles.btnDelete}>Delete Module</button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER & TABS */}
      <div className="flex flex-col gap-8 mb-10">
        <div className={styles.header}>
          <div>
            <h1 className={styles.titleMain}>Content <span className={styles.titleBlue}>Engine</span></h1>
            <p className={styles.subtitle}>Design and curate the SalesVerse experience.</p>
          </div>
          <div className={styles.statusBadge}>
            <div className={styles.statusIndicator} style={{ backgroundColor: '#0ea5e9' }} />
            Editing Mode
          </div>
        </div>

        <div className={styles.tabsContainer}>
          {games.map(g => (
            <button
              key={g._id}
              onClick={() => handleSelectGame(g)}
              className={`${styles.tabButton} ${selectedGame?._id === g._id ? styles.tabButtonActive : ''}`}
            >
              {g.title}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.grid}>

        {/* FORM SIDEBAR */}
        <div className={`col-span-12 xl:col-span-5 ${styles.stickySidebar}`}>
          <div className={styles.card}>
            <div className={styles.cardTitle}>
              <svg className="w-5 h-5 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={editingId ? "M11 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-5m-5 5l8.5-8.5a2.121 2.121 0 00-3-3L9 7l5 5z" : "M12 4v16m8-8H4"} /></svg>
              {editingId ? 'Edit Draft' : 'New Content'}
            </div>

            <form onSubmit={handleSubmit} className={`${styles.formGroup} ${styles.scrollableForm}`}>
              <div className={styles.inputWrapper}>
                <label className={styles.label}>Question or Statement</label>
                <textarea
                  required
                  value={formData.text}
                  onChange={e => setFormData({ ...formData, text: e.target.value })}
                  className={styles.input}
                  style={{ height: '100px', resize: 'none' }}
                  placeholder="Describe the challenge or scenario..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className={styles.inputWrapper}>
                  <label className={styles.label}>Display Order</label>
                  <input
                    type="number"
                    required
                    value={formData.order}
                    onChange={e => setFormData({ ...formData, order: parseInt(e.target.value) })}
                    className={styles.input}
                  />
                </div>

                {selectedGame?.type === 'INTERVIEW' && (
                  <div className={styles.inputWrapper}>
                    <label className={styles.label}>Polling Mode</label>
                    <select
                      value={formData.interviewType}
                      onChange={e => setFormData({ ...formData, interviewType: e.target.value })}
                      className={styles.input}
                    >
                      <option value="open">Open Opinion</option>
                      <option value="tf">True / False</option>
                    </select>
                  </div>
                )}
              </div>

              {selectedGame?.type === 'CROSSWORD' && (
                <div className={styles.inputWrapper}>
                  <label className={styles.label}>Correct Keyword</label>
                  <input
                    type="text"
                    required
                    value={formData.answer}
                    onChange={e => {
                      const val = e.target.value.toUpperCase()
                      setFormData({ ...formData, answer: val, gridLen: val.length })
                    }}
                    className={styles.input}
                    style={{ fontFamily: 'monospace', color: '#0ea5e9' }}
                    placeholder="E.G. TAKAFUL"
                  />
                </div>
              )}

              {(selectedGame?.type === 'MYTH' || selectedGame?.type === 'AGENCY') && (
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Logic & Metadata</p>
                  {selectedGame?.type === 'MYTH' && (
                    <input
                      type="text"
                      value={formData.answer}
                      onChange={e => setFormData({ ...formData, answer: e.target.value })}
                      className={styles.input}
                      placeholder="Scenario Category"
                    />
                  )}
                  <textarea
                    value={formData.aiRationale}
                    onChange={e => setFormData({ ...formData, aiRationale: e.target.value })}
                    className={styles.input}
                    style={{ height: '100px', width: '100%', fontSize: '13px' }}
                    placeholder="AI Rationale / Metadata..."
                  />
                </div>
              )}

              {selectedGame?.type !== 'CROSSWORD' && (
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Options & Keys</p>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, options: [...formData.options, selectedGame?.type === 'MYTH' ? { label: '', shortLabel: '', subtitle: '', badge: '', isCorrect: false } : { label: '', isCorrect: false }] })}
                      className="text-[11px] font-bold text-sky-500 hover:text-sky-600 uppercase tracking-widest"
                    >
                      + Add
                    </button>
                  </div>

                  <div className="space-y-3">
                    {formData.options.map((opt, i) => (
                      <div key={i} className={`${styles.choiceCard} ${opt.isCorrect ? styles.choiceCardActive : ''}`}>
                        <div className="flex-1 flex flex-col gap-2">
                          <input
                            type="text"
                            required
                            placeholder={`Option ${i + 1}`}
                            value={opt.label}
                            onChange={e => {
                              const newOps = [...formData.options]
                              newOps[i] = { ...newOps[i], label: e.target.value }
                              setFormData({ ...formData, options: newOps })
                            }}
                            className="bg-transparent border-none p-0 text-sm font-bold text-slate-800 outline-none"
                          />
                          {selectedGame?.type === 'MYTH' && (
                            <div className="grid grid-cols-1 gap-1">
                              <input placeholder="Short Name" value={opt.shortLabel} onChange={e => { const n = [...formData.options]; n[i].shortLabel = e.target.value; setFormData({ ...formData, options: n }) }} className="w-full bg-slate-50 rounded-lg px-2 py-1 text-[10px] font-bold outline-none" />
                              <input placeholder="Metadata" value={opt.subtitle} onChange={e => { const n = [...formData.options]; n[i].subtitle = e.target.value; setFormData({ ...formData, options: n }) }} className="w-full bg-slate-50 rounded-lg px-2 py-1 text-[10px] outline-none" />
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const newOps = formData.options.map((o, idx) => ({ ...o, isCorrect: idx === i }))
                              setFormData({ ...formData, options: newOps })
                            }}
                            className={`${styles.pillBadge} ${opt.isCorrect ? styles.pillBadgeGreen : styles.pillBadgeBlue}`}
                          >
                            {opt.isCorrect ? 'Correct' : 'Mark Key'}
                          </button>
                          <button type="button" onClick={() => setFormData({ ...formData, options: formData.options.filter((_, idx) => idx !== i) })} className="text-slate-300 hover:text-red-500 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 mt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className={styles.submitButton}
                >
                  {loading ? '...' : editingId ? 'Update' : 'Publish'}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={() => resetForm(selectedGame, questions.length + 1)}
                    className={styles.activateButton}
                    style={{ textTransform: 'none', fontSize: '13px' }}
                  >
                    Cancel
                  </button>
                )}
              </div>
              {error && <p className="text-red-500 text-[11px] font-semibold text-center mt-2">{error}</p>}
            </form>
          </div>
        </div>

        {/* CONTENT LIST */}
        <div className="col-span-12 xl:col-span-7">
          <div className="flex items-center justify-between mb-5 px-2">
            <h2 className={styles.listSectionTitle}>Challenge Stack ({questions.length})</h2>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">Sync Active</span>
            </div>
          </div>

          {loading && questions.length === 0 ? (
            <div className="flex items-center justify-center p-20">
              <div className="w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : questions.length === 0 ? (
            <div className={styles.emptyState}>
              No content modules deployed for this engine.
            </div>
          ) : (
            <div className={styles.eventList}>
              {questions.map((q) => (
                <div key={q._id} className={styles.eventItem}>
                  <div className="flex items-start gap-5 flex-1">
                    <div className={styles.pillBadgeDark} style={{ minWidth: '32px', textAlign: 'center' }}>
                      {q.order}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-bold text-sky-500 uppercase tracking-widest">{selectedGame?.type}</span>
                        {q.sectionLabel && <span className="text-[10px] font-bold text-slate-400 capitalize">• {q.sectionLabel}</span>}
                      </div>
                      <p className="text-[15px] font-bold text-slate-900 leading-snug mb-3">{q.text}</p>

                      {q.options?.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {q.options.map((opt, oi) => (
                            <div
                              key={oi}
                              className={`${styles.pillBadge} ${opt.isCorrect ? styles.pillBadgeGreen : styles.pillBadgeBlue}`}
                              style={{ fontSize: '10px' }}
                            >
                              {opt.label}
                            </div>
                          ))}
                        </div>
                      )}
                      {q.answer && selectedGame?.type === 'CROSSWORD' && (
                        <div className="mt-2 text-[11px] font-mono text-sky-600 font-bold uppercase">
                          Key: {q.answer}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1 ml-4">
                    <button
                      onClick={() => handleEdit(q)}
                      className={styles.activateButton}
                      title="Edit"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteId(q._id)}
                      className={styles.activateButton}
                      style={{ color: '#ef4444' }}
                      title="Delete"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </main>
  )
}

export default function AdminManagePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ManageContent />
    </Suspense>
  )
}

