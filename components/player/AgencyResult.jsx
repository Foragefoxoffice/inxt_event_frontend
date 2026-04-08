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
  const [activeTab, setActiveTab] = useState('assessment') // 'assessment' | 'actionPlan' | 'solutions'
  const [form, setForm] = useState({ name: '', org: '', email: '', phone: '' })
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const aiResult = result.aiResult || null
  
  // USES AI-CALCULATED SCORES IF AVAILABLE, FALLBACK TO RULE-ENGINE METRICS
  const metrics = aiResult?.aiCalculatedScores || result.metrics || {}
  const score = aiResult?.aiCalculatedScores 
    ? Math.round(Object.values(aiResult.aiCalculatedScores).reduce((a, b) => a + b, 0) / Object.keys(aiResult.aiCalculatedScores).length)
    : (result.score || 0)

  const getScoreLabel = (s) => {
    if (s >= 90) return { label: 'Strong Foundation', color: 'text-emerald-500', bar: 'bg-emerald-500' }
    if (s >= 70) return { label: 'Solid Potential', color: 'text-blue-500', bar: 'bg-blue-500' }
    if (s >= 50) return { label: 'Growth Required', color: 'text-amber-500', bar: 'bg-amber-500' }
    return { label: 'Critical Overhaul', color: 'text-red-500', bar: 'bg-red-500' }
  }

  const { label, color, bar } = getScoreLabel(score)

  // Group solutions by category for display
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
    <div className="min-h-screen bg-[#F0F9FF] text-[#003B6E] flex flex-col font-sans relative selection:bg-[#00ADEF]/20">
      
      {/* Submitting Overlay */}
      {submitting && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-md z-[100] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-[#00ADEF] border-t-transparent rounded-full animate-spin shadow-lg" />
            <p className="font-black text-[#003B6E] uppercase tracking-widest text-xs">Sending your report...</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white text-[#003B6E] px-8 py-5 flex justify-between items-center border-b-[6px] border-[#00ADEF] shadow-sm">
        <div>
          <p className="text-[10px] font-black tracking-[0.2em] text-[#00ADEF] uppercase">Personalised Diagnostic</p>
          <h1 className="text-2xl font-black uppercase tracking-tighter">Your Agency Health Assessment</h1>
        </div>
        <div className="bg-[#F0F9FF] text-[#00ADEF] px-4 py-2 rounded-lg text-xs font-black ring-1 ring-[#00ADEF]/20 uppercase tracking-widest">
          6-MONTH PROJECTION
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white border-b sticky top-0 z-10 px-8">
        {[
          { id: 'assessment', label: 'Assessment' },
          { id: 'actionPlan', label: 'Next 90 Days' },
          { id: 'solutions', label: 'What Good Looks Like' }
        ].map(t => (
          <button 
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-8 py-4 font-bold text-sm tracking-widest uppercase transition-all border-b-4 ${activeTab === t.id ? 'border-[#002147] text-[#002147]' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 max-w-5xl mx-auto w-full p-8 space-y-12 pb-24 overflow-auto">
        
        {activeTab === 'assessment' && (
          <div className="animate-fade-up">
            {/* Score Ring Section */}
            <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-12">
               <div className="relative w-48 h-48 shrink-0">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100" />
                    <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" 
                            strokeDasharray={552.9} 
                            strokeDashoffset={552.9 - (552.9 * score) / 100}
                            className={`${color} transition-all duration-1000 ease-out`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-6xl font-black">{score}</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Health</span>
                  </div>
               </div>
               <div className="flex-1 space-y-4">
                  <div className={`text-4xl font-black uppercase ${color}`}>{label}</div>
                  <p className="text-slate-500 leading-relaxed">Based on the pain points you identified, here is your agency's operational health map across the four dimensions of Takaful distribution.</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-8 border-t border-slate-100">
                     {Object.entries(CAT_LABELS).map(([key, label]) => (
                       <div key={key}>
                         <div className="text-2xl font-black">{metrics[key] || 0}</div>
                         <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{label}</div>
                       </div>
                     ))}
                  </div>
               </div>
            </div>

            {/* Area Bars */}
            <div className="mt-12 space-y-4">
              <h3 className="font-bold text-xs uppercase tracking-widest text-slate-400">Operational Lag Map</h3>
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-8">
                 {Object.entries(CAT_LABELS).map(([key, label]) => (
                   <div key={key} className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8">
                      <div className="w-48 text-sm font-bold">{label}</div>
                      <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                         <div className={`h-full transition-all duration-1000 ${metrics[key] >= 90 ? 'bg-emerald-500' : metrics[key] >= 70 ? 'bg-blue-500' : metrics[key] >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${metrics[key]}%` }} />
                      </div>
                   </div>
                 ))}
              </div>
            </div>

            {aiResult && (
              <div className="mt-12 bg-blue-50 p-8 rounded-3xl border border-blue-100 space-y-4">
                <p className="text-[10px] font-bold text-blue-900 uppercase tracking-widest">Diagnostic Summary</p>
                <p className="text-blue-800 text-lg leading-relaxed font-medium">"{aiResult.summary}"</p>
                <div className="h-px bg-blue-200 w-full my-4" />
                <p className="text-blue-900/70 text-sm leading-relaxed">{aiResult.diagnosis}</p>
              </div>
            )}
            
            <div className="flex justify-center pt-8">
               <button onClick={() => setActiveTab('actionPlan')} className="bg-[#002147] text-white px-12 py-5 rounded-xl font-bold hover:brightness-110 shadow-xl">SEE MY ACTION PLAN →</button>
            </div>
          </div>
        )}

        {activeTab === 'actionPlan' && (
          <div className="animate-fade-up space-y-12">
            <div>
              <p className="text-[10px] font-bold text-[#C4962A] uppercase tracking-widest mb-2">Personalised Action Plan</p>
              <h2 className="text-4xl font-black uppercase tracking-tight mb-2">Your next 90 days — where to focus first</h2>
              <p className="text-slate-500 leading-relaxed max-w-2xl">Based on your diagnostic, these are the highest-leverage improvements available to your agency. Prioritized by impact, not by complexity.</p>
            </div>
            <div className="grid gap-6">
               {(aiResult?.actions || []).map((action, i) => (
                 <div key={i} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-shadow">
                    <div className="absolute top-0 left-0 w-2 h-full bg-[#C4962A]" />
                    <div className="flex items-start gap-6">
                       <div className="w-10 h-10 bg-[#002147] text-white rounded-full flex items-center justify-center font-black shrink-0 text-xl">{i+1}</div>
                       <div className="space-y-4 flex-1">
                          <div className="flex items-center gap-4">
                            <h4 className="text-xl font-bold">{action.title}</h4>
                            <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase px-2 py-1 rounded">High Impact</span>
                          </div>
                          <p className="text-slate-600 leading-relaxed text-sm">{action.description}</p>
                          {action.timeframe && (
                            <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-3 py-1.5 rounded-full inline-block">{action.timeframe}</span>
                          )}
                       </div>
                    </div>
                 </div>
               ))}
            </div>
            <div className="flex justify-center pt-8">
               <button onClick={() => setActiveTab('solutions')} className="bg-[#00ADEF] text-white px-12 py-5 rounded-xl font-black hover:brightness-110 shadow-xl shadow-[#00ADEF]/20 uppercase tracking-widest">See How SalesVerse Helps →</button>
            </div>
          </div>
        )}

        {activeTab === 'solutions' && (
          <div className="animate-fade-up space-y-12">
            <div>
              <p className="text-[10px] font-bold text-[#2DD4BF] uppercase tracking-widest mb-2">What Good Looks Like</p>
              <h2 className="text-4xl font-black uppercase tracking-tight mb-2">How leading Takaful agencies have closed these gaps</h2>
              <p className="text-slate-500 leading-relaxed max-w-2xl">These are real patterns from agencies that have addressed the same challenges you identified. The goal isn't to show you a perfect agency — it's to show what is achievable, and what specifically changed to get there.</p>
            </div>

            <div className="bg-white p-1 pb-1 rounded-3xl overflow-hidden shadow-2xl border border-[#00ADEF]/10">
               <div className="p-8">
                  <p className="text-[10px] font-black text-[#00ADEF] uppercase tracking-widest mb-1">SalesVerse</p>
                  <h3 className="text-2xl font-black text-[#003B6E] uppercase tracking-tighter mb-8">What addressing your specific gaps looks like in practice</h3>
                  
                  <div className="space-y-12">
                     {Object.entries(groupedSolutions).map(([cat, sols]) => (
                       <div key={cat} className="space-y-4">
                          <div className="text-[10px] font-black text-[#00ADEF] uppercase tracking-[0.2em] border-b border-[#F0F9FF] pb-2">{cat} — {sols.length} GAPS IDENTIFIED</div>
                          <div className="space-y-3">
                             {sols.map((s, i) => (
                               <div key={i} className="flex gap-4 p-6 rounded-2xl bg-[#F8FBFF] border border-[#00ADEF]/5 group hover:bg-[#F0F9FF] transition-all">
                                  <div className="flex-1 space-y-1">
                                     <p className="text-[9px] font-black text-[#003B6E]/30 uppercase tracking-widest">Current State</p>
                                     <p className="text-[#003B6E]/70 text-sm leading-relaxed">{s.currentState}</p>
                                  </div>
                                  <div className="flex items-center text-[#00ADEF] shrink-0 text-2xl opacity-40 group-hover:opacity-100 transition-opacity">→</div>
                                  <div className="flex-1 space-y-1">
                                     <p className="text-[9px] font-black text-[#7BC242] uppercase tracking-widest">What Changes</p>
                                     <p className="text-[#003B6E] font-bold text-sm leading-relaxed">{s.whatChanges}</p>
                                  </div>
                               </div>
                             ))}
                          </div>
                       </div>
                     ))}
                  </div>
               </div>

               {/* Lead Form Section */}
               <div className="bg-white m-0.5 rounded-b-[22px] p-10 space-y-10">
                  <div className="space-y-6">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">What SalesVerse Addresses — From Your Diagnostic</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                       {(aiResult?.solutions || []).slice(0, 6).map((s, i) => (
                         <div key={i} className="flex items-center gap-3 p-4 bg-[#F8FAFB] rounded-xl border border-slate-100">
                           <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-black">✓</div>
                           <p className="text-sm">Addressed in <span className="font-bold text-[#002147]">{s.module}</span> module</p>
                         </div>
                       ))}
                    </div>
                    {(aiResult?.solutions || []).length > 6 && (
                      <p className="text-center text-[10px] font-bold text-slate-300 uppercase tracking-widest">+ {(aiResult?.solutions || []).length - 6} more gaps addressed</p>
                    )}
                  </div>

                  <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                     <p className="text-blue-900 border-l-2 border-l-[#002147] pl-4 text-xs leading-relaxed">
                        <span className="font-bold">SalesVerse</span> is the AI-powered distribution platform built specifically for Takaful operators, agency managers, and agents. It addresses the operational gaps identified in this diagnostic — not with complexity, but with intelligence that plugs into how you already work. Implementation typically takes 30 days.
                     </p>
                  </div>

                  {!submitted ? (
                    <div className="space-y-8">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                             <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Name</label>
                             <input className="w-full p-4 border rounded-xl outline-none focus:border-blue-600" placeholder="Your name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Organisation</label>
                             <input className="w-full p-4 border rounded-xl outline-none focus:border-blue-600" placeholder="Company / Agency" value={form.org} onChange={e => setForm({...form, org: e.target.value})} />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email</label>
                             <input className="w-full p-4 border rounded-xl outline-none focus:border-blue-600" placeholder="Email for follow-up" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Phone (optional)</label>
                             <input className="w-full p-4 border rounded-xl outline-none focus:border-blue-600" placeholder="For a quick call" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                          </div>
                       </div>
                       <div className="text-center">
                          <p className="text-[10px] text-slate-400 italic mb-6">Leave your details to receive your full diagnostic report and a tailored session with our team. No commitment — just a conversation.</p>
                          <div className="flex flex-col md:flex-row gap-4 justify-center">
                             <button onClick={() => setActiveTab('actionPlan')} className="px-10 py-5 border rounded-xl font-bold hover:bg-slate-50 transition-colors uppercase text-sm tracking-widest">Back</button>
                             <button onClick={handleSubmitReport} className="bg-[#00ADEF] text-white px-16 py-5 rounded-xl font-black hover:brightness-110 shadow-2xl shadow-[#00ADEF]/20 transition-all uppercase tracking-[0.2em]">Send Me My Report</button>
                             <button onClick={() => router.push('/play')} className="px-10 py-5 border rounded-xl font-bold hover:bg-slate-50 transition-colors uppercase text-sm tracking-widest">Start Again</button>
                          </div>
                       </div>
                    </div>
                  ) : (
                    <div className="bg-emerald-50 p-10 rounded-3xl border border-emerald-100 text-center animate-fade-up">
                       <div className="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center text-3xl mx-auto mb-6">✓</div>
                       <h4 className="text-2xl font-black text-emerald-900 uppercase">Report Sent!</h4>
                       <p className="text-emerald-800/70 mt-2">Your personalised diagnostic report has been sent to your email. Our team will reach out shortly.</p>
                    </div>
                  )}
               </div>
            </div>
          </div>
        )}

      </div>

      <style jsx>{`
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-up {
          animation: fade-up 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  )
}
