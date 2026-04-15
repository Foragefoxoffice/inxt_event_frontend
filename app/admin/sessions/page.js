'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'

const GAME_COLORS = { QUIZ: 'text-blue-400', AGENCY: 'text-emerald-400', MYTH: 'text-purple-400', CROSSWORD: 'text-amber-400' }

export default function AdminSessionsPage() {
  const router = useRouter()
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getAdminSessions().then(data => { setSessions(data); setLoading(false) })
  }, [])

  async function resetSession(id) {
    if (!confirm('Delete this player session? They will be able to replay the game.')) return
    await api.deleteSession(id)
    setSessions(s => s.filter(x => String(x._id) !== id))
  }

  return (
    <main className="p-10 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-4xl font-black text-[#003B6E] tracking-tight uppercase">Session <span className="text-[#00ADEF]">Records</span></h1>
          <p className="text-sm text-[#003B6E]/40 font-bold uppercase tracking-widest mt-1">Live tracking and engagement logs for all agents</p>
        </div>
        
        <div className="flex bg-white p-4 rounded-2xl shadow-sm border border-[#00ADEF]/10 gap-8">
          <div className="text-center">
            <p className="text-[9px] font-black text-[#003B6E]/30 uppercase tracking-[0.2em] mb-1">Total Logs</p>
            <p className="text-xl font-black text-[#003B6E]">{sessions.length}</p>
          </div>
          <div className="w-px h-8 bg-[#00ADEF]/10" />
          <div className="text-center">
            <p className="text-[9px] font-black text-[#003B6E]/30 uppercase tracking-[0.2em] mb-1">Active Now</p>
            <p className="text-xl font-black text-[#7BC242] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#7BC242] animate-pulse" />
              {Math.floor(sessions.length * 0.1 || 0)}
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-24 text-center">
          <div className="w-12 h-12 border-2 border-[#00ADEF] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#003B6E]/20">Calibrating session logs...</p>
        </div>
      ) : sessions.length === 0 ? (
        <div className="bg-white rounded-3xl p-32 text-center border border-dashed border-[#00ADEF]/20">
          <p className="text-[#003B6E]/30 text-xs font-black uppercase tracking-[0.3em]">No activity detected in the field</p>
        </div>
      ) : (
        <div className="bg-white rounded-[32px] shadow-xl shadow-[#003B6E]/5 border border-[#00ADEF]/10 overflow-hidden">
          <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-320px)] custom-scrollbar">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#050e1a] text-white/40 sticky top-0 z-20">
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest">Agent Identifer</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest">Organization</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-center">Engine</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-center">Performance</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest">Time Stamp</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#00ADEF]/5">
                {sessions.map((s, i) => (
                  <tr key={s._id} className="hover:bg-[#F8FBFF] transition-all group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#00ADEF]/10 flex items-center justify-center font-black text-[#00ADEF] text-[10px]">
                          {(s.userId?.name || 'A')[0]}
                        </div>
                        <div>
                          <p className="text-sm font-black text-[#003B6E] tracking-tight">{s.userId?.name || 'Anonymous'}</p>
                          <p className="text-[9px] font-bold text-[#003B6E]/30 uppercase tracking-widest">UID: {String(s._id).slice(-6)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-[11px] font-bold text-[#003B6E]/60 uppercase tracking-wide">{s.userId?.company || 'External Guest'}</p>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border ${
                        s.gameType === 'QUIZ' ? 'bg-[#00ADEF]/5 text-[#00ADEF] border-[#00ADEF]/10' :
                        s.gameType === 'MYTH' ? 'bg-purple-500/5 text-purple-500 border-purple-500/10' :
                        s.gameType === 'CROSSWORD' ? 'bg-amber-500/5 text-amber-500 border-amber-500/10' :
                        'bg-[#7BC242]/5 text-[#7BC242] border-[#7BC242]/10'
                      }`}>
                        {s.gameType}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <div className="flex items-center justify-center gap-4">
                        <p className="text-lg font-black text-[#003B6E]">{s.result?.score ?? 0}<span className="text-[10px] text-[#003B6E]/30 ml-0.5">%</span></p>
                        <div className="w-16 bg-[#F8FBFF] rounded-full h-1.5 overflow-hidden border border-[#E2E8F0]">
                          <div className={`h-full rounded-full transition-all duration-1000 ${
                            (s.result?.score ?? 0) > 80 ? 'bg-[#7BC242]' : (s.result?.score ?? 0) > 50 ? 'bg-[#00ADEF]' : 'bg-amber-400'
                          }`} style={{ width: `${s.result?.score ?? 0}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-[10px] font-bold text-[#003B6E]/40 font-mono italic">
                        {new Date(s.completedAt).toLocaleDateString('en-GB')} @ {new Date(s.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button
                        onClick={() => resetSession(String(s._id))}
                        className="opacity-0 group-hover:opacity-100 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border border-red-100 active:scale-95"
                      >
                        Reset Data
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
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
