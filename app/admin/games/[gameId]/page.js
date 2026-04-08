'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { api } from '@/lib/api'

const EMPTY_OPT = { label: '', isCorrect: false, pipeline: 0, agents: 0, lifecycle: 0, visibility: 0 }

const CATEGORIES = [
  'Lead Pipeline & Acquisition',
  'Agent Performance',
  'Customer Lifecycle',
  'Visibility & Operations'
]

export default function AdminGameEditorPage() {
  const { gameId } = useParams()
  const router = useRouter()
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [qForm, setQForm] = useState({ 
    text: '', 
    order: 1, 
    answer: '', 
    sectionLabel: CATEGORIES[0]
  })
  const [pendingOptions, setPendingOptions] = useState([])
  const [optForm, setOptForm] = useState(EMPTY_OPT)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  async function load() {
    const data = await api.getAdminQuestions(gameId)
    setQuestions(data)
    setQForm(f => ({ ...f, order: data.length + 1 }))
    setLoading(false)
  }

  useEffect(() => { load() }, [gameId])

  function addOption() {
    if (!optForm.label.trim()) return
    setPendingOptions(prev => [...prev, {
      _id: Date.now().toString(),
      label: optForm.label,
      isCorrect: optForm.isCorrect,
      scoreImpact: {
        pipeline: Number(optForm.pipeline),
        agents: Number(optForm.agents),
        lifecycle: Number(optForm.lifecycle),
        visibility: Number(optForm.visibility)
      }
    }])
    setOptForm(EMPTY_OPT)
  }

  async function addQuestion(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const aiRec = qForm.aiRecommended
        ? pendingOptions.find(o => o._id === qForm.aiRecommended)?._id
        : null

      await api.createQuestion(gameId, {
        text: qForm.text,
        order: Number(qForm.order),
        sectionLabel: qForm.sectionLabel,
        answer: qForm.answer || null,
        aiRecommended: null,
        options: pendingOptions.map(o => ({
          label: o.label,
          isCorrect: o.isCorrect,
          scoreImpact: o.scoreImpact
        }))
      })
      setQForm({ 
        text: '', 
        order: questions.length + 2, 
        answer: '', 
        sectionLabel: qForm.sectionLabel // preserve last category for speed
      })
      setPendingOptions([])
      load()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function deleteQuestion(id) {
    await api.deleteQuestion(id)
    setQuestions(q => q.filter(x => String(x._id) !== id))
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/admin/games')} className="text-slate-400 hover:text-white transition text-sm">
            ← Back to Games
          </button>
          <h1 className="text-3xl font-bold">Question Builder</h1>
        </div>

        {/* Add Question Form */}
        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 space-y-5">
          <h2 className="text-xl font-bold">Add Question</h2>
          <form onSubmit={addQuestion} className="space-y-4">
            <div className="flex gap-3">
              <input
                className="flex-1 bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 transition"
                placeholder="Question text"
                value={qForm.text}
                onChange={e => setQForm(f => ({ ...f, text: e.target.value }))}
                required
              />
              <input
                type="number"
                min="1"
                className="w-20 bg-slate-700 border border-slate-600 rounded-xl px-3 py-3 text-white outline-none text-center"
                placeholder="#"
                value={qForm.order}
                onChange={e => setQForm(f => ({ ...f, order: e.target.value }))}
              />
            </div>

            <div className="flex gap-3">
              <select
                className="flex-1 bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 transition"
                value={qForm.sectionLabel}
                onChange={e => setQForm(f => ({ ...f, sectionLabel: e.target.value }))}
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <input
              className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white outline-none focus:border-amber-500 transition"
              placeholder="Correct answer word (CROSSWORD only)"
              value={qForm.answer}
              onChange={e => setQForm(f => ({ ...f, answer: e.target.value }))}
            />

            {/* Option Builder */}
            <div className="bg-slate-700/50 rounded-xl p-4 space-y-3 border border-slate-600">
              <p className="text-sm text-slate-300 font-semibold">Options</p>

              <div className="flex gap-2 flex-wrap items-start">
                <input
                  className="flex-1 min-w-48 bg-slate-600 border border-slate-500 rounded-lg px-3 py-2 text-sm text-white outline-none"
                  placeholder="Option label"
                  value={optForm.label}
                  onChange={e => setOptForm(f => ({ ...f, label: e.target.value }))}
                />
                <label className="flex items-center gap-1.5 text-sm text-slate-300 self-center">
                  <input
                    type="checkbox"
                    checked={optForm.isCorrect}
                    onChange={e => setOptForm(f => ({ ...f, isCorrect: e.target.checked }))}
                    className="w-4 h-4"
                  />
                  Correct
                </label>
              </div>

              <div className="flex gap-2 flex-wrap">
                {['pipeline', 'agents', 'lifecycle', 'visibility'].map(m => (
                  <label key={m} className="flex flex-col items-center gap-1 text-xs text-slate-400">
                    <span className="capitalize">{m}</span>
                    <input
                      type="number"
                      className="w-16 bg-slate-600 border border-slate-500 rounded px-2 py-1 text-sm text-white outline-none text-center"
                      value={optForm[m]}
                      onChange={e => setOptForm(f => ({ ...f, [m]: e.target.value }))}
                    />
                  </label>
                ))}
                <button
                  type="button"
                  onClick={addOption}
                  disabled={!optForm.label.trim()}
                  className="self-end bg-blue-600 hover:bg-blue-500 disabled:opacity-50 px-4 py-2 rounded-lg text-sm font-semibold transition"
                >
                  + Add Option
                </button>
              </div>

              {pendingOptions.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-slate-600">
                  {pendingOptions.map((opt, i) => (
                    <div key={opt._id} className="flex items-center gap-2 bg-slate-600 rounded-lg px-3 py-2 text-sm">
                      <span className="flex-1 text-white">{opt.label}</span>
                      {opt.isCorrect && <span className="text-green-400 text-xs font-bold">✓ Correct</span>}
                      <span className="text-slate-400 text-xs">
                        Pi:${opt.scoreImpact.pipeline} Ag:${opt.scoreImpact.agents} Li:${opt.scoreImpact.lifecycle} Vi:${opt.scoreImpact.visibility}
                      </span>
                      <button
                        type="button"
                        onClick={() => setPendingOptions(prev => prev.filter((_, j) => j !== i))}
                        className="text-red-400 hover:text-red-300 ml-1"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={saving || !qForm.text}
              className="bg-green-600 hover:bg-green-500 disabled:opacity-50 px-6 py-3 rounded-xl font-semibold transition"
            >
              {saving ? 'Saving...' : 'Add Question'}
            </button>
          </form>
        </div>

        {/* Questions List */}
        <div className="space-y-3">
          <h2 className="text-xl font-bold">Questions ({questions.length})</h2>
          {loading ? (
            <p className="text-slate-400">Loading...</p>
          ) : questions.length === 0 ? (
            <p className="text-slate-500">No questions yet.</p>
          ) : (
            questions.map(q => (
              <div key={q._id} className="bg-slate-800 rounded-xl p-5 border border-slate-700">
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-slate-500 text-sm">#{q.order}</span>
                      {q.sectionLabel && (
                        <span className="text-[10px] font-bold text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded uppercase tracking-wider">
                          {q.sectionLabel}
                        </span>
                      )}
                      {q.answer && (
                        <span className="text-xs text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">
                          Answer: {q.answer}
                        </span>
                      )}
                    </div>
                    <p className="font-semibold text-white">{q.text}</p>
                  </div>
                  <button
                    onClick={() => deleteQuestion(String(q._id))}
                    className="text-red-400 hover:text-red-300 text-sm transition shrink-0"
                  >
                    Delete
                  </button>
                </div>
                {q.options.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {q.options.map(opt => (
                      <span
                        key={opt._id}
                        className={`text-xs px-3 py-1.5 rounded-lg border ${
                          opt.isCorrect
                            ? 'bg-green-500/20 border-green-500/30 text-green-400'
                            : 'bg-slate-700 border-slate-600 text-slate-400'
                        }`}
                      >
                        {opt.label}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
