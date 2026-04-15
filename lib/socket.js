import { io } from 'socket.io-client'

const isLocal = typeof window !== 'undefined' && window.location.hostname === 'localhost'
const SOCKET_URL = isLocal
  ? 'http://localhost:4000'
  : 'https://inxt-event-backend.vercel.app'

export const getSocket = () => {
  if (!isLocal) {
    console.log('Production mode (Vercel): Socket disabled. Falling back to API polling.')
    return { on: () => {}, emit: () => {}, disconnect: () => {}, connected: false }
  }

  return io(SOCKET_URL, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000
  })
}
