import { io } from 'socket.io-client'

const SOCKET_URL = 'https://inxt-event-backend.vercel.app'

export const getSocket = () => {
  return io(SOCKET_URL, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000
  })
}
