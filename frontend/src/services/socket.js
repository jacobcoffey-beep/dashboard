import { io } from 'socket.io-client'

let socket = null

export function connectSocket(token) {
  socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000', {
    auth: { token }
  })
  return socket
}

export function getSocket() {
  return socket
}

export function disconnectSocket() {
  if (socket) socket.disconnect()
  socket = null
}
