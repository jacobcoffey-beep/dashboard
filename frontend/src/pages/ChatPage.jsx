import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../services/api'
import { connectSocket, getSocket } from '../services/socket'
import Navbar from '../components/Navbar'
import { useNavigate } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'

export default function ChatPage({ user }) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [friends, setFriends] = useState([])
  const [selectedFriend, setSelectedFriend] = useState(searchParams.get('friend') || null)
  const [messages, setMessages] = useState([])
  const [messageInput, setMessageInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    fetchFriends()
    const token = localStorage.getItem('token')
    const socket = connectSocket(token)

    socket.on('message', ({ message }) => {
      setMessages(prev => [...prev, message])
    })

    socket.on('typing', ({ from, typing }) => {
      if (from === selectedFriend) setTyping(typing)
    })

    return () => socket.disconnect()
  }, [])

  useEffect(() => {
    if (selectedFriend) {
      fetchMessages(selectedFriend)
      const socket = getSocket()
      socket?.emit('joinPrivate', { to: selectedFriend })
    }
  }, [selectedFriend])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchFriends = async () => {
    try {
      const res = await api.get('/friends')
      setFriends(res.data.friends)
    } catch (err) {
      console.error('Failed to fetch friends')
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (friendId) => {
    try {
      const res = await api.get(`/messages/conversation/${friendId}`)
      setMessages(res.data.messages)
    } catch (err) {
      console.error('Failed to fetch messages')
    }
  }

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!messageInput.trim() || !selectedFriend) return

    const socket = getSocket()
    socket?.emit('privateMessage', { to: selectedFriend, content: messageInput })
    setMessageInput('')
    setTyping(false)
  }

  const handleTyping = (value) => {
    setMessageInput(value)
    const socket = getSocket()
    socket?.emit('typing', { to: selectedFriend, typing: value.length > 0 })
  }

  return (
    <div>
      <Navbar user={user} onLogout={() => {
        navigate('/login')
        window.location.reload()
      }} />
      <div className="flex h-screen bg-gray-100">
        {/* Sidebar */}
        <div className="w-1/4 bg-white border-r overflow-y-auto">
          <div className="p-4 border-b">
            <h2 className="text-xl font-bold">Chats</h2>
          </div>
          {loading ? <p className="p-4">Loading...</p> : friends.length === 0 ? (
            <p className="p-4 text-gray-600">No friends. Add friends to chat!</p>
          ) : (
            <div>
              {friends.map(f => (
                <button
                  key={f._id}
                  onClick={() => setSelectedFriend(f._id)}
                  className={`w-full text-left p-4 border-b hover:bg-gray-50 ${selectedFriend === f._id ? 'bg-blue-50 border-l-4 border-blue-600' : ''}`}
                >
                  <p className="font-semibold">{f.username}</p>
                  <p className="text-xs text-gray-500">{f.online ? '🟢 Online' : '🔴 Offline'}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedFriend ? (
            <>
              <div className="bg-white border-b p-4 shadow">
                <p className="font-bold">{friends.find(f => f._id === selectedFriend)?.username}</p>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.from === user.id ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs px-4 py-2 rounded-lg ${msg.from === user.id ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-900'}`}>
                      <p>{msg.content}</p>
                      <p className="text-xs opacity-70 mt-1">{formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}</p>
                    </div>
                  </div>
                ))}
                {typing && <p className="text-gray-600 text-sm italic">Friend is typing...</p>}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleSendMessage} className="bg-white border-t p-4 flex gap-2">
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="input flex-1"
                  value={messageInput}
                  onChange={(e) => handleTyping(e.target.value)}
                />
                <button type="submit" className="btn-primary">Send</button>
              </form>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-600">
              <p>Select a friend to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
