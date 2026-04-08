'use client'

import { useState, useEffect, useRef } from 'react'

const PERSONAS = [
  { id: 'cxo', icon: 'C', title: 'C-Suite / MD / CEO', desc: 'Senior leadership. Strategy and vision.' },
  { id: 'bdo', icon: 'B', title: 'Agency Mgr / BDM', desc: 'Distribution focus. Performance and productivity.' },
  { id: 'operator', icon: 'O', title: 'Takaful Operator', desc: 'Product, digital transformation roles.' },
  { id: 'agent', icon: 'A', title: 'Senior Agent', desc: 'Frontline practitioner. Day-to-day challenges.' },
  { id: 'association', icon: 'As', title: 'Association', desc: 'Industry-wide perspective. Policy.' },
  { id: 'insuretech', icon: 'IT', title: 'InsureTech', desc: 'Technology innovators. Future-focused.' }
]

export function InterviewerHub({ questions, onSubmit, submitting, eventId }) {
  const [step, setStep] = useState('hub') // hub | setup | start | select | interview | wrap | final
  const [guest, setGuest] = useState({ name: '', title: '', org: '', persona: '', li: '', email: '' })
  const [selectedQIds, setSelectedQIds] = useState([])
  const [currentQIdx, setCurrentQIdx] = useState(0)
  const [timer, setTimer] = useState(180) // 3 mins
  const [timerActive, setTimerActive] = useState(false)
  const [sessions, setSessions] = useState([]) // Track interviews done in this session
  const [answers, setAnswers] = useState({}) // Keyed by questionId: { notes: string }
  const [copied, setCopied] = useState(false)
  const timerRef = useRef(null)

  // Timer logic
  useEffect(() => {
    if (timerActive && timer > 0) {
      timerRef.current = setInterval(() => setTimer(t => t - 1), 1000)
    } else {
      clearInterval(timerRef.current)
    }
    return () => clearInterval(timerRef.current)
  }, [timerActive, timer])

  const recQuestions = questions.filter(q => q.personas && q.personas.includes(guest.persona))
  const otherQuestions = questions.filter(q => !q.personas || !q.personas.includes(guest.persona))
  const selectedQuestions = questions.filter(q => selectedQIds.includes(q.questionId))

  const handleComplete = () => {
    const payload = selectedQuestions.map((q, idx) => ({
      questionId: q.questionId,
      answer: answers[q.questionId] || '',
      timestamp: new Date().toISOString()
    }))
    onSubmit(payload)
    // Local log tracking
    setSessions(prev => [{ name: guest.name, org: guest.org, time: new Date().toLocaleTimeString() }, ...prev])
  }

  const handleCopyPost = () => {
    const post = `Just finished my interview for the 'Voices of Takaful AI' series at iorta TechNXT 2026. 🚀\n\nGreat insight sharing with the @iorta team!\n\n#VoicesOfTakafulAI #iortaTechNXT #SalesVerse #MTAxTIC`
    navigator.clipboard.writeText(post)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  return (
    <div className="min-h-screen bg-[#F0F9FF] text-[#003B6E] font-sans selection:bg-[#00ADEF]/20">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&display=swap');
        .hub-gradient { background: linear-gradient(135deg, #FFFFFF 0%, #F0F9FF 100%); }
        .coral-border { border-color: rgba(0,173,239,0.15); }
        .coral-bg { background: #00ADEF; }
        .coral-text { color: #00ADEF; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .4; } }
        .animate-blink { animation: pulse 1.2s infinite; }
      `}</style>
      
      {/* Top Static Bar */}
      <div className="fixed top-0 left-0 right-0 h-[5px] bg-[#00ADEF] z-50" />
      <div className="fixed bottom-0 left-0 right-0 h-[5px] bg-[#7BC242] z-50" />

      {/* Header */}
      <div className="sticky top-[5px] z-40 bg-white border-b coral-border px-6 py-4 flex items-center justify-between shadow-sm">
        <div>
          <div className="text-[10px] font-black tracking-widest coral-text uppercase">iorta TechNXT · SalesVerse</div>
          <div className="text-sm font-black uppercase">Interviewer Hub</div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white/5 py-1.5 px-3 rounded-full">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-blink" />
            <span className="text-[10px] font-black tracking-widest">READY</span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10 pb-20">
        
        {/* STEP: HUB */}
        {step === 'hub' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <div className="text-[10px] font-black tracking-[0.2em] text-[#003B6E]/40 uppercase mb-1">Myth Buster</div>
              <h1 className="text-4xl font-black mb-2 uppercase text-[#003B6E]">Voices of Takaful AI</h1>
              <p className="text-[#003B6E]/60 text-sm leading-relaxed">Interview industry leaders. Capture their honest opinions. Build the content series for iorta TechNXT 2026.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setStep('start')}
                className="col-span-2 bg-[#00ADEF] hover:bg-[#0096D1] text-white p-8 rounded-2xl border-2 border-[#00ADEF]/10 transition group text-center shadow-lg shadow-[#00ADEF]/20"
              >
                <div className="text-3xl mb-2 group-hover:scale-110 transition">+</div>
                <div className="text-lg font-black uppercase">Start New Interview</div>
                <div className="text-xs text-white/40 mt-1 uppercase tracking-widest">Begin capture now</div>
              </button>
              
              <button 
                onClick={() => setStep('setup')}
                className="bg-white hover:bg-[#F8FBFF] p-6 rounded-2xl border border-[#00ADEF]/10 transition text-center shadow-sm"
              >
                <div className="text-2xl mb-1 font-black text-[#00ADEF]">P</div>
                <div className="text-[10px] font-black uppercase text-[#003B6E]/40 tracking-widest">Setup Checklist</div>
              </button>

              <button 
                onClick={() => setStep('log')}
                className="bg-white hover:bg-[#F8FBFF] p-6 rounded-2xl border border-[#00ADEF]/10 transition text-center shadow-sm"
              >
                <div className="text-2xl mb-1 font-black text-[#7BC242]">L</div>
                <div className="text-[10px] font-black uppercase text-[#003B6E]/40 tracking-widest">Interview Log</div>
              </button>
            </div>

            <div className="bg-[#00ADEF]/5 border-l-4 border-[#00ADEF] p-6 rounded-r-xl">
              <div className="text-[10px] font-black text-[#00ADEF] tracking-widest uppercase mb-3">Invite Script</div>
              <p className="italic text-[#003B6E]/80 leading-relaxed text-sm">"We're capturing 60-second real opinions from leaders today — would you share yours? It'll be on LinkedIn as part of our series. Takes 3 minutes."</p>
            </div>
          </div>
        )}

        {/* STEP: SETUP CHECKLIST */}
        {step === 'setup' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 text-center">
            <div className="mx-auto w-12 h-12 bg-cyan-500/20 text-cyan-400 rounded-full flex items-center justify-center font-black mb-4 border border-cyan-500/30">P</div>
            <div>
              <h1 className="text-2xl font-black uppercase">Professional Setup</h1>
              <p className="text-white/40 text-sm">Follow these 5 points for premium content.</p>
            </div>

            <div className="text-left space-y-4">
              {[
                { n: "01", t: "Guest Comfort", d: "Ensure guest is comfortably seated and at eye-level with the camera." },
                { n: "02", t: "Audio Check", d: "Test the lapel or handheld mic. Listen for interference / clothing rustle." },
                { n: "03", t: "Lighting Check", d: "Guest must face the primary light source. Avoid strong shadows on eyes." },
                { n: "04", t: "Silence Protocol", d: "Interviewer and Guest phones on Silent/Airplane mode. Notify nearby staff." },
                { n: "05", t: "Orientation", d: "Rehearse the intro ('We're here with...') and the closing sign-off." }
              ].map(item => (
                <div key={item.n} className="bg-white/5 p-5 rounded-2xl border border-white/5 flex gap-4">
                  <div className="text-xs font-black coral-text mt-1">{item.n}</div>
                  <div>
                    <div className="text-sm font-black uppercase mb-1">{item.t}</div>
                    <div className="text-xs text-white/40 leading-relaxed">{item.d}</div>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={() => setStep('hub')} className="w-full py-4 bg-white/10 rounded-xl font-black uppercase tracking-widest text-xs">Return to Hub</button>
          </div>
        )}

        {/* STEP: INTERVIEW LOG */}
        {step === 'log' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 text-center">
            <div className="mx-auto w-12 h-12 bg-orange-500/20 text-orange-400 rounded-full flex items-center justify-center font-black mb-4 border border-orange-500/30">L</div>
            <div>
              <h1 className="text-2xl font-black uppercase">Interview Log</h1>
              <p className="text-white/40 text-sm">Submission history for this device.</p>
            </div>

            {sessions.length === 0 ? (
              <div className="py-20 bg-white/5 rounded-3xl border border-dashed border-white/10 text-white/30 text-xs italic uppercase tracking-[0.2em]">
                No Interviews Logged Yet Today
              </div>
            ) : (
              <div className="space-y-3">
                {sessions.map((s, idx) => (
                  <div key={idx} className="bg-white/5 p-4 rounded-xl border border-white/5 flex justify-between items-center text-left">
                    <div>
                      <div className="text-sm font-black uppercase">{s.name}</div>
                      <div className="text-[10px] text-white/40 uppercase tracking-widest">{s.org}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-black coral-text">{s.time}</div>
                      <div className="text-[9px] text-green-400 font-black tracking-widest mt-1">SYNCED ✓</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button onClick={() => setStep('hub')} className="w-full py-4 bg-white/10 rounded-xl font-black uppercase tracking-widest text-xs">Return to Hub</button>
          </div>
        )}

        {/* STEP: START (Guest Details) */}
        {step === 'start' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div>
              <h1 className="text-2xl font-black uppercase">Guest Details</h1>
              <p className="text-white/40 text-sm">Who are you interviewing?</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black tracking-widest text-[#64748B]">Full Name *</label>
                <input 
                  className="w-full bg-white border border-slate-200 rounded-xl px-5 py-4 focus:border-[#00ADEF] outline-none transition text-[#003B6E] font-bold"
                  value={guest.name} onChange={e => setGuest({...guest, name: e.target.value})}
                  placeholder="e.g. Azlan Harun"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black tracking-widest text-[#64748B]">Title</label>
                  <input className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-[#003B6E] font-bold outline-none focus:border-[#00ADEF]" value={guest.title} onChange={e => setGuest({...guest, title: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black tracking-widest text-[#64748B]">Org</label>
                  <input className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-[#003B6E] font-bold outline-none focus:border-[#00ADEF]" value={guest.org} onChange={e => setGuest({...guest, org: e.target.value})} />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] uppercase font-black tracking-widest text-[#64748B]">Select Role Category</label>
                <div className="grid grid-cols-2 gap-3">
                  {PERSONAS.map(p => (
                    <button 
                      key={p.id}
                      onClick={() => setGuest({...guest, persona: p.id})}
                      className={`p-4 rounded-xl border text-left transition ${guest.persona === p.id ? 'bg-[#F0F9FF] border-[#00ADEF]' : 'bg-white border-slate-100 hover:bg-[#F8FBFF]'}`}
                    >
                      <div className={`text-xs font-black uppercase mb-1 ${guest.persona === p.id ? 'text-[#00ADEF]' : 'text-[#003B6E]'}`}>{p.title}</div>
                      <div className="text-[10px] text-[#64748B] leading-tight">{p.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-6 flex gap-3">
                <button onClick={() => setStep('hub')} className="px-8 py-4 bg-white/5 hover:bg-white/10 rounded-xl font-bold">BACK</button>
                <button 
                  onClick={() => setStep('select')}
                  disabled={!guest.name || !guest.persona}
                  className="flex-1 bg-[#00ADEF] hover:bg-[#0096D1] text-white disabled:opacity-30 py-4 rounded-xl font-black uppercase tracking-widest shadow-lg shadow-[#00ADEF]/20"
                >
                  Select Questions →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP: SELECT QUESTIONS */}
        {step === 'select' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
             <div>
              <div className="text-[10px] font-black coral-text tracking-widest uppercase mb-1">Selected Category: {PERSONAS.find(p => p.id === guest.persona)?.title}</div>
              <h1 className="text-2xl font-black uppercase">Curate Questions</h1>
              <p className="text-white/40 text-sm">Choose 3–5 industry-challenging points.</p>
            </div>
            
            <div className="space-y-10">
              <div className="space-y-4">
                <div className="text-[10px] font-black coral-text tracking-widest uppercase bg-white/5 px-3 py-1.5 rounded inline-block">Recommended for this Category</div>
                <div className="space-y-3">
                  {recQuestions.map((q, i) => {
                    const isSelected = selectedQIds.includes(q.questionId)
                    return (
                      <button 
                        key={q.questionId}
                        onClick={() => {
                          setSelectedQIds(prev => isSelected ? prev.filter(id => id !== q.questionId) : [...prev, q.questionId])
                        }}
                        className={`w-full p-5 rounded-2xl border text-left transition relative flex gap-4 ${isSelected ? 'bg-[#00ADEF]/10 border-[#00ADEF]' : 'bg-white border-[#003B6E]/10 hover:bg-[#F8FBFF]'}`}
                      >
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${isSelected ? 'bg-[#00ADEF] text-white' : 'bg-[#003B6E]/5 text-[#003B6E]'}`}>
                          {isSelected ? '✓' : i + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded ${q.interviewType === 'tf' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-orange-500/20 text-orange-400'}`}>
                              {q.interviewType === 'tf' ? 'TRUE / FALSE' : 'OPEN OPINION'}
                            </span>
                            <span className="text-[10px] bg-[#C8922A]/20 text-[#C8922A] font-black px-2 py-0.5 rounded uppercase">REC</span>
                          </div>
                          <div className="text-[15px] font-bold leading-snug">{q?.text}</div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-4">
                <div className="text-[10px] font-black text-white/30 tracking-widest uppercase bg-white/5 px-3 py-1.5 rounded inline-block">Other Industry Viewpoints</div>
                <div className="space-y-3">
                  {otherQuestions.map((q, i) => {
                    const isSelected = selectedQIds.includes(q.questionId)
                    return (
                      <button 
                        key={q.questionId}
                        onClick={() => {
                          setSelectedQIds(prev => isSelected ? prev.filter(id => id !== q.questionId) : [...prev, q.questionId])
                        }}
                        className={`w-full p-5 rounded-2xl border text-left transition relative flex gap-4 ${isSelected ? 'bg-[#00ADEF]/10 border-[#00ADEF]' : 'bg-white border-[#003B6E]/10 hover:bg-[#F8FBFF]'}`}
                      >
                         <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${isSelected ? 'bg-[#00ADEF] text-white' : 'bg-[#003B6E]/5 text-[#003B6E]'}`}>
                          {isSelected ? '✓' : i + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded ${q.interviewType === 'tf' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-orange-500/20 text-orange-400'}`}>
                              {q.interviewType === 'tf' ? 'TRUE/FALSE' : 'OPEN OPINION'}
                            </span>
                          </div>
                          <div className="text-[15px] font-bold leading-snug">{q?.text}</div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="pt-6 flex gap-3 sticky bottom-4">
              <button onClick={() => setStep('start')} className="px-8 py-4 bg-white border border-slate-200 hover:bg-[#F8FBFF] rounded-xl font-bold shadow-md">BACK</button>
              <button 
                onClick={() => { setStep('interview'); setTimerActive(true); }}
                disabled={selectedQIds.length === 0}
                className="flex-1 bg-linear-to-r from-[#00ADEF] to-[#003B6E] hover:scale-[1.02] active:scale-[0.98] text-white disabled:opacity-50 py-4 rounded-xl font-black uppercase tracking-widest shadow-xl shadow-[#00ADEF]/20 transition-all"
              >
                Start Recording ({selectedQIds.length}) →
              </button>
            </div>
          </div>
        )}

        {/* STEP: INTERVIEW MODE */}
        {step === 'interview' && (
          <div className="space-y-8 animate-in fade-in zoom-in duration-500">
            
            <div className="flex items-center justify-between bg-white p-6 rounded-2xl border-2 border-[#00ADEF]/10 shadow-sm">
              <div className="text-center">
                <div className="text-[10px] font-black text-[#64748B] uppercase tracking-widest mb-1">Session Timer</div>
                <div className={`text-4xl font-black tabular-nums ${timer < 30 ? 'text-red-500 animate-blink' : 'text-[#00ADEF]'}`}>
                  {formatTime(timer)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-black text-[#64748B] uppercase tracking-widest mb-1">Guest</div>
                <div className="text-lg font-black uppercase text-[#003B6E]">{guest.name}</div>
                <div className="text-[10px] text-[#00ADEF] font-bold uppercase tracking-widest">{guest.org}</div>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
               <div className="bg-[#003B6E] px-6 py-4 flex justify-between items-center text-white">
                 <span className="text-[10px] font-black uppercase tracking-widest">Live Question Guide</span>
                 <span className="text-[10px] font-bold opacity-80">Q {currentQIdx + 1} of {selectedQuestions.length}</span>
               </div>
               
               <div className="p-10 space-y-8 text-center min-h-[380px] flex flex-col justify-center">
                  <div className="text-[10px] font-black text-[#00ADEF] tracking-[0.2em] uppercase">Interviewer Ask:</div>
                  <h2 className="text-3xl font-black leading-tight text-[#003B6E]">"{selectedQuestions[currentQIdx]?.text}"</h2>
                  
                  {selectedQuestions[currentQIdx]?.hostProposal && (
                    <div className="bg-[#F8FBFF] border border-[#00ADEF]/10 rounded-xl px-6 py-5 max-w-md mx-auto">
                      <div className="text-[10px] font-black text-[#003B6E]/40 uppercase mb-2">Host Script (Read Aloud)</div>
                      <div className="text-[15px] font-bold italic text-[#003B6E]">"{selectedQuestions[currentQIdx].hostProposal}"</div>
                    </div>
                  )}

                  {selectedQuestions[currentQIdx]?.interviewerTip && (
                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-[13px] text-emerald-700 font-medium italic max-w-sm mx-auto">
                      Expert Guidance: {selectedQuestions[currentQIdx].interviewerTip}
                    </div>
                  )}
               </div>

               <div className="px-10 pb-10 space-y-5">
                 <textarea 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-5 text-sm outline-none focus:border-[#00ADEF] focus:bg-white transition h-24 font-medium text-[#003B6E]"
                  placeholder="Notes on the answer (for content team)..."
                  value={answers[selectedQuestions[currentQIdx]?.questionId] || ''} 
                  onChange={e => setAnswers({...answers, [selectedQuestions[currentQIdx]?.questionId]: e.target.value})}
                 />
                 <div className="flex gap-4">
                    <button 
                      onClick={() => setCurrentQIdx(i => Math.max(0, i - 1))}
                      disabled={currentQIdx === 0}
                      className="px-6 py-4 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl disabled:opacity-20 transition-colors"
                    >←</button>
                    <button 
                      onClick={() => {
                        if (currentQIdx < selectedQuestions.length - 1) setCurrentQIdx(i => i + 1)
                        else setStep('wrap')
                      }}
                      className="flex-1 bg-linear-to-r from-[#00ADEF] to-[#003B6E] text-white py-4 rounded-xl font-black uppercase tracking-widest shadow-lg shadow-[#00ADEF]/20 hover:scale-[1.01] active:scale-[0.99] transition-all"
                    >
                      {currentQIdx === selectedQuestions.length - 1 ? 'Wrap Up Session →' : 'Next Question →'}
                    </button>
                 </div>
               </div>
            </div>

            <div className="bg-white/5 border-l-4 border-[#00ADEF]/50 p-6 rounded-r-xl">
              <div className="text-[10px] font-black text-[#00ADEF] tracking-widest uppercase mb-1">Follow-up Tip</div>
              <p className="text-xs text-white/60">"Say more — why do you think that?" Or: "Give me an example from your own experience."</p>
            </div>
          </div>
        )}

        {/* STEP: WRAP UP */}
        {step === 'wrap' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center">
              <div className="w-20 h-20 bg-[#7BC242]/20 text-[#7BC242] rounded-full flex items-center justify-center mx-auto mb-6 text-3xl border border-[#7BC242]/30">✓</div>
              <h1 className="text-3xl font-black uppercase">Interview Complete</h1>
              <p className="text-white/40 mt-2">Closing steps with the guest.</p>
            </div>

            <div className="bg-white/5 border coral-border rounded-2xl p-6 space-y-6">
               <div className="space-y-4">
                  <div className="text-[10px] font-black coral-text tracking-widest uppercase">Post-Interview Action</div>
                  <div className="space-y-3">
                    <div className="flex gap-4 items-start bg-white/5 p-4 rounded-xl">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#00ADEF] mt-1.5" />
                      <div className="text-sm text-white/70">"You are now officially part of Voices of Takaful AI. We'll tag you when it goes live."</div>
                    </div>
                    <div className="flex gap-4 items-start bg-white/5 p-4 rounded-xl">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#00ADEF] mt-1.5" />
                      <div className="text-sm text-white/70">Collect business card / LinkedIn for tagging.</div>
                    </div>
                  </div>
               </div>

               <div className="space-y-4 pt-4 border-t border-white/5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[10px] uppercase font-black tracking-widest text-white/30">LinkedIn URL</label>
                       <input className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs" value={guest.li} onChange={e => setGuest({...guest, li: e.target.value})} placeholder="In/name" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] uppercase font-black tracking-widest text-white/30">Contact Email</label>
                       <input className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs" value={guest.email} onChange={e => setGuest({...guest, email: e.target.value})} />
                    </div>
                  </div>
               </div>
            </div>

            <button 
              onClick={() => { setStep('final'); handleComplete(); }}
              className="w-full bg-[#003B6E] hover:bg-[#004a99] py-5 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl"
            >
              Finish & Reveal Card →
            </button>
          </div>
        )}

        {/* STEP: FINAL (Featured Card) */}
        {step === 'final' && (
          <div className="space-y-10 animate-in fade-in duration-1000 text-center">
            <div className="text-[10px] font-black coral-text tracking-[0.3em] uppercase">Success</div>
            
            <div className="bg-[#003B6E] rounded-[40px] p-12 py-16 relative overflow-hidden group shadow-2xl">
               <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-white/10 transition duration-1000" />
               <div className="relative z-10 space-y-8">
                  <div className="text-[10px] font-black text-white/50 tracking-widest uppercase">iorta TechNXT · MTA × TIC 2026</div>
                  <div className="space-y-2">
                    <div className="text-5xl font-black">MYTH BUSTER</div>
                    <div className="text-lg opacity-80 font-bold uppercase tracking-widest">Voices of Takaful AI</div>
                  </div>
                  
                  <div className="w-24 h-24 bg-white/10 border-4 border-white/20 rounded-full flex items-center justify-center mx-auto text-4xl font-black">
                     {guest.name.charAt(0)}
                  </div>

                  <div className="space-y-1">
                    <div className="text-3xl font-black uppercase">{guest.name}</div>
                    <div className="text-sm opacity-60 uppercase font-bold tracking-widest">{guest.title} · {guest.org}</div>
                  </div>

                  <div className="text-[10px] opacity-40 font-black tracking-widest uppercase py-4 border-t border-white/10 mt-8">
                    #VoicesOfTakafulAI #iortaTechNXT #SalesVerse #MTAxTIC
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start max-w-2xl mx-auto">
              <div className="space-y-4 text-left">
                <div className="text-[10px] font-black coral-text tracking-widest uppercase mb-1">Guest Share Option A: Manual</div>
                <p className="text-xs text-white/40 leading-relaxed">Copy the pre-written post text to share from any app on your device.</p>
                <button 
                  onClick={handleCopyPost}
                  className={`flex items-center gap-3 w-full px-6 py-4 rounded-2xl border transition ${copied ? 'bg-green-500/20 border-green-500/50 text-green-400' : 'bg-white/5 border-white/10 hover:bg-white/15 text-white/70'}`}
                >
                  <span className="text-[10px] font-black uppercase tracking-widest">{copied ? 'COPIED TO CLIPBOARD ✓' : 'COPY SOCIAL POST FOR GUEST'}</span>
                </button>
              </div>

              <div className="space-y-4 text-left">
                <div className="text-[10px] font-black coral-text tracking-widest uppercase mb-1">Guest Share Option B: Mobile Scan</div>
                <div className="bg-white p-4 rounded-3xl inline-block shadow-2xl relative group">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(`https://twitter.com/intent/tweet?text=Just finished my interview for 'Voices of Takaful AI' at iorta TechNXT 2026. 🚀 @iorta #VoicesOfTakafulAI #iortaTechNXT`)}&size=160x160&color=0D0505`}
                    alt="Scan to Share"
                    className="w-[140px] h-[140px]"
                  />
                  <div className="absolute inset-0 bg-black/60 rounded-[40px] opacity-0 group-hover:opacity-100 transition flex items-center justify-center p-4">
                     <span className="text-[9px] font-black text-white text-center leading-tight uppercase tracking-widest">Scan to post instantly from mobile</span>
                  </div>
                </div>
                <p className="text-[10px] text-white/30 italic">Scan with your phone camera to share on X / Social Media.</p>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
               <button onClick={() => setStep('hub')} className="px-10 py-4 bg-white/5 hover:bg-white/10 rounded-2xl font-bold uppercase text-xs tracking-widest border border-white/5">Hub</button>
               <button onClick={() => { setStep('start'); setGuest({ name: '', title: '', org: '', persona: '', li: '', email: '' }); setSelectedQIds([]); setCurrentQIdx(0); setTimer(180); setAnswers({}); }} className="px-10 py-4 bg-[#C8922A] text-black rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg">New Interview</button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
