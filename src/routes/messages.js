const express = require('express');
const Message = require('../models/Message');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// Get conversation between current user and another
router.get('/conversation/:userId', async (req, res) => {
  const { userId } = req.params;
  const me = req.user._id;
  const messages = await Message.find({
    $or: [
      { from: me, to: userId },
      { from: userId, to: me }
    ]
  }).sort('createdAt');
  res.json({ messages });
});

// Mark messages from a user as read
router.post('/read/:userId', async (req, res) => {
  const { userId } = req.params;
  await Message.updateMany({ from: userId, to: req.user._id, read: false }, { $set: { read: true } });
  res.json({ ok: true });
});

// Send a message via REST (Socket handles real-time)
router.post('/', async (req, res) => {
  const { to, content } = req.body;
  if (!to || !content) return res.status(400).json({ error: 'to and content required' });
  const msg = await Message.create({ from: req.user._id, to, content });
  // Note: socket will also deliver; clients should handle duplicates idempotently
  res.json({ message: msg });
});

module.exports = router;
