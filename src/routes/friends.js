const express = require('express');
const User = require('../models/User');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// Get friend list
router.get('/', async (req, res) => {
  const user = await User.findById(req.user._id).populate('friends', 'username email online');
  res.json({ friends: user.friends || [] });
});

// Add friend (id)
router.post('/add/:id', async (req, res) => {
  const { id } = req.params;
  if (id === String(req.user._id)) return res.status(400).json({ error: 'Cannot add yourself' });
  const other = await User.findById(id);
  if (!other) return res.status(404).json({ error: 'User not found' });
  // Add if not already
  await User.updateOne({ _id: req.user._id }, { $addToSet: { friends: other._id } });
  res.json({ ok: true });
});

// Remove friend
router.post('/remove/:id', async (req, res) => {
  const { id } = req.params;
  await User.updateOne({ _id: req.user._id }, { $pull: { friends: id } });
  res.json({ ok: true });
});

module.exports = router;
