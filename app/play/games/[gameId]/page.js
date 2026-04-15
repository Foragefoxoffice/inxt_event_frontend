'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { api } from '@/lib/api'
import { AgencyGame } from '@/components/player/AgencyGame'
import { MythGame } from '@/components/player/MythGame'
import { CrosswordGame } from '@/components/player/CrosswordGame'
import { InterviewerHub } from '@/components/player/InterviewerHub'

export default function GamePage() {
  const { gameId } = useParams()
  const router = useRouter()
  const [step, setStep] = useState('loading') // loading | register | game | error
  const [gameData, setGameData] = useState(null)
  const [eventId, setEventId] = useState(null)
  const [playerId, setPlayerId] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    Promise.all([
      api.getQuestions(gameId),
      api.getActiveGames()
    ])
      .then(([qData, eventData]) => {
        setGameData(qData)
        setEventId(eventData.eventId)

        // Read player registered on the /play page this session
        try {
          const stored = sessionStorage.getItem(`player_${eventData.eventId}`)
          if (stored) {
            const { playerId: pid } = JSON.parse(stored)
            setPlayerId(pid)
            setStep('game')
            return
          }
        } catch (_) {}

        // No session found — send back to register
        router.replace('/play')
      })
      .catch(err => {
        setError(err.message)
        setStep('error')
      })
  }, [gameId])

  async function handleSubmit(answers, duration = null) {
    setSubmitting(true)
    setError(null)
    try {
      const data = await api.submitSession({ playerId, gameId, answers, duration })
      router.push(`/play/games/${gameId}/result?session=${data.sessionId}`)
    } catch (err) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  if (step === 'loading') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F7FAFF' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 32, height: 32, border: '2.5px solid #E2E8F0', borderTopColor: '#00ADEF', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 12px' }} />
          <p style={{ fontFamily: 'sans-serif', fontSize: 13, color: '#64748B' }}>Loading Experience...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (step === 'error') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F7F6F2' }}>
        <p style={{ color: '#EF4444', fontFamily: 'sans-serif' }}>{error}</p>
      </div>
    )
  }

  const GameComponents = {
    AGENCY: <AgencyGame questions={gameData.questions} onSubmit={handleSubmit} submitting={submitting} eventId={eventId} />,
    MYTH: <MythGame questions={gameData.questions} onSubmit={handleSubmit} submitting={submitting} eventId={eventId} />,
    CROSSWORD: <CrosswordGame questions={gameData.questions} onSubmit={handleSubmit} submitting={submitting} eventId={eventId} />,
    INTERVIEW: <InterviewerHub questions={gameData.questions} onSubmit={handleSubmit} submitting={submitting} eventId={eventId} />
  }

  const component = GameComponents[gameData.type]
  if (component) return component

  return (
    <div className="min-h-screen flex items-center justify-center text-white" style={{ background: '#061122' }}>
      <p>Unknown game type</p>
    </div>
  )
}
