import { useState, useEffect } from 'react'
import api from '../services/api'
import Navbar from '../components/Navbar'
import { useNavigate } from 'react-router-dom'

export default function FriendsPage({ user }) {
  const navigate = useNavigate()
  const [friends, setFriends] = useState([])
  const [searchResults, setSearchResults] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchFriends()
  }, [])

  const fetchFriends = async () => {
    try {
      const res = await api.get('/friends')
      setFriends(res.data.friends)
    } catch (err) {
      setError('Failed to fetch friends')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }
    try {
      const res = await api.get('/search/members', { params: { q: searchQuery } })
      setSearchResults(res.data.results)
    } catch (err) {
      setError('Search failed')
    }
  }

  const handleAddFriend = async (id) => {
    try {
      await api.post(`/friends/add/${id}`)
      fetchFriends()
      setSearchResults([])
      setSearchQuery('')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add friend')
    }
  }

  const handleRemoveFriend = async (id) => {
    try {
      await api.post(`/friends/remove/${id}`)
      fetchFriends()
    } catch (err) {
      setError('Failed to remove friend')
    }
  }

  return (
    <div>
      <Navbar user={user} onLogout={() => {
        navigate('/login')
        window.location.reload()
      }} />
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">👥 Friends</h1>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">{error}</div>}

        <div className="card mb-6">
          <h2 className="text-xl font-bold mb-4">Find Friends</h2>
          <form onSubmit={handleSearch} className="space-y-4">
            <input
              type="text"
              placeholder="Search by username or email"
              className="input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="btn-primary">Search</button>
          </form>

          {searchResults.length > 0 && (
            <div className="mt-4">
              <h3 className="font-bold mb-2">Search Results:</h3>
              <div className="space-y-2">
                {searchResults.map(u => (
                  <div key={u._id} className="flex justify-between items-center bg-gray-100 p-3 rounded">
                    <div>
                      <p className="font-semibold">{u.username}</p>
                      <p className="text-sm text-gray-600">{u.email}</p>
                      <p className="text-sm text-green-600">{u.online ? '🟢 Online' : '🔴 Offline'}</p>
                    </div>
                    <button onClick={() => handleAddFriend(u._id)} className="btn-primary">Add</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <h2 className="text-xl font-bold mb-4">Your Friends</h2>
          {loading ? <p>Loading...</p> : friends.length === 0 ? (
            <p className="text-gray-600">No friends yet. Search above to add some!</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {friends.map(f => (
                <div key={f._id} className="card">
                  <p className="text-lg font-bold">{f.username}</p>
                  <p className="text-sm text-gray-600 mb-2">{f.email}</p>
                  <p className="text-sm text-green-600 mb-3">{f.online ? '🟢 Online' : '🔴 Offline'}</p>
                  <div className="flex gap-2">
                    <a href={`/chat?friend=${f._id}`} className="btn-primary flex-1 text-center">Message</a>
                    <button onClick={() => handleRemoveFriend(f._id)} className="btn-danger flex-1">Remove</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
