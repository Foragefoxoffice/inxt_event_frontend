'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { api } from '@/lib/api'
import { QuizResult } from '@/components/player/QuizResult'
import { AgencyResult } from '@/components/player/AgencyResult'
import { MythResult } from '@/components/player/MythResult'
import { CrosswordResult } from '@/components/player/CrosswordResult'

function ResultContent() {
  const router = useRouter()
  const { gameId } = useParams()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session')

  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!sessionId) { router.push('/play'); return }
    api.getSession(sessionId)
      .then(data => { setSession(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [sessionId, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#061122' }}>
        <div className="w-8 h-8 border-2 border-[#C4962A] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white" style={{ background: '#061122' }}>
        <p className="text-red-400">Session not found</p>
      </div>
    )
  }

  const ResultComponents = {
    QUIZ: <QuizResult result={session.result} eventId={session.eventId} />,
    AGENCY: <AgencyResult result={session.result} eventId={session.eventId} sessionId={sessionId} />,
    MYTH: <MythResult result={session.result} eventId={session.eventId} />,
    CROSSWORD: <CrosswordResult result={session.result} eventId={session.eventId} />
  }

  const component = ResultComponents[session.gameType]

  if (component) {
    return component
  }

  return (
    <div className="min-h-screen bg-[#061122] flex items-center justify-center text-white">
      <p>Unknown result type</p>
    </div>
  )
}

export default function ResultPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#061122' }}>
        <div className="w-8 h-8 border-2 border-[#C4962A] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ResultContent />
    </Suspense>
  )
}
