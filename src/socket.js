const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const Message = require('./models/Message');
const User = require('./models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

// Helper to create a deterministic room id for two user ids
function pairRoom(a, b) {
  return [String(a), String(b)].sort().join(':');
}

let io;
function initializeSocket(server) {
  io = new Server(server, {
    cors: { origin: '*' }
  });

  io.use(async (socket, next) => {
    const token = socket.handshake.auth && socket.handshake.auth.token;
    if (!token) return next(new Error('auth error'));
    try {
      const payload = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(payload.id);
      if (!user) return next(new Error('auth error'));
      socket.user = user;
      next();
    } catch (err) {
      next(new Error('auth error'));
    }
  });

  io.on('connection', async (socket) => {
    const user = socket.user;
    const userId = String(user._id);
    socket.join(userId); // personal room

    // mark online
    await User.findByIdAndUpdate(userId, { online: true });
    io.emit('presence', { userId, online: true });

    // handle joining private room with friend
    socket.on('joinPrivate', ({ to }) => {
      const room = pairRoom(userId, to);
      socket.join(room);
    });

    // private message
    socket.on('privateMessage', async ({ to, content }) => {
      if (!to || !content) return;
      const msg = await Message.create({ from: userId, to, content });
      const room = pairRoom(userId, to);
      // emit to the conversation room and to recipient directly
      io.to(room).emit('message', { message: msg });
      io.to(String(to)).emit('message', { message: msg }); // ensure direct delivery
    });

    // typing indicator
    socket.on('typing', ({ to, typing }) => {
      if (!to) return;
      const room = pairRoom(userId, to);
      socket.to(room).emit('typing', { from: userId, typing });
      socket.to(String(to)).emit('typing', { from: userId, typing });
    });

    socket.on('disconnect', async () => {
      // can check if user has other sockets; for simplicity, set offline
      await User.findByIdAndUpdate(userId, { online: false });
      io.emit('presence', { userId, online: false });
    });
  });

  console.log('Socket.IO initialized');
}

module.exports = { initializeSocket };
