'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import styles from './admin.module.css'

export default function AdminPage() {
  const router = useRouter()
  const [events, setEvents] = useState([])
  const [form, setForm] = useState({ name: '', slug: '' })
  const [copyFromActive, setCopyFromActive] = useState(true)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function load() {
    try {
      const data = await api.getEvents()
      setEvents(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const activeEvent = events.find(event => event.isActive) || null

  async function createEvent(e) {
    e.preventDefault()
    setError(null)
    try {
      await api.createEvent({
        ...form,
        cloneFromEventId: copyFromActive && activeEvent ? activeEvent._id : undefined
      })
      setForm({ name: '', slug: '' })
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  async function activateEvent(id) {
    await api.activateEvent(id)
    load()
  }

  return (
    <main className="animate-in fade-in duration-300">
      
      {/* HEADER SECTION */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.titleMain}>Event <span className={styles.titleBlue}>Center</span></h1>
          <p className={styles.subtitle}>Configure global event environments and content inheritance.</p>
        </div>
        
        <div className={`${styles.statusBadge} ${activeEvent ? styles.statusLive : styles.statusIdle}`}>
          <div className={styles.statusIndicator} />
          System Status: {activeEvent ? 'LIVE' : 'IDLE'}
        </div>
      </div>

      <div className={styles.grid}>
        
        {/* INITIALIZE SECTION */}
        <div className={`col-span-12 xl:col-span-4 ${styles.stickySidebar}`}>
          <div className={styles.card}>
            <div className={styles.cardTitle}>
              <svg className="w-5 h-5 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
              Initialize New Event
            </div>
            
            <form onSubmit={createEvent} className={`${styles.formGroup} ${styles.scrollableForm}`}>
              <div className={styles.inputWrapper}>
                <label className={styles.label}>Display Name</label>
                <input
                  required
                  className={styles.input}
                  placeholder="e.g. Takaful Summit 2026"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                />
              </div>
              
              <div className={styles.inputWrapper}>
                <label className={styles.label}>System Slug</label>
                <input
                  required
                  className={styles.input}
                  placeholder="takaful-2026"
                  value={form.slug}
                  onChange={e => setForm(f => ({ ...f, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))}
                />
              </div>

              <label className={styles.checkboxCard}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={copyFromActive && !!activeEvent}
                  onChange={e => setCopyFromActive(e.target.checked)}
                  disabled={!activeEvent}
                />
                <div className="flex flex-col">
                  <span className={styles.checkboxTextPrimary}>Inherit Content</span>
                  <span className={styles.checkboxTextSecondary}>Clone all games and questions</span>
                </div>
              </label>

              <button type="submit" className={styles.submitButton}>
                Deploy New Event
              </button>
              {error && <p className="text-red-500 text-[11px] font-semibold text-center mt-2">{error}</p>}
            </form>
          </div>
        </div>

        {/* ENVIRONMENTS SECTION */}
        <div className="col-span-12 xl:col-span-8">
          <h2 className={styles.listSectionTitle}>Registered Environments ({events.length})</h2>
          
          {loading ? (
            <div className="flex items-center justify-center p-20">
              <div className="w-6 h-6 border-2 border-[#0ea5e9] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : events.length === 0 ? (
            <div className={styles.emptyState}>
              No event environments have been initialized yet.
            </div>
          ) : (
            <div className={styles.eventList}>
              {events.map(event => (
                <div key={event._id} className={`${styles.eventItem} ${event.isActive ? styles.eventItemActive : ''}`}>
                  <div className="flex items-center gap-4">
                    <div className={styles.eventIconBox}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-7h.01M9 16h.01M15 16h.01M12 12h.01M12 16h.01M12 8h.01" /></svg>
                    </div>
                    <div>
                      <div className="flex items-center">
                        <p className={styles.eventName}>{event.name}</p>
                        {event.isActive && (
                          <span className={styles.eventTag}>ACTIVE</span>
                        )}
                      </div>
                      <p className={styles.eventSlug}>/{event.slug}</p>
                    </div>
                  </div>

                  {!event.isActive && (
                    <button
                      onClick={() => activateEvent(event._id)}
                      className={styles.activateButton}
                    >
                      Activate
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </main>
  )
}
