import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import api from './services/api'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import BookmarksPage from './pages/BookmarksPage'
import FriendsPage from './pages/FriendsPage'
import ChatPage from './pages/ChatPage'
import AdminPage from './pages/AdminPage'
import PrivateRoute from './components/PrivateRoute'

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    if (token && userData) {
      setUser(JSON.parse(userData))
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }
    setLoading(false)
  }, [])

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage setUser={setUser} />} />
        <Route path="/register" element={<RegisterPage setUser={setUser} />} />
        <Route path="/dashboard" element={<PrivateRoute user={user}><DashboardPage user={user} setUser={setUser} /></PrivateRoute>} />
        <Route path="/bookmarks" element={<PrivateRoute user={user}><BookmarksPage /></PrivateRoute>} />
        <Route path="/friends" element={<PrivateRoute user={user}><FriendsPage user={user} /></PrivateRoute>} />
        <Route path="/chat" element={<PrivateRoute user={user}><ChatPage user={user} /></PrivateRoute>} />
        <Route path="/admin" element={<PrivateRoute user={user}><AdminPage user={user} /></PrivateRoute>} />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  )
}
