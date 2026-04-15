'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'

const CAT_LABELS = {
  pipeline: 'Lead Pipeline',
  agents: 'Agent Performance',
  lifecycle: 'Customer Lifecycle',
  visibility: 'Visibility & Ops'
}

export function AgencyResult({ result, eventId, sessionId }) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('assessment')
  const [form, setForm] = useState({ name: '', org: '', email: '', phone: '' })
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const aiResult = result.aiResult || null
  const metrics = aiResult?.aiCalculatedScores || result.metrics || {}
  const score = aiResult?.aiCalculatedScores
    ? Math.round(Object.values(aiResult.aiCalculatedScores).reduce((a, b) => a + b, 0) / Object.keys(aiResult.aiCalculatedScores).length)
    : (result.score || 0)

  const getScoreStyle = (s) => {
    if (s >= 90) return { label: 'Strong Foundation', color: 'text-emerald-500', bar: 'bg-emerald-500', bg: 'bg-emerald-50' }
    if (s >= 70) return { label: 'Solid Potential', color: 'text-indigo-500', bar: 'bg-indigo-500', bg: 'bg-indigo-50' }
    if (s >= 50) return { label: 'Growth Required', color: 'text-orange-500', bar: 'bg-orange-500', bg: 'bg-orange-50' }
    return { label: 'Reform Vital', color: 'text-rose-500', bar: 'bg-rose-500', bg: 'bg-rose-50' }
  }

  const { label, color, bar, bg } = getScoreStyle(score)

  const groupSolutions = (sols) => {
    if (!Array.isArray(sols)) return {}
    return sols.reduce((acc, s) => {
      acc[s.category] = acc[s.category] || []
      acc[s.category].push(s)
      return acc
    }, {})
  }

  const groupedSolutions = groupSolutions(aiResult?.solutions || [])

  const handleSubmitReport = async () => {
    if (!form.email) return
    setSubmitting(true)
    try {
      await api.submitLead(sessionId, {
        name: form.name,
        organisation: form.org,
        email: form.email,
        phone: form.phone
      })
      setSubmitted(true)
    } catch (err) {
      console.error('Failed to send report:', err)
      alert('Failed to send report. Please check your connection.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans relative selection:bg-indigo-500/10">

      {submitting && (
        <div className="absolute inset-0 bg-white/90 backdrop-blur-md z-[100] flex items-center justify-center">
          <div className="flex flex-col items-center gap-6">
            <div className="w-14 h-14 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin shadow-xl shadow-indigo-500/20" />
            <p className="font-bold text-slate-900 uppercase tracking-[0.2em] text-[10px]">Processing Diagnostic Matrix...</p>
          </div>
        </div>
      )}

      {/* STICKY HEADER & NAV WRAPPER */}
      <div className="sticky top-0 z-50 bg-white">
        {/* REFINED HEADER */}
        <header className="border-b border-slate-200 px-10 py-6 flex justify-between items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
              <span className="text-[9px] font-bold uppercase tracking-widest">Personalised AI Diagnostic</span>
            </div>
            <h1 className="text-2xl font-semibold text-slate-900 uppercase tracking-tight">Agency Health Assessment</h1>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">6-Month Projection</p>
              <p className="text-xs font-bold text-slate-900 uppercase tracking-widest">Distribution Efficiency</p>
            </div>
            <div className="h-10 w-px bg-slate-200" />
            <div className="px-4 py-2 bg-slate-900 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest">
              Report v1.2
            </div>
          </div>
        </header>

        {/* MODERN TAB NAVIGATION */}
        <nav className="flex justify-center border-b border-slate-200 py-2">
          <div className="bg-slate-100 p-1.5 rounded-2xl flex gap-1">
            {[
              { id: 'assessment', label: 'Assessment' },
              { id: 'actionPlan', label: 'Action Plan' },
              { id: 'solutions', label: 'Case Studies' }
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`px-8 py-2.5 rounded-xl font-bold text-[11px] uppercase tracking-widest transition-all ${activeTab === t.id
                  ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/50'
                  : 'text-slate-400 hover:text-slate-600'
                  }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </nav>
      </div>

      <div className="flex-1 max-w-6xl mx-auto w-full p-10 space-y-12 pb-32">

        {activeTab === 'assessment' && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* CORE METRICS CARD */}
            <div className="bg-white p-12 rounded-[1.5rem] shadow-sm border border-slate-200/60 flex flex-col md:flex-row items-center gap-16 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 blur-[80px] rounded-full" />
              <div className="relative w-56 h-56 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90 drop-shadow-sm">
                  <circle cx="112" cy="112" r="100" stroke="#f1f5f9" strokeWidth="16" fill="transparent" />
                  <circle cx="112" cy="112" r="100" stroke="currentColor" strokeWidth="16" fill="transparent"
                    strokeDasharray={628.3}
                    strokeDashoffset={628.3 - (628.3 * score) / 100}
                    className={`${color} transition-all duration-1000 ease-out`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-black text-slate-900 tracking-tighter tabular-nums">{score}</span>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Health Index</span>
                </div>
              </div>

              <div className="flex-1 space-y-6">
                <div>
                  <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${color} mb-1 block`}>Current Performance Tier</span>
                  <h2 className={`text-3xl font-extrabold uppercase tracking-tight ${color}`}>{label}</h2>
                </div>
                <p className="text-slate-500 leading-relaxed text-lg max-w-2xl">
                  Our AI has evaluated your agency's distribution dynamics across 32 critical data points. The resulting health map highlights significant opportunities in
                  <span className="font-bold text-slate-900"> lead conversion velocities</span> and agent performance management.
                </p>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mt-10 pt-10 border-t border-slate-100">
                  {Object.entries(CAT_LABELS).map(([key, label]) => (
                    <div key={key} className="space-y-1">
                      <div className="text-3xl font-extrabold text-slate-900 tabular-nums">{metrics[key] || 0}%</div>
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* OPERATIONAL MAP */}
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <h3 className="font-black text-xs uppercase tracking-[0.2em] text-slate-400">Operational Lag Map</h3>
                <div className="h-px bg-slate-200 flex-1" />
              </div>
              <div className="bg-white p-10 rounded-[1.5rem] shadow-sm border border-slate-200/60 grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10">
                {Object.entries(CAT_LABELS).map(([key, label]) => {
                  const val = metrics[key] || 0;
                  const s = getScoreStyle(val);
                  return (
                    <div key={key} className="space-y-3">
                      <div className="flex justify-between items-end">
                        <span className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">{label}</span>
                        <span className={`text-xs font-black ${s.color} tabular-nums`}>{val}%</span>
                      </div>
                      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/50">
                        <div className={`h-full rounded-full transition-all duration-1000 ${s.bar}`} style={{ width: `${val}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {aiResult && (
              <div className="bg-indigo-900 text-white p-12 rounded-[1.5rem] shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full" />
                <div className="relative z-10 space-y-6">
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-300">Diagnostic Synthesis</span>
                  <p className="text-2xl font-bold leading-tight tracking-tight italic">"{aiResult.summary}"</p>
                  <div className="h-px bg-white/10 w-full" />
                  <p className="text-indigo-100/70 text-base leading-relaxed max-w-4xl">{aiResult.diagnosis}</p>
                </div>
              </div>
            )}

            <div className="flex justify-center pt-10">
              <button onClick={() => setActiveTab('actionPlan')} className="bg-slate-900 text-white px-14 py-5 rounded-2xl font-semibold text-[14px] uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 active:scale-95 group">
                Next Phase: Action Plan <span className="inline-block transform transition-transform group-hover:translate-x-1 ml-2">→</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'actionPlan' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-12">
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.4em]">Optimisation Strategy</span>
              <h2 className="text-3xl font-black uppercase tracking-tight text-slate-900">90-Day Operational Roadmap</h2>
              <p className="text-slate-500 text-lg leading-relaxed">Prioritizing high-velocity improvements to reset your agency's distribution trajectory.</p>
            </div>

            <div className="grid gap-6">
              {(aiResult?.actions || []).map((action, i) => (
                <div key={i} className="bg-white p-8 rounded-[1.5rem] shadow-sm border border-slate-200/60 relative overflow-hidden group hover:shadow-md transition-all">
                  <div className="absolute top-0 left-0 w-2 h-full bg-indigo-600" />
                  <div className="flex items-start gap-8">
                    <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black shrink-0 text-xl shadow-lg">{i + 1}</div>
                    <div className="space-y-5 flex-1 pt-1">
                      <div className="flex items-center gap-4">
                        <h4 className="text-2xl font-semibold text-slate-900 tracking-tight">{action.title}</h4>
                        <span className="bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border border-emerald-100">Critical Priority</span>
                      </div>
                      <p className="text-slate-600 text-base leading-relaxed">{action.description}</p>
                      {action.timeframe && (
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                          <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest leading-none">{action.timeframe} Deployment</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center pt-10">
              <button onClick={() => setActiveTab('solutions')} className="bg-indigo-600 text-white px-14 py-5 rounded-2xl font-semibold text-[14px] uppercase tracking-[0.2em] hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 active:scale-95 group">
                Benchmark Case Studies <span className="inline-block transform transition-transform group-hover:translate-x-1 ml-2">→</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'solutions' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-12">
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.4em]">Network Standards</span>
              <h2 className="text-3xl font-black uppercase tracking-tight text-slate-900">Benchmark Prototypes</h2>
              <p className="text-slate-500 text-lg leading-relaxed">Structural patterns from high-performance agencies that have addressed these identical gaps.</p>
            </div>

            <div className="bg-white rounded-[1.5rem] overflow-hidden shadow-sm border border-slate-200">
              <div className="p-12 space-y-12">
                {Object.entries(groupedSolutions).map(([cat, sols]) => (
                  <div key={cat} className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em]">{cat} Matrix</div>
                      <div className="h-[2px] bg-slate-100 flex-1" />
                      <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{sols.length} Optimizations</div>
                    </div>
                    <div className="grid gap-4">
                      {sols.map((s, i) => (
                        <div key={i} className="flex gap-8 p-8 rounded-[1rem] bg-slate-50 border border-slate-100 group transition-all hover:bg-white hover:shadow-xl hover:shadow-slate-200/50">
                          <div className="flex-1 space-y-2">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Institutional Inertia</p>
                            <p className="text-slate-500 text-base leading-relaxed">{s.currentState}</p>
                          </div>
                          <div className="flex items-center text-slate-300 shrink-0 text-3xl group-hover:text-indigo-600 transition-colors">→</div>
                          <div className="flex-1 space-y-2">
                            <p className="text-[9px] font-black text-indigo-500 uppercase tracking-[0.2em]">Optimised Pipeline</p>
                            <p className="text-slate-900 font-semibold text-base leading-relaxed tracking-tight">{s.whatChanges}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* REFINED LEAD FORM */}
              <div className="bg-slate-50 p-12 border-t border-slate-200">
                <div className="bg-white p-10 rounded-[1.5rem] shadow-md border border-slate-100 space-y-12">
                  <div className="max-w-3xl space-y-6">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Validation Modules</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(aiResult?.solutions || []).slice(0, 6).map((s, i) => (
                        <div key={i} className="flex items-center gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                          <div className="w-6 h-6 rounded-lg bg-emerald-500 text-white flex items-center justify-center text-[10px] font-black">✓</div>
                          <p className="text-sm font-bold text-slate-700">Addressed in <span className="text-indigo-600">{s.module}</span></p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
                    <p className="text-indigo-900 border-l-4 border-l-indigo-600 pl-6 text-sm leading-relaxed">
                      <span className="font-extrabold text-indigo-600">SalesVerse</span> is the precision distribution platform engineered for the industry. We plug structural engagement gaps with zero operational friction. Modernisation cycle: 30 days.
                    </p>
                  </div>

                  {!submitted ? (
                    <div className="space-y-10">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        {[
                          { id: 'name', label: 'Identity / Full Name', placeholder: 'Enter your name' },
                          { id: 'org', label: 'Organisation', placeholder: 'Institutional name' },
                          { id: 'email', label: 'Communication Hub', placeholder: 'Corporate email' },
                          { id: 'phone', label: 'Secure Line', placeholder: 'Primary contact number' }
                        ].map(field => (
                          <div key={field.id} className="space-y-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{field.label}</label>
                            <input
                              className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-sm font-medium"
                              placeholder={field.placeholder}
                              value={form[field.id]}
                              onChange={e => setForm({ ...form, [field.id]: e.target.value })}
                            />
                          </div>
                        ))}
                      </div>
                      <div className="text-center space-y-10 pt-4">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Confidential Diagnostic Transmission</p>
                        <div className="flex flex-col md:flex-row gap-5 justify-center">
                          <button onClick={() => setActiveTab('actionPlan')} className="px-12 py-5 border border-slate-200 rounded-2xl font-semibold text-[14px] uppercase tracking-widest hover:bg-slate-50 transition-all text-slate-500">Back</button>
                          <button onClick={handleSubmitReport} className="bg-slate-900 text-white px-16 py-5 rounded-2xl font-semibold text-[14px] uppercase tracking-[0.2em] hover:bg-slate-800 shadow-2xl shadow-slate-900/40 transition-all active:scale-95">Initialise Full Report</button>
                          <button onClick={() => {
                            Object.keys(sessionStorage).forEach(k => { if (k.startsWith('player_')) sessionStorage.removeItem(k) })
                            router.push('/play')
                          }} className="px-12 py-5 border border-slate-200 rounded-2xl font-semibold text-[14px] uppercase tracking-widest hover:bg-slate-50 transition-all text-slate-500">Reset Session</button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-emerald-50 p-12 rounded-[2.5rem] border border-emerald-100 text-center animate-in zoom-in-95 duration-500">
                      <div className="w-20 h-20 bg-emerald-500 text-white rounded-3xl flex items-center justify-center text-4xl mx-auto mb-8 shadow-xl shadow-emerald-200 rotate-12 group-hover:rotate-0 transition-transform">✓</div>
                      <h4 className="text-3xl font-black text-emerald-900 uppercase tracking-tight">Transmission Complete</h4>
                      <p className="text-emerald-800/60 mt-4 text-lg font-medium">Your architectural diagnostic has been dispatched. Review your inbox for the full synthesis.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
