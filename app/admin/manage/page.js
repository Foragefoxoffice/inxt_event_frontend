'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { api } from '@/lib/api'

export default function AdminManagePage() {
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

  useEffect(() => {
    async function loadGames() {
      try {
        const data = await api.getAdminGames()
        setGames(data)
        
        if (data.length > 0) {
          // If gameId is in URL, find it, otherwise take the first
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
    <main className="p-10 animate-in fade-in duration-500">
      
      {/* HEADER & TABS */}
      <div className="flex flex-col gap-8 mb-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black text-[#003B6E] tracking-tight uppercase">Content <span className="text-[#00ADEF]">Engine</span></h1>
            <p className="text-sm text-[#003B6E]/40 font-bold uppercase tracking-widest mt-1">Design and curate the SalesVerse experience</p>
          </div>
          <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-[#00ADEF]/10">
            <div className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-[0.2em] uppercase bg-[#00ADEF]/10 text-[#00ADEF]`}>
              Editing Mode
            </div>
          </div>
        </div>

        <div className="flex bg-white/50 backdrop-blur-md p-1.5 rounded-2xl border border-[#00ADEF]/10 w-fit">
          {games.map(g => (
            <button
              key={g._id}
              onClick={() => handleSelectGame(g)}
              className={`px-6 py-3 rounded-xl text-[10px] font-black tracking-[0.2em] uppercase transition-all whitespace-nowrap ${
                selectedGame?._id === g._id 
                  ? 'bg-[#050e1a] text-white shadow-xl shadow-black/20' 
                  : 'text-[#003B6E]/40 hover:text-[#003B6E] hover:bg-white/50'
              }`}
            >
              {g.title}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-10">
        
        {/* FORM SIDEBAR */}
        <div className="col-span-12 xl:col-span-5">
          <div className="bg-white rounded-3xl p-8 shadow-xl shadow-[#003B6E]/5 border border-[#00ADEF]/10 sticky top-10 overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xs font-black tracking-[0.3em] text-[#00ADEF] uppercase flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={editingId ? "M11 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-5m-5 5l8.5-8.5a2.121 2.121 0 00-3-3L9 7l5 5z" : "M12 4v16m8-8H4"} /></svg>
                {editingId ? 'Edit Draft' : 'New Content'}
              </h3>
              {editingId && (
                <button
                  type="button"
                  onClick={() => resetForm(selectedGame, questions.length + 1)}
                  className="text-[10px] font-black text-[#003B6E]/30 hover:text-red-500 uppercase tracking-widest transition-colors"
                >
                  Clear Edit
                </button>
              )}
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto pr-4 custom-scrollbar">
              <div className="space-y-5">
                <div>
                  <label className="block text-[10px] text-[#003B6E]/40 uppercase font-black tracking-widest mb-2">Question or Statement</label>
                  <textarea
                    required
                    value={formData.text}
                    onChange={e => setFormData({ ...formData, text: e.target.value })}
                    className="w-full bg-[#F8FBFF] border border-[#E2E8F0] rounded-2xl px-5 py-4 text-sm font-bold text-[#003B6E] outline-none focus:border-[#00ADEF] transition-all h-32 resize-none"
                    placeholder="Describe the challenge or scenario..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] text-[#003B6E]/40 uppercase font-black tracking-widest mb-2">Display Order</label>
                    <input
                      type="number"
                      required
                      value={formData.order}
                      onChange={e => setFormData({ ...formData, order: parseInt(e.target.value) })}
                      className="w-full bg-[#F8FBFF] border border-[#E2E8F0] rounded-2xl px-5 py-4 text-sm font-bold text-[#003B6E] outline-none focus:border-[#00ADEF]"
                    />
                  </div>

                  {selectedGame?.type === 'INTERVIEW' && (
                    <div>
                      <label className="block text-[10px] text-[#003B6E]/40 uppercase font-black tracking-widest mb-2">Polling Mode</label>
                      <select
                        value={formData.interviewType}
                        onChange={e => setFormData({ ...formData, interviewType: e.target.value })}
                        className="w-full bg-[#F8FBFF] border border-[#E2E8F0] rounded-2xl px-5 py-4 text-sm font-bold text-[#003B6E] outline-none focus:border-[#00ADEF]"
                      >
                        <option value="open">Open Opinion</option>
                        <option value="tf">True / False</option>
                      </select>
                    </div>
                  )}

                  {selectedGame?.type === 'CROSSWORD' && (
                    <div className="col-span-2">
                       <label className="block text-[10px] text-[#003B6E]/40 uppercase font-black tracking-widest mb-2">Correct Keyword</label>
                       <input
                         type="text"
                         required
                         value={formData.answer}
                         onChange={e => {
                           const val = e.target.value.toUpperCase()
                           setFormData({ ...formData, answer: val, gridLen: val.length })
                         }}
                         className="w-full bg-[#F8FBFF] border border-[#E2E8F0] rounded-2xl px-5 py-4 text-sm font-mono text-[#00ADEF] outline-none focus:border-[#00ADEF] uppercase"
                         placeholder="E.G. TAKAFUL"
                       />
                       <p className="text-[9px] text-[#00ADEF]/50 mt-1 uppercase font-bold tracking-widest">Grid layout will automatically calibrate</p>
                    </div>
                  )}
                </div>

                {(selectedGame?.type === 'MYTH' || selectedGame?.type === 'AGENCY') && (
                  <div className="space-y-4 pt-4 border-t border-[#00ADEF]/5">
                     <p className="text-[10px] font-black text-[#00ADEF] uppercase tracking-widest">Logic & Metadata</p>
                     {selectedGame?.type === 'MYTH' && (
                       <input
                        type="text"
                        value={formData.answer}
                        onChange={e => setFormData({ ...formData, answer: e.target.value })}
                        className="w-full bg-[#F8FBFF] border border-[#E2E8F0] rounded-2xl px-5 py-3 text-sm font-bold text-[#003B6E]"
                        placeholder="Scenario Category (e.g. Lead Management)"
                      />
                     )}
                     <textarea
                        value={formData.aiRationale}
                        onChange={e => setFormData({ ...formData, aiRationale: e.target.value })}
                        className="w-full bg-[#F8FBFF] border border-[#E2E8F0] rounded-2xl px-5 py-3 text-xs font-medium text-[#003B6E]/70 h-24"
                        placeholder="AI Rationale / Closing Script..."
                      />
                  </div>
                )}

                {selectedGame?.type !== 'CROSSWORD' && (
                  <div className="space-y-4 pt-4 border-t border-[#00ADEF]/5">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-black text-[#003B6E] uppercase tracking-widest">Options & Keys</p>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, options: [...formData.options, selectedGame?.type === 'MYTH' ? { label: '', shortLabel: '', subtitle: '', badge: '', isCorrect: false } : { label: '', isCorrect: false }] })}
                        className="text-[9px] font-black text-[#00ADEF] hover:text-[#003B6E] uppercase tracking-widest transition-colors"
                      >
                        + Add Choice
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      {formData.options.map((opt, i) => (
                        <div key={i} className={`p-4 rounded-2xl border transition-all ${opt.isCorrect ? 'bg-[#7BC242]/5 border-[#7BC242]/30 shadow-md shadow-[#7BC242]/5' : 'bg-[#F8FBFF] border-[#E2E8F0]'}`}>
                          <div className="flex gap-3">
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
                              className="flex-1 bg-transparent border-none p-0 text-sm font-bold text-[#003B6E] outline-none placeholder:opacity-30"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const newOps = formData.options.map((o, idx) => ({ ...o, isCorrect: idx === i }))
                                setFormData({ ...formData, options: newOps })
                              }}
                              className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${
                                opt.isCorrect ? 'bg-[#7BC242] text-white border-transparent' : 'bg-white text-[#003B6E]/30 border-[#E2E8F0] hover:text-[#00ADEF]'
                              }`}
                            >
                              {selectedGame?.type === 'AGENCY' ? 'TARGET' : 'KEY'}
                            </button>
                            <button type="button" onClick={() => setFormData({ ...formData, options: formData.options.filter((_, idx) => idx !== i) })} className="text-[#003B6E]/20 hover:text-red-500 transition-colors">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </div>
                          {selectedGame?.type === 'MYTH' && (
                            <div className="mt-3 space-y-2 pt-3 border-t border-[#00ADEF]/5">
                              <input placeholder="Short Name" value={opt.shortLabel} onChange={e => {const n=[...formData.options]; n[i].shortLabel=e.target.value; setFormData({...formData, options:n})}} className="w-full bg-white/50 rounded-xl px-3 py-1.5 text-[10px] font-bold outline-none" />
                              <input placeholder="Metadata (Bio)" value={opt.subtitle} onChange={e => {const n=[...formData.options]; n[i].subtitle=e.target.value; setFormData({...formData, options:n})}} className="w-full bg-white/50 rounded-xl px-3 py-1.5 text-[10px] outline-none" />
                              <input placeholder="Reveal Script" value={opt.badge} onChange={e => {const n=[...formData.options]; n[i].badge=e.target.value; setFormData({...formData, options:n})}} className="w-full bg-white/50 rounded-xl px-3 py-1.5 text-[10px] italic outline-none" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-6">
                 <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-[#050e1a] hover:bg-[#00ADEF] text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-black/10 transition-all active:scale-95 disabled:opacity-30"
                >
                  {loading ? 'Processing...' : editingId ? 'Update Content' : 'Publish Content'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* CONTENT LIST */}
        <div className="col-span-12 xl:col-span-7 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xs font-black tracking-[0.3em] text-[#003B6E]/40 uppercase">Published Challenge Stack ({questions.length})</h2>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#7BC242] animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-widest text-[#7BC242]">Real-time Sync</span>
            </div>
          </div>
          
          {questions.length === 0 ? (
            <div className="bg-white rounded-3xl p-32 text-center border border-dashed border-[#00ADEF]/20 flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-[#F8FBFF] rounded-2xl flex items-center justify-center text-[#00ADEF]/20 mb-6">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
              </div>
              <p className="text-[#003B6E]/20 text-xs font-black uppercase tracking-widest leading-relaxed">No content modules deployed<br/>for this challenger engine</p>
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((q, i) => (
                <div 
                  key={q._id} 
                  className="bg-white rounded-3xl p-8 border border-[#00ADEF]/10 shadow-sm transition-all hover:shadow-xl hover:border-[#00ADEF]/40 group relative overflow-hidden"
                >
                  {/* Background Number */}
                  <div className="absolute -bottom-4 -right-2 text-[120px] font-black text-[#003B6E]/[0.02] leading-none pointer-events-none tracking-tighter">
                    {q.order}
                  </div>

                  <div className="flex items-start justify-between relative z-10">
                    <div className="flex-1 pr-10">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="bg-[#050e1a] text-white text-[9px] font-black px-2.5 py-1 rounded tracking-[0.1em]">#{q.order}</span>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${
                          selectedGame?.type === 'CROSSWORD' ? 'text-amber-500' : 
                          selectedGame?.type === 'INTERVIEW' ? 'text-[#00ADEF]' : 'text-[#7BC242]'
                        }`}>
                          {selectedGame?.type} ENGINE
                        </span>
                      </div>
                      
                      <p className="text-xl font-black text-[#003B6E] leading-tight mb-6">{q.text}</p>
                      
                      {q.options?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {q.options.map((opt, oi) => (
                            <div 
                              key={oi} 
                              className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border flex items-center gap-2 ${
                                opt.isCorrect ? 'bg-[#7BC242]/10 border-[#7BC242]/20 text-[#7BC242]' : 'bg-[#F8FBFF] border-[#E2E8F0] text-[#003B6E]/40'
                              }`}
                            >
                              {opt.isCorrect && <span className="w-1 h-1 rounded-full bg-[#7BC242]" />}
                              {opt.label}
                            </div>
                          ))}
                        </div>
                      )}

                      {q.answer && (
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#00ADEF]/5 text-[#00ADEF] text-[10px] font-black border border-[#00ADEF]/10 uppercase tracking-widest">
                          Key: {q.answer}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                       <button
                        onClick={() => handleEdit(q)}
                        className="w-10 h-10 rounded-xl bg-[#F8FBFF] border border-[#E2E8F0] text-[#003B6E]/30 flex items-center justify-center hover:bg-[#00ADEF] hover:text-white transition-all shadow-sm"
                        title="Edit Module"
                      >
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-5m-5 5l8.5-8.5a2.121 2.121 0 00-3-3L9 7l5 5z"></path></svg>
                      </button>
                      <button
                        onClick={() => handleDelete(q._id)}
                        className="w-10 h-10 rounded-xl bg-[#F8FBFF] border border-[#E2E8F0] text-[#003B6E]/30 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm"
                        title="Delete Module"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 173, 239, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 173, 239, 0.3);
        }
      `}</style>
    </main>
  )
}
