'use client'

import { useState, useEffect } from 'react'

export function WinnerBanner({ winner }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!winner) return
    setVisible(true)
    const t = setTimeout(() => setVisible(false), 7000)
    return () => clearTimeout(t)
  }, [winner])

  if (!visible || !winner) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-[#003B6E]/40 backdrop-blur-sm">
      <div className="bg-white text-[#003B6E] rounded-[40px] p-20 text-center shadow-2xl border-4 border-[#00ADEF] max-w-lg mx-auto animate-in fade-in zoom-in duration-500">
        <div className="text-7xl mb-8">🏆</div>
        <div className="text-xs font-black uppercase tracking-[0.3em] text-[#00ADEF] mb-4">Crossword Champion</div>
        <div className="text-5xl font-black leading-tight mb-2">{winner.name}</div>
        <div className="text-sm font-bold opacity-60 uppercase tracking-widest">{winner.company}</div>
      </div>
    </div>
  )
}
