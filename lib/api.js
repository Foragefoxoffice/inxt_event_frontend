// const BASE = 'https://inxt-event-backend.vercel.app'
const BASE = 'http://localhost:4000'

async function request(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data
}

export const api = {
  // Player
  registerUser: (body) => request('POST', '/api/users/register', body),
  getActiveGames: () => request('GET', '/api/games/active'),
  getQuestions: (gameId) => request('GET', `/api/games/${gameId}/questions`),
  submitSession: (body) => request('POST', '/api/sessions/submit', body),
   getSession: (sessionId) => request('GET', `/api/sessions/${sessionId}`),
   submitLead: (sessionId, body) => request('POST', `/api/sessions/${sessionId}/lead`, body),
   getLeaderboard: (gameId) => request('GET', `/api/leaderboard/${gameId}`),
  getStats: (eventId) => request('GET', `/api/stats/${eventId}`),

  // Admin
  getEvents: () => request('GET', '/api/admin/events'),
  createEvent: (body) => request('POST', '/api/admin/events', body),
  activateEvent: (id) => request('PATCH', `/api/admin/events/${id}/activate`),
  getAdminGames: () => request('GET', '/api/admin/games'),
  createGame: (body) => request('POST', '/api/admin/games', body),
  updateGame: (id, body) => request('PATCH', `/api/admin/games/${id}`, body),
  deleteGame: (id) => request('DELETE', `/api/admin/games/${id}`),
  getAdminQuestions: (gameId) => request('GET', `/api/admin/games/${gameId}/questions`),
  createQuestion: (gameId, body) => request('POST', `/api/admin/games/${gameId}/questions`, body),
  updateQuestion: (id, body) => request('PATCH', `/api/admin/questions/${id}`, body),
  deleteQuestion: (id) => request('DELETE', `/api/admin/questions/${id}`),
  getAdminSessions: () => request('GET', '/api/admin/sessions'),
  deleteSession: (id) => request('DELETE', `/api/admin/sessions/${id}`)
}
