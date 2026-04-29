import { useState, useEffect } from 'react'
import api from '../services/api'
import Navbar from '../components/Navbar'
import { useNavigate } from 'react-router-dom'

export default function AdminPage({ user }) {
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user?.isAdmin) {
      navigate('/dashboard')
      return
    }
    fetchUsers()
  }, [user])

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users')
      setUsers(res.data.users)
    } catch (err) {
      setError('Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  const toggleAdmin = async (id, currentIsAdmin) => {
    try {
      await api.post(`/admin/users/${id}/admin`, { isAdmin: !currentIsAdmin })
      fetchUsers()
    } catch (err) {
      setError('Failed to update admin status')
    }
  }

  const deleteUser = async (id) => {
    if (!window.confirm('Are you sure?')) return
    try {
      await api.delete(`/admin/users/${id}`)
      fetchUsers()
    } catch (err) {
      setError('Failed to delete user')
    }
  }

  return (
    <div>
      <Navbar user={user} onLogout={() => {
        navigate('/login')
        window.location.reload()
      }} />
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">⚙️ Admin Panel</h1>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">{error}</div>}

        {loading ? <p>Loading...</p> : (
          <div className="card overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Username</th>
                  <th className="text-left p-3">Email</th>
                  <th className="text-left p-3">Admin</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{u.username}</td>
                    <td className="p-3">{u.email}</td>
                    <td className="p-3">{u.isAdmin ? '✓ Yes' : 'No'}</td>
                    <td className="p-3 flex gap-2">
                      <button
                        onClick={() => toggleAdmin(u._id, u.isAdmin)}
                        className={u.isAdmin ? 'btn-secondary' : 'btn-primary'}
                      >
                        {u.isAdmin ? 'Revoke' : 'Make'} Admin
                      </button>
                      <button
                        onClick={() => deleteUser(u._id)}
                        className="btn-danger"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
