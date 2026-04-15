'use client'

import { useState, useEffect } from 'react'

const AGENCY_TYPES = [
  { id: 'new', label: 'New Agency', description: 'Under 2 years', range: 'Under 10 agents' },
  { id: 'growing', label: 'Growing Agency', description: 'Scaling headcount', range: '10–30 agents' },
  { id: 'mature', label: 'Mature Agency', description: 'Established book', range: '30–80 agents' },
  { id: 'enterprise', label: 'Enterprise', description: 'Multi-tier structure', range: '80+ agents' },
]

const SECTION_PALETTE = {
  'Lead Pipeline & Acquisition': { accent: '#4f46e5', light: '#eff6ff', label: '#1e40af' },
  'Agent Performance': { accent: '#10b981', light: '#ecfdf5', label: '#065f46' },
  'Customer Lifecycle': { accent: '#0ea5e9', light: '#f0f9ff', label: '#075985' },
  'Visibility & Operations': { accent: '#6366f1', light: '#eef2ff', label: '#3730a3' },
  'Visibility & Ops': { accent: '#6366f1', light: '#eef2ff', label: '#3730a3' },
}

function ProgressBar({ current, total }) {
  const pct = Math.round((current / total) * 100)
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Progress Matrix
        </span>
        <span className="text-[11px] font-black text-slate-900 tabular-nums">
          {pct}%
        </span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/50">
        <div className="h-full bg-indigo-600 rounded-full transition-all duration-700 ease-out" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function OptionCard({ option, isSelected, onToggle, index }) {
  const isAI = option.badge === 'AI-POWERED'

  return (
    <button
      onClick={onToggle}
      className={`w-full group relative flex items-start gap-4 p-5 rounded-2xl border-2 transition-all duration-200 text-left ${isSelected
        ? 'bg-indigo-50/50 border-indigo-600 shadow-lg shadow-indigo-600/5 z-10'
        : 'bg-white border-slate-200/60 hover:border-slate-300 hover:shadow-md'
        }`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-all ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-300'
        }`}>
        {isSelected && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none" className="text-white">
            <path d="M1 4L3.5 6.5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>

      <div className="flex-1 space-y-1">
        <div className={`text-sm font-bold tracking-tight transition-colors ${isSelected ? 'text-indigo-950' : 'text-slate-900'}`}>
          {option.label}
        </div>
        {option.subtitle && (
          <div className={`text-[12px] leading-relaxed transition-colors ${isSelected ? 'text-indigo-700/70' : 'text-slate-400'}`}>
            {option.subtitle}
          </div>
        )}
      </div>

      {isAI && (
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black tracking-widest transition-all ${isSelected ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-600'
          }`}>
          <span className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white animate-pulse' : 'bg-indigo-600'}`} />
          AI ENGINE
        </div>
      )}
    </button>
  )
}

export function AgencyGame({ questions = [], onSubmit, submitting, eventId }) {
  const [step, setStep] = useState(0)
  const [profile, setProfile] = useState({ type: '', agentCount: 25 })
  const [answers, setAnswers] = useState({})
  const [animKey, setAnimKey] = useState(0)

  useEffect(() => { setAnswers({}); setStep(0) }, [questions])

  const totalSteps = 1 + (questions?.length || 0)

  function goNext() {
    setAnimKey(k => k + 1)
    if (step < totalSteps - 1) setStep(step + 1)
    else {
      const mappedAnswers = questions.map(q => {
        const qId = q.questionId || q._id
        return { questionId: qId, selectedOptionIds: answers[qId] || [] }
      }).filter(a => a.selectedOptionIds.length > 0)
      onSubmit({ profile, answers: mappedAnswers, isHybridPayload: true, clientTimestamp: new Date().toISOString() })
    }
  }

  function goBack() { setAnimKey(k => k + 1); setStep(s => Math.max(0, s - 1)) }

  function handleToggle(questionId, optionId) {
    if (!questionId) return
    setAnswers(prev => {
      const cur = prev[questionId] || []
      return { ...prev, [questionId]: cur.includes(optionId) ? cur.filter(id => id !== optionId) : [...cur, optionId] }
    })
  }

  const qIdx = step - 1
  const q = step > 0 ? questions[qIdx] : null
  const qId = q?.questionId || q?._id
  const selectedIds = answers[qId] || []
  const sectionPalette = q ? (SECTION_PALETTE[q.sectionLabel] || SECTION_PALETTE['Visibility & Ops']) : null

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans selection:bg-indigo-600/10">
      <style>{`
        @keyframes diagnosticFadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-diagnostic { animation: diagnosticFadeIn 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
        
        input[type=range].modern-slider {
          -webkit-appearance: none;
          background: #e2e8f0;
          height: 6px;
          border-radius: 99px;
          outline: none;
        }
        input[type=range].modern-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 20px;
          height: 20px;
          background: #0f172a;
          border: 3px solid white;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
        }
      `}</style>

      {/* REFINED HEADER */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-5 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50 animate-pulse" />
          <span className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">Agency Diagnostic Hub</span>
        </div>

        {step > 0 && (
          <div className="hidden md:flex gap-1.5">
            {questions.map((_, i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i < qIdx ? 'w-6 bg-slate-900' : i === qIdx ? 'w-10 bg-indigo-600' : 'w-2 bg-slate-200'
                }`} />
            ))}
          </div>
        )}

        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-4 border-l border-slate-200">
          {step === 0 ? 'Diagnostic v2.4' : `Point ${qIdx + 1} of ${questions.length}`}
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col items-center justify-start p-6 md:p-10 pt-12 pb-44 overflow-y-auto">
        <div key={`step-${animKey}`} className="max-w-2xl w-full bg-white p-8 md:p-10 rounded-[1.5rem] shadow-sm border border-slate-200/60 animate-diagnostic relative overflow-hidden mb-10">
          <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-50/50 blur-[60px] rounded-full -mr-24 -mt-24 pointer-events-none" />

          {/* STEP 0: PROFILE SETUP */}
          {step === 0 && (
            <div className="space-y-10">
              <div className="space-y-4 text-center md:text-left">
                <div className="inline-block px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-[9px] font-black uppercase tracking-widest border border-amber-100/50">
                  Matrix Calibration
                </div>
                <h1 className="text-3xl font-semibold text-slate-900 tracking-tight leading-[0.95]">
                  Define your <br />agency profile
                </h1>
                <p className="text-slate-500 text-sm leading-relaxed max-w-md">
                  We customise the diagnostic engine based on your structural scale and operational maturity.
                </p>
              </div>

              {/* AGENCY SELECTION GRID */}
              <div className="space-y-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Institutional Tier</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {AGENCY_TYPES.map((t) => {
                    const sel = profile.type === t.label
                    return (
                      <button
                        key={t.id}
                        onClick={() => setProfile(p => ({ ...p, type: t.label }))}
                        className={`flex flex-col items-start gap-1 p-5 rounded-2xl border-2 transition-all duration-200 text-left ${sel ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-slate-50 border-slate-200/60 hover:border-slate-300'
                          }`}
                      >
                        <span className="text-sm font-semibold uppercase tracking-tight">{t.label}</span>
                        <span className={`text-[10px] font-bold ${sel ? 'text-indigo-100/70' : 'text-slate-400'}`}>{t.range}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* SCALE SLIDER */}
              <div className="space-y-6 pt-2">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Agents in structure</span>
                  <div className="text-right">
                    <span className="text-3xl font-black text-slate-900 tabular-nums">{profile.agentCount}</span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Units</span>
                  </div>
                </div>
                <div className="px-1">
                  <input
                    type="range"
                    className="modern-slider w-full"
                    min="1" max="200"
                    value={profile.agentCount}
                    onChange={e => setProfile(p => ({ ...p, agentCount: parseInt(e.target.value) }))}
                  />
                  <div className="flex justify-between mt-3 text-[9px] font-black text-slate-300 uppercase tracking-widest">
                    <span>Baseline 01</span>
                    <span>Scaling 200+</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEPS 1+: DIAGNOSTIC QUESTIONS */}
          {step > 0 && q && (
            <div className="space-y-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full border" style={{ backgroundColor: sectionPalette.light, borderColor: sectionPalette.accent + '20' }}>
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: sectionPalette.accent }} />
                  <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: sectionPalette.label }}>
                    {q.sectionLabel}
                  </span>
                </div>
                <span className="text-[11px] font-black text-slate-300 tabular-nums">
                  Analysis Point {qIdx + 1}/{questions.length}
                </span>
              </div>

              <div className="space-y-5">
                <h2 className="text-3xl font-semibold text-slate-900 tracking-tight leading-[0.95]">
                  {q?.text}
                </h2>
                <div className="flex items-center gap-2.5">
                  <div className="h-px bg-indigo-100 flex-1" />
                  <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest px-3 py-1 bg-indigo-50/50 rounded-full border border-indigo-100/50">Multi-Select Enabled</span>
                  <div className="h-px bg-indigo-100 flex-1" />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {(q?.options || []).map((opt, i) => (
                  <OptionCard
                    key={opt.optionId || opt._id || i}
                    option={opt}
                    index={i}
                    isSelected={selectedIds.includes(opt.optionId || opt._id || opt.label)}
                    onToggle={() => handleToggle(qId, opt.optionId || opt._id || opt.label)}
                  />
                ))}
              </div>

              {selectedIds.length > 0 && (
                <div className="flex items-center gap-3 p-4 bg-slate-900 text-white rounded-2xl animate-in fade-in slide-in-from-top-2">
                  <div className="w-6 h-6 rounded-lg bg-indigo-500 flex items-center justify-center text-[10px] font-black">
                    {selectedIds.length}
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-300">
                    {selectedIds.length} Bottleneck{selectedIds.length > 1 ? 's' : ''} mapped for analysis
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* REFINED FLOATING FOOTER */}
      <footer className="fixed bottom-0 left-0 right-0 p-8 z-40 bg-gradient-to-t from-[#f8fafc] via-[#f8fafc]/90 to-transparent pointer-events-none">
        <div className="max-w-2xl mx-auto flex gap-4 pointer-events-auto">
          {step > 0 && (
            <button
              onClick={goBack}
              className="px-10 py-4 bg-white border border-slate-200 text-slate-400 rounded-2xl text-[14px] font-semibold uppercase tracking-widest hover:text-slate-900 transition-all shadow-xl shadow-slate-200/20 active:scale-95"
            >
              Back
            </button>
          )}
          <button
            onClick={goNext}
            disabled={step === 0 ? !profile.type : submitting}
            className={`flex-1 flex items-center justify-center gap-3 px-12 py-4 rounded-2xl font-semibold text-[14px] uppercase tracking-[0.2em] transition-all shadow-2xl active:scale-95 ${(step === 0 && !profile.type)
              ? 'bg-slate-200 text-slate-400 opacity-50 cursor-not-allowed shadow-none'
              : 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/20'
              }`}
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-indigo-400 border-t-white rounded-full animate-spin" />
                Processing Matrix...
              </>
            ) : step === totalSteps - 1 ? (
              <>Finalise Diagnostic <span className="opacity-40">→</span></>
            ) : step === 0 ? (
              <>Start Analysis <span className="opacity-40">→</span></>
            ) : (
              <>Next Audit Point <span className="opacity-40">→</span></>
            )}
          </button>
        </div>
      </footer>
    </div>
  )
}
