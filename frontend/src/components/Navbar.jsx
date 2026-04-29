import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'

export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    onLogout()
    navigate('/login')
  }

  return (
    <nav className="bg-blue-600 text-white shadow">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/dashboard" className="text-2xl font-bold">Dashboard</Link>
        
        <div className="hidden md:flex gap-6">
          <Link to="/dashboard" className="hover:underline">Home</Link>
          <Link to="/bookmarks" className="hover:underline">Bookmarks</Link>
          <Link to="/friends" className="hover:underline">Friends</Link>
          <Link to="/chat" className="hover:underline">Chat</Link>
          {user?.isAdmin && <Link to="/admin" className="hover:underline">Admin</Link>}
        </div>

        <div className="relative">
          <button onClick={() => setOpen(!open)} className="bg-blue-700 px-4 py-2 rounded">
            {user?.username} ▼
          </button>
          {open && (
            <div className="absolute right-0 mt-2 bg-white text-gray-900 rounded shadow w-32">
              <button onClick={handleLogout} className="w-full text-left px-4 py-2 hover:bg-gray-100">
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
