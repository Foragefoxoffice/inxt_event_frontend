'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'

export default function AdminManagePage() {
  const router = useRouter()
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

  useEffect(() => {
    async function loadGames() {
      try {
        const data = await api.getAdminGames()
        setGames(data)
        if (data.length > 0) {
          const first = data[0]
          setSelectedGame(first)
          const qData = await api.getAdminQuestions(first._id)
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
  }, [])

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

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this question?')) return
    try {
      await api.deleteQuestion(id)
      const updated = await api.getAdminQuestions(selectedGame._id)
      setQuestions(updated)
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading && games.length === 0) {
    return (
      <div className="min-h-screen bg-[#050e1a] flex items-center justify-center text-white">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F0F9FF] text-[#003B6E] p-6 font-sans selection:bg-[#00ADEF]/20">
      <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-500">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#00ADEF]/10 pb-6">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/admin')} className="text-[#003B6E]/40 hover:text-[#00ADEF] transition text-xs font-black tracking-widest">
              ← BACK
            </button>
            <h1 className="text-3xl font-black tracking-tight uppercase">Manage Content</h1>
          </div>
          <div className="flex gap-2">
            {games.map(g => (
              <button
                key={g._id}
                onClick={() => handleSelectGame(g)}
                className={`px-4 py-2 rounded-lg text-xs font-bold tracking-widest uppercase transition ${
                  selectedGame?._id === g._id 
                    ? 'bg-[#00ADEF] text-white shadow-lg shadow-[#00ADEF]/20' 
                    : 'bg-white text-[#003B6E]/40 border border-[#00ADEF]/10 hover:bg-[#F8FBFF]'
                }`}
              >
                {g.title}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 border border-[#00ADEF]/10 shadow-lg shadow-[#00ADEF]/5 sticky top-6">
              <div className="mb-6">
                <p className="text-[10px] text-[#00ADEF]/50 uppercase tracking-widest leading-none mb-1">Current Game</p>
                <p className="text-xl font-black text-[#003B6E]">{selectedGame?.title}</p>
              </div>

              <h2 className="text-xs font-black tracking-[0.2em] text-[#00ADEF] mb-6 uppercase">
                {editingId ? 'Edit Question' : 'Add New Question'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-[10px] text-white/30 uppercase tracking-widest mb-1.5">Question Text</label>
                  <textarea
                    required
                    value={formData.text}
                    onChange={e => setFormData({ ...formData, text: e.target.value })}
                    className="w-full bg-[#F8FBFF] border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm text-[#003B6E] focus:border-[#00ADEF] outline-none transition h-32"
                    placeholder="Enter the question or statement..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] text-white/30 uppercase tracking-widest mb-1.5">Order</label>
                    <input
                      type="number"
                      required
                      value={formData.order}
                      onChange={e => setFormData({ ...formData, order: parseInt(e.target.value) })}
                      className="w-full bg-[#050e1a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 outline-none transition"
                    />
                  </div>

                  {selectedGame?.type === 'INTERVIEW' && (
                    <div className="col-span-2 space-y-4 border border-[#993C1D]/20 rounded-xl p-4 bg-[#993C1D]/5">
                      <p className="text-[10px] font-bold text-[#993C1D] uppercase tracking-widest">Interviewer Hub Config</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] text-white/30 uppercase tracking-widest mb-1.5">Question Type</label>
                          <select
                            value={formData.interviewType}
                            onChange={e => setFormData({ ...formData, interviewType: e.target.value })}
                            className="w-full bg-[#050e1a] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#993C1D] outline-none transition"
                          >
                            <option value="open">Open Opinion</option>
                            <option value="tf">True / False</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] text-white/30 uppercase tracking-widest mb-1.5">Interviewer Tip (Optional)</label>
                          <textarea
                            value={formData.aiRationale}
                            onChange={e => setFormData({ ...formData, aiRationale: e.target.value })}
                            className="w-full bg-[#050e1a] border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:border-[#993C1D] outline-none transition h-10"
                            placeholder="e.g. Expected: FALSE..."
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] text-white/30 uppercase tracking-widest mb-1.5">Target Personas</label>
                        <div className="grid grid-cols-3 gap-2 mt-2">
                          {['cxo', 'bdo', 'operator', 'agent', 'association', 'insuretech'].map(p => (
                            <label key={p} className="flex items-center gap-2 cursor-pointer group">
                              <input
                                type="checkbox"
                                checked={formData.personas?.includes(p)}
                                onChange={e => {
                                  const newP = e.target.checked 
                                    ? [...(formData.personas || []), p]
                                    : (formData.personas || []).filter(x => x !== p)
                                  setFormData({ ...formData, personas: newP })
                                }}
                                className="w-4 h-4 rounded border-white/10 bg-[#050e1a] accent-[#993C1D]"
                              />
                              <span className="text-[10px] uppercase tracking-widest text-white/30 group-hover:text-white transition">{p}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  {selectedGame?.type === 'CROSSWORD' && (
                    <>
                      <div>
                        <label className="block text-[10px] text-white/30 uppercase tracking-widest mb-1.5">Answer Word (Takaful Key)</label>
                        <input
                          type="text"
                          required
                          value={formData.answer}
                          onChange={e => {
                            const val = e.target.value.toUpperCase()
                            setFormData({ ...formData, answer: val, gridLen: val.length })
                          }}
                          className="w-full bg-[#050e1a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 outline-none transition uppercase"
                          placeholder="e.g. MALAYSIA"
                        />
                        <p className="text-[10px] text-blue-400/50 mt-1 uppercase tracking-widest">Layout will be automatically generated</p>
                      </div>
                    </>
                  )}
                </div>

                {(selectedGame?.type === 'QUIZ') && (
                  <div>
                    <label className="block text-[10px] text-white/30 uppercase tracking-widest mb-1.5">AI Rationale</label>
                    <textarea
                      value={formData.aiRationale}
                      onChange={e => setFormData({ ...formData, aiRationale: e.target.value })}
                      className="w-full bg-[#050e1a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 outline-none transition h-24"
                      placeholder="Why is the recommended option correct?"
                    />
                  </div>
                )}

                {selectedGame?.type === 'MYTH' && (
                  <div className="space-y-4 border border-amber-500/20 rounded-xl p-4 bg-amber-500/5">
                    <p className="text-[10px] font-bold text-amber-500/70 uppercase tracking-widest">Beat the AI Fields</p>
                    <div>
                      <label className="block text-[10px] text-white/30 uppercase tracking-widest mb-1.5">Scenario Title</label>
                      <input
                        type="text"
                        value={formData.answer}
                        onChange={e => setFormData({ ...formData, answer: e.target.value })}
                        className="w-full bg-[#050e1a] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-amber-500/50 outline-none transition"
                        placeholder="e.g. Lead Prioritisation"
                      />
                      <p className="text-[10px] text-white/20 mt-1">Groups questions into a category — multiple questions per scenario = random challenge each round</p>
                    </div>
                    <div>
                      <label className="block text-[10px] text-white/30 uppercase tracking-widest mb-1.5">Category Chip</label>
                      <input
                        type="text"
                        value={formData.sectionLabel}
                        onChange={e => setFormData({ ...formData, sectionLabel: e.target.value })}
                        className="w-full bg-[#050e1a] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-amber-500/50 outline-none transition"
                        placeholder="e.g. SALES & DISTRIBUTION"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-white/30 uppercase tracking-widest mb-1.5">Host Closing Script (AI Rationale)</label>
                      <textarea
                        value={formData.aiRationale}
                        onChange={e => setFormData({ ...formData, aiRationale: e.target.value })}
                        className="w-full bg-[#050e1a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-amber-500/50 outline-none transition h-20"
                        placeholder="e.g. The AI weighted Hassan higher. The point isn't that AI is always right..."
                      />
                    </div>
                  </div>
                )}

                {selectedGame?.type !== 'CROSSWORD' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="block text-[10px] text-white/30 uppercase tracking-widest">Options</label>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, options: [...formData.options, selectedGame?.type === 'MYTH' ? { label: '', shortLabel: '', subtitle: '', badge: '', isCorrect: false } : { label: '', isCorrect: false }] })}
                        className="text-[10px] text-blue-400 hover:text-blue-300 uppercase tracking-widest"
                      >
                        + Add Option
                      </button>
                    </div>
                    {formData.options.map((opt, i) => (
                      <div key={i} className={`rounded-xl border p-3 space-y-2 ${opt.isCorrect ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-white/5 bg-[#050e1a]'}`}>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            required
                            placeholder={selectedGame?.type === 'MYTH' ? `LEAD A / POLICY B / OPTION C` : `Option ${i + 1}`}
                            value={opt.label}
                            onChange={e => {
                              const newOps = [...formData.options]
                              newOps[i] = { ...newOps[i], label: e.target.value }
                              setFormData({ ...formData, options: newOps })
                            }}
                            className="flex-1 bg-[#050e1a] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-blue-500 outline-none transition"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newOps = formData.options.map((o, idx) => ({ ...o, isCorrect: idx === i }))
                              setFormData({ ...formData, options: newOps })
                            }}
                            className={`px-3 rounded-lg text-[10px] uppercase tracking-widest border transition whitespace-nowrap ${
                              opt.isCorrect ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'bg-white/5 border-white/10 text-white/20'
                            }`}
                          >
                            {selectedGame?.type === 'AGENCY' ? 'AI' : 'Correct'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, options: formData.options.filter((_, idx) => idx !== i) })}
                            className="px-2 text-white/20 hover:text-red-400 transition"
                          >✕</button>
                        </div>
                        {selectedGame?.type === 'MYTH' && (
                          <>
                            <input
                              type="text"
                              placeholder="Display name — e.g. Hassan, Age 40"
                              value={opt.shortLabel || ''}
                              onChange={e => {
                                const newOps = [...formData.options]
                                newOps[i] = { ...newOps[i], shortLabel: e.target.value }
                                setFormData({ ...formData, options: newOps })
                              }}
                              className="w-full bg-[#050e1a] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-amber-500/50 outline-none transition"
                            />
                            <input
                              type="text"
                              placeholder="Profile data — e.g. Status: Married|Income: High|Interest: Protection"
                              value={opt.subtitle || ''}
                              onChange={e => {
                                const newOps = [...formData.options]
                                newOps[i] = { ...newOps[i], subtitle: e.target.value }
                                setFormData({ ...formData, options: newOps })
                              }}
                              className="w-full bg-[#050e1a] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-amber-500/50 outline-none transition"
                            />
                            <input
                              type="text"
                              placeholder="Reveal rationale — shown in AI reveal screen"
                              value={opt.badge || ''}
                              onChange={e => {
                                const newOps = [...formData.options]
                                newOps[i] = { ...newOps[i], badge: e.target.value }
                                setFormData({ ...formData, options: newOps })
                              }}
                              className="w-full bg-[#050e1a] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-amber-500/50 outline-none transition"
                            />
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-4 flex gap-2">
                  <button
                    disabled={loading}
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-quiz-label text-[10px] tracking-widest uppercase py-4 rounded-xl transition disabled:opacity-50"
                  >
                    {loading ? 'SAVING...' : editingId ? 'UPDATE QUESTION' : 'ADD QUESTION'}
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      onClick={() => resetForm(selectedGame, questions.length + 1)}
                      className="bg-white/5 hover:bg-white/10 text-white/40 px-4 rounded-xl text-[10px] uppercase font-quiz-label"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* List */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="font-quiz-label text-xs tracking-[0.2em] text-white/30 uppercase">
              Current Questions ({questions.length})
            </h2>
            
            {questions.length === 0 ? (
              <div className="bg-white/5 rounded-2xl p-12 text-center border border-dashed border-white/10">
                <p className="text-white/20 text-sm">No questions for this game yet.</p>
              </div>
            ) : (
              questions.map((q, i) => (
                <div 
                  key={q._id} 
                  className={`bg-[#0c1d38] border border-white/5 rounded-2xl p-6 shadow-xl transition-all duration-300 animate-fade-up`}
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs font-bold text-blue-500">#{q.order}</span>
                        <span className="text-white/20 text-[10px] uppercase tracking-widest">{selectedGame?.type}</span>
                      </div>
                      <p className="text-white text-lg font-light leading-snug">{q.text}</p>
                      
                      {q.options?.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {q.options.map((opt, oi) => (
                            <span 
                              key={oi} 
                              className={`text-[10px] px-3 py-1 rounded-full border ${
                                opt.isCorrect ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-white/5 border-white/10 text-white/40'
                              }`}
                            >
                              {opt.label}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      {q.answer && (
                        <div className="mt-3 flex gap-4 text-[10px] font-bold uppercase tracking-widest">
                          <div>
                            <span className="text-white/20">Answer: </span>
                            <span className="text-amber-400">{q.answer}</span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(q)}
                        className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition"
                        title="Edit"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-5m-5 5l8.5-8.5a2.121 2.121 0 00-3-3L9 7l5 5z"></path></svg>
                      </button>
                      <button
                        onClick={() => handleDelete(q._id)}
                        className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/40 hover:text-red-400 transition"
                        title="Delete"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
