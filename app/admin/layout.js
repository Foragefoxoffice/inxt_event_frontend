'use client'

import { useRouter, usePathname } from 'next/navigation'

export default function AdminLayout({ children }) {
  const router = useRouter()
  const pathname = usePathname()

  const navItems = [
    { label: 'Event Center', path: '/admin', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
    { label: 'Manage Content', path: '/admin/manage', icon: 'M11 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-5m-5 5l8.5-8.5a2.121 2.121 0 00-3-3L9 7l5 5z' },
    { label: 'Game Dashboard', path: '/admin/games', icon: 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { label: 'Session Records', path: '/admin/sessions', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    { label: 'Live Analytics', path: '/admin/analytics', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    { label: 'Live Screen', path: '/screen', icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
  ]

  return (
    <div className="min-h-screen bg-[#F8FBFF] flex font-sans selection:bg-[#00ADEF]/20">
      
      {/* SIDEBAR */}
      <aside className="w-72 bg-[#050e1a] flex flex-col fixed inset-y-0 shadow-2xl z-40">
        <div className="p-8">
          <img src="/logo_shield.png" alt="SalesVerse" className="h-10 w-auto mb-2" />
          <p className="text-[#00ADEF] text-[10px] font-black uppercase tracking-[0.3em]">Control Center</p>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.path || (item.path !== '/admin' && pathname?.startsWith(item.path))
            return (
              <button
                key={item.label}
                onClick={() => router.push(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all group ${
                  isActive 
                    ? 'bg-gradient-to-r from-[#00ADEF] to-[#0096D1] text-white shadow-lg shadow-[#00ADEF]/20' 
                    : 'text-white/40 hover:text-white hover:bg-white/5'
                }`}
              >
                <svg className={`w-5 h-5 ${isActive ? 'text-white' : 'text-white/20 group-hover:text-[#00ADEF] transition-colors'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
                </svg>
                {item.label}
              </button>
            )
          })}
        </nav>

        <div className="p-8 mt-auto border-t border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-linear-to-br from-[#00ADEF] to-[#7BC242] flex items-center justify-center font-black text-white text-sm">A</div>
            <div>
              <p className="text-white text-xs font-bold leading-tight">Administrator</p>
              <p className="text-white/30 text-[9px] uppercase tracking-widest mt-0.5">Global Controller</p>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 ml-72">
        {children}
      </div>
    </div>
  )
}
