import { io } from 'socket.io-client'

const isLocal = typeof window !== 'undefined' && window.location.hostname === 'localhost'
const SOCKET_URL = isLocal
  ? 'http://localhost:4000'
  : 'https://inxt-event-backend.vercel.app'

export const getSocket = () => {
  return io(SOCKET_URL, {
    // Use only polling in production to avoid Vercel WebSocket errors
    transports: isLocal ? ['websocket', 'polling'] : ['polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000
  })
}
