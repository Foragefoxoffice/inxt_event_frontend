export function LiveStats({ games, totalPlayers }) {
  const statsList = [
    { label: 'ATTENDEES', value: totalPlayers, color: 'text-white' },
    ...games.map(g => {
      let mainStat = `${g.totalSubmissions} played`
      let color = 'text-[#00ADEF]'
      let label = g.gameType
      
      if (g.gameType === 'QUIZ') {
        mainStat = `${g.aiMatchPercent}% MATCH`
        color = 'text-[#00ADEF]'
      } else if (g.gameType === 'CROSSWORD') {
        mainStat = `${g.totalCompletions} SOLVERS`
        color = 'text-[#00ADEF]'
      } else if (g.gameType === 'MYTH') {
        mainStat = `${g.avgScore ?? 0}% CORRECT`
        color = 'text-[#7BC242]'
      } else if (g.gameType === 'AGENCY') {
        const topMetric = Object.entries(g.avgMetrics || {}).reduce((a, b) => a[1] > b[1] ? a : b, ['revenue', 0])
        mainStat = `+${topMetric[1]}% ${topMetric[0].slice(0, 4)}`
        color = 'text-[#7BC242]'
      }

      return { label, title: g.title, value: mainStat, color }
    })
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
      {statsList.map((s, i) => (
        <div key={i} className="bg-white border border-[#00ADEF]/10 rounded-2xl p-5 shadow-lg shadow-[#00ADEF]/5 flex flex-col justify-between animate-fade-up" style={{ animationDelay: `${i * 0.1}s` }}>
          <div className="text-[10px] font-quiz-label tracking-[0.2em] text-[#003B6E]/40 mb-2">{s.label}</div>
          <div className={`font-quiz-display text-2xl font-black leading-none truncate ${s.color}`}>
            {s.value}
          </div>
          {s.title && (
            <div className="text-[10px] text-[#003B6E]/20 mt-3 truncate uppercase tracking-widest">{s.title}</div>
          )}
        </div>
      ))}
    </div>
  )
}
