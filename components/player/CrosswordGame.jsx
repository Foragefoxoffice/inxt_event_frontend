'use client'

import React, { useState, useEffect, useRef } from 'react'
import CrosswordGrid from './CrosswordGrid'

export function CrosswordGame({ questions, onSubmit, submitting, eventId }) {
  const [answers, setAnswers] = useState([])
  const [wordsSolved, setWordsSolved] = useState(0)
  const [checkRequested, setCheckRequested] = useState(false)
  const [hintToken, setHintToken] = useState(0)
  const [hintsLeft, setHintsLeft] = useState(3)
  const [clearToken, setClearToken] = useState(0)
  const [highlightedQId, setHighlightedQId] = useState(null)
  const [focusQuestionId, setFocusQuestionId] = useState(null)
  const [timeRemaining, setTimeRemaining] = useState(1800)
  
  const timerRef = useRef()

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const across = questions.filter(q => q.gridDir === 'across').sort((a, b) => a.gridNum - b.gridNum)
  const down = questions.filter(q => q.gridDir === 'down').sort((a, b) => a.gridNum - b.gridNum)

  const handleGridUpdate = (updatedAnswers) => {
    setAnswers(updatedAnswers)
    setCheckRequested(false)
    
    // Recalculate solved words
    let count = 0
    updatedAnswers.forEach(u => {
      const q = questions.find(q => q.questionId === u.questionId)
      if (q && u.inputText.toUpperCase() === q.answer.toUpperCase()) {
        count++
      }
    })
    setWordsSolved(count)
  }

  const handleCheckAnswers = () => {
    setCheckRequested(true)
    setTimeout(() => setCheckRequested(false), 3000)
  }

  const handleHint = () => {
    if (hintsLeft > 0) {
      setHintToken(prev => prev + 1)
      setHintsLeft(prev => prev - 1)
    }
  }

  const handleClearAll = () => {
    if (window.confirm('Clear all entries?')) {
      setClearToken(prev => prev + 1)
    }
  }

  const handleSubmit = () => {
    onSubmit(answers)
  }

  return (
    <div className="min-h-screen bg-[#F0F9FF] flex flex-col font-sans text-[#003B6E] selection:bg-[#00ADEF]/20">
      
      {/* Top Banner - Global styles from images */}
      <div className="bg-white text-[#003B6E] px-6 py-4 flex justify-between items-center border-b-2 border-[#00ADEF]/10 shadow-sm sticky top-0 z-50">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold tracking-[0.3em] text-[#00ADEF] mb-1">
            iorta TechNXT · SalesVerse · MTA x TIC 2026
          </span>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight font-quiz-display leading-none">
            TAKAFUL AI CROSSWORD CHALLENGE
          </h1>
        </div>
        <div className="flex items-center gap-6">
          <button className="bg-[#00ADEF] hover:bg-[#0096D1] text-white px-6 py-2.5 rounded-full font-black text-sm tracking-wider shadow-lg shadow-[#00ADEF]/20 transition-all active:scale-95 cursor-default hidden md:block">
            WIN EXECUTIVE BAG
          </button>
        </div>
      </div>

      {/* Timer & Status Bar */}
      <div className="bg-[#F8FBFF] text-[#003B6E]/60 px-6 py-3 flex justify-between items-center border-b border-[#00ADEF]/5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-widest">Next draw in:</span>
        </div>
        <div className="text-3xl font-black text-[#00ADEF] font-quiz-display">
          {formatTime(timeRemaining)}
        </div>
        <div className="flex items-center gap-2">
           <span className="text-xs font-bold text-white/60 uppercase tracking-widest">Next draw: 10:00</span>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex flex-col lg:flex-row gap-8 px-6 py-8 max-w-[1400px] mx-auto w-full">
        
        {/* Left: The Grid Area */}
        <div className="flex-1 flex flex-col items-center">
          
          {/* Progress Section */}
          <div className="w-full max-w-[600px] mb-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-end mb-3">
              <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Words Solved</span>
              <span className="text-2xl font-black text-[#002147]">{wordsSolved} / {questions.length}</span>
            </div>
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
               <div 
                 className="h-full bg-linear-to-r from-[#002147] to-[#004a99] transition-all duration-700 ease-out" 
                 style={{ width: `${(wordsSolved / questions.length) * 100}%` }}
               />
            </div>
          </div>

          <div className="relative group">
            {/* Quick Navigation / Jump Buttons */}
            <div className="flex flex-wrap justify-center gap-2 mb-6">
               {questions.sort((a,b)=>a.order - b.order).map(q => (
                 <button 
                  key={q.questionId}
                  onClick={() => setFocusQuestionId(q.questionId)}
                  className="w-10 h-8 rounded-full bg-white border border-slate-200 text-[10px] font-bold text-slate-600 hover:bg-[#002147] hover:text-white transition-colors shadow-sm"
                 >
                   {q.gridNum}{q.gridDir === 'across' ? 'A' : 'D'}
                 </button>
               ))}
            </div>

            <div className="bg-white p-10 rounded-[40px] shadow-xl border-4 border-[#00ADEF]/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#00ADEF]/5 rounded-full blur-[80px] -mr-32 -mt-32" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#003B6E]/5 rounded-full blur-[80px] -ml-32 -mb-32" />
                
                <CrosswordGrid 
                  questions={questions} 
                  onUpdate={handleGridUpdate}
                  checkRequested={checkRequested}
                  hintRequested={hintToken}
                  clearRequested={clearToken}
                  onFocusQuestion={(qId) => setHighlightedQId(qId)}
                  focusQuestionId={focusQuestionId}
                />
            </div>

            {/* Grid Controls */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <button 
                onClick={handleCheckAnswers}
                className="bg-[#003B6E] text-white px-8 py-4 rounded-xl font-black text-sm tracking-widest hover:bg-[#002147] transition-all shadow-lg active:scale-95"
              >
                CHECK ANSWERS
              </button>
              <button 
                onClick={handleHint}
                disabled={hintsLeft === 0}
                className="bg-white text-[#00ADEF] border-2 border-[#00ADEF]/20 px-8 py-4 rounded-xl font-black text-sm tracking-widest hover:border-[#00ADEF] transition-all shadow-md active:scale-95 disabled:opacity-50"
              >
                HINT ({hintsLeft} left)
              </button>
              <button 
                onClick={handleClearAll}
                className="bg-slate-100 text-slate-500 px-8 py-4 rounded-xl font-black text-sm tracking-widest hover:bg-slate-200 transition-all active:scale-95"
              >
                CLEAR ALL
              </button>
            </div>
          </div>
        </div>

        {/* Right: Clue Column */}
        <div className="w-full lg:w-[400px] bg-white rounded-3xl shadow-xl border border-slate-200 flex flex-col overflow-hidden">
          <div className="bg-slate-50 px-8 py-6 border-b border-slate-100 flex justify-between items-center">
             <h2 className="text-xl font-black tracking-tighter uppercase text-[#002147]">Clue List</h2>
             <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-1 rounded border border-slate-100">{questions.length} TOTAL</span>
          </div>

          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-10">
            {/* Across Section */}
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-lg bg-[#002147] text-white flex items-center justify-center font-black text-sm">A</div>
                 <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-800">Across</h3>
                 <div className="flex-1 h-[2px] bg-slate-100" />
              </div>
              <div className="space-y-6">
                {across.map(q => (
                  <div 
                    key={q.questionId} 
                    onClick={() => setFocusQuestionId(q.questionId)}
                    className={`group cursor-pointer p-2 rounded-lg transition-colors ${highlightedQId === q.questionId ? 'bg-amber-50 border border-amber-200 shadow-sm' : ''}`}
                  >
                    <div className="flex gap-4">
                      <span className="text-lg font-black text-[#002147] shrink-0 leading-tight">{q.gridNum}</span>
                      <div className="space-y-2">
                         <p className="text-[15px] font-medium leading-tight text-slate-700 group-hover:text-[#004a99] transition-colors">
                           {q.text} <span className="text-slate-400 font-bold ml-1 italic inline-block">({q.gridLen})</span>
                         </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Down Section */}
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-lg bg-[#C4962A] text-[#002147] flex items-center justify-center font-black text-sm">D</div>
                 <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-800">Down</h3>
                 <div className="flex-1 h-[2px] bg-slate-100" />
              </div>
              <div className="space-y-6">
                {down.map(q => (
                  <div 
                    key={q.questionId} 
                    onClick={() => setFocusQuestionId(q.questionId)}
                    className={`group cursor-pointer p-2 rounded-lg transition-colors ${highlightedQId === q.questionId ? 'bg-amber-50 border border-amber-200 shadow-sm' : ''}`}
                  >
                    <div className="flex gap-4">
                      <span className="text-lg font-black text-[#002147] shrink-0 leading-tight">{q.gridNum}</span>
                      <div className="space-y-2">
                         <p className="text-[15px] font-medium leading-tight text-slate-700 group-hover:text-[#004a99] transition-colors">
                           {q.text} <span className="text-slate-400 font-bold ml-1 italic inline-block">({q.gridLen})</span>
                         </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Final Submit Section */}
          <div className="p-8 bg-[#F8FBFF] border-t border-slate-100 mt-auto">
             <button 
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full bg-linear-to-r from-[#00ADEF] to-[#003B6E] text-white py-5 rounded-2xl font-black text-lg tracking-widest shadow-xl shadow-[#00ADEF]/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
             >
               {submitting ? 'PROCESSING...' : 'SUBMIT PERFORMANCE →'}
             </button>
             <p className="text-[10px] text-center text-[#64748B] font-bold uppercase tracking-widest mt-4">
               iorta TechNXT Digital Agency audit · 2026
             </p>
          </div>
        </div>

      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f8fafc;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  )
}
