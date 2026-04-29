const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');

dotenv.config();
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const bookmarkRoutes = require('./routes/bookmarks');
const friendsRoutes = require('./routes/friends');
const messageRoutes = require('./routes/messages');
const searchRoutes = require('./routes/search');
const { initializeSocket } = require('./socket');

const app = express();
const server = http.createServer(app);

app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/friends', friendsRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/search', searchRoutes);

app.get('/', (req, res) => res.send({ ok: true, message: 'Dashboard API running' }));

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/dashboard';

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB connected');
    // Initialize socket.io after DB is up
    initializeSocket(server);
    server.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error', err);
    process.exit(1);
  });
