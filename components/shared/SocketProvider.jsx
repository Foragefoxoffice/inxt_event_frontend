'use client'

import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'

const SocketContext = createContext(null)

export function SocketProvider({ eventId, children }) {
  const socketRef = useRef(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    if (!eventId) return
    const socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000')
    socketRef.current = socket

    socket.on('connect', () => {
      socket.emit('join:event', eventId)
      setConnected(true)
    })
    socket.on('disconnect', () => setConnected(false))

    return () => socket.disconnect()
  }, [eventId])

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, connected }}>
      {children}
    </SocketContext.Provider>
  )
}

export function useSocket() {
  return useContext(SocketContext)
}
