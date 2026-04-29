import { useState, useEffect } from 'react'
import api from '../services/api'
import Navbar from '../components/Navbar'
import { useNavigate } from 'react-router-dom'

export default function BookmarksPage() {
  const navigate = useNavigate()
  const [bookmarks, setBookmarks] = useState([])
  const [form, setForm] = useState({ title: '', url: '', tags: '' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const user = JSON.parse(localStorage.getItem('user'))

  useEffect(() => {
    fetchBookmarks()
  }, [])

  const fetchBookmarks = async () => {
    try {
      const res = await api.get('/bookmarks')
      setBookmarks(res.data.bookmarks)
    } catch (err) {
      setError('Failed to fetch bookmarks')
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    try {
      const tags = form.tags.split(',').map(t => t.trim()).filter(t => t)
      await api.post('/bookmarks', { ...form, tags })
      setForm({ title: '', url: '', tags: '' })
      fetchBookmarks()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add bookmark')
    }
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/bookmarks/${id}`)
      fetchBookmarks()
    } catch (err) {
      setError('Failed to delete bookmark')
    }
  }

  return (
    <div>
      <Navbar user={user} onLogout={() => {
        navigate('/login')
        window.location.reload()
      }} />
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">📚 Bookmarks</h1>
        
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">{error}</div>}

        <div className="card mb-6">
          <h2 className="text-xl font-bold mb-4">Add New Bookmark</h2>
          <form onSubmit={handleAdd} className="space-y-4">
            <input
              type="text"
              placeholder="Title"
              className="input"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
            <input
              type="url"
              placeholder="URL"
              className="input"
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Tags (comma-separated)"
              className="input"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
            />
            <button type="submit" className="btn-primary">Add Bookmark</button>
          </form>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-4">Your Bookmarks</h2>
          {loading ? <p>Loading...</p> : bookmarks.length === 0 ? (
            <p className="text-gray-600">No bookmarks yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bookmarks.map(b => (
                <div key={b._id} className="card">
                  <h3 className="text-lg font-bold mb-2">{b.title}</h3>
                  <a href={b.url} target="_blank" className="text-blue-600 hover:underline mb-2 block">{b.url}</a>
                  {b.tags.length > 0 && <p className="text-sm text-gray-600 mb-3">{b.tags.join(', ')}</p>}
                  <button onClick={() => handleDelete(b._id)} className="btn-danger">Delete</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
