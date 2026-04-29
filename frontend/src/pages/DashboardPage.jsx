import Navbar from '../components/Navbar'
import { useState, useEffect } from 'react'
import { connectSocket, getSocket } from '../services/socket'

export default function DashboardPage({ user, setUser }) {
  const [onlineUsers, setOnlineUsers] = useState([])

  useEffect(() => {
    const token = localStorage.getItem('token')
    const socket = connectSocket(token)

    socket.on('presence', ({ userId, online }) => {
      console.log(`User ${userId} is ${online ? 'online' : 'offline'}`)
    })

    return () => socket.disconnect()
  }, [])

  return (
    <div>
      <Navbar user={user} onLogout={() => setUser(null)} />
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-4xl font-bold mb-4">Welcome, {user?.username}!</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card">
            <h2 className="text-2xl font-bold mb-2">📚 Bookmarks</h2>
            <p className="text-gray-600 mb-4">Save and organize your favorite links.</p>
            <a href="/bookmarks" className="btn-primary">Go to Bookmarks</a>
          </div>
          <div className="card">
            <h2 className="text-2xl font-bold mb-2">👥 Friends</h2>
            <p className="text-gray-600 mb-4">Manage your friend list and find new friends.</p>
            <a href="/friends" className="btn-primary">Go to Friends</a>
          </div>
          <div className="card">
            <h2 className="text-2xl font-bold mb-2">💬 Chat</h2>
            <p className="text-gray-600 mb-4">Send instant messages to friends.</p>
            <a href="/chat" className="btn-primary">Open Chat</a>
          </div>
        </div>
      </div>
    </div>
  )
}
