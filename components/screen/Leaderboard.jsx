const RANK_STYLES = ['text-[#00ADEF]', 'text-[#7BC242]', 'text-[#003B6E]']

export function Leaderboard({ entries, gameType, title }) {
  return (
    <div className="bg-white border border-[#00ADEF]/10 rounded-2xl p-6 shadow-lg shadow-[#00ADEF]/5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-[#003B6E]/40 text-xs uppercase tracking-widest leading-none mb-1">{gameType} Leaderboard</p>
          <h2 className="text-[#003B6E] font-black text-lg uppercase tracking-tight">{title}</h2>
        </div>
        <div className="text-[#003B6E]/30 text-sm font-bold">{entries.length} players</div>
      </div>

      <div className="space-y-2">
        {entries.slice(0, 10).map((entry, i) => (
          <div
            key={i}
            className={`flex items-center gap-4 px-4 py-3 rounded-xl ${
              i === 0 ? 'bg-[#00ADEF]/5 border border-[#00ADEF]/20' : 'bg-[#F8FBFF]'
            }`}
          >
            <span className={`text-2xl font-black w-8 text-center ${RANK_STYLES[i] || 'text-slate-600'}`}>
              {entry.rank}
            </span>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-[#003B6E] truncate">{entry.name}</div>
              <div className="text-[#003B6E]/50 text-xs truncate">{entry.company}</div>
            </div>
            <div className="text-right">
              <div className="text-xl font-black text-[#003B6E]">
                {gameType === 'MYTH' && `${(entry.score / 100 * 10).toFixed(0)}/10`}
                {gameType === 'AGENCY' && `${entry.score} pts`}
                {gameType === 'CROSSWORD' && `${entry.score}%`}
                {gameType === 'INTERVIEW' && <span className="text-xs text-green-400">CAPTURED</span>}
              </div>
              <div className="text-[9px] font-black coral-text tracking-widest uppercase opacity-50">
                {gameType === 'MYTH' ? 'Correct' : (gameType === 'AGENCY' ? 'Overall' : (gameType === 'CROSSWORD' ? 'Solved' : 'Verified'))}
              </div>
            </div>
          </div>
        ))}

        {entries.length === 0 && (
          <p className="text-slate-500 text-center py-12 text-lg">Waiting for first submission...</p>
        )}
      </div>
    </div>
  )
}
