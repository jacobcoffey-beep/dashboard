const express = require('express');
const User = require('../models/User');
const { authMiddleware, adminOnly } = require('../middleware/auth');

const router = express.Router();

// All routes require auth & admin
router.use(authMiddleware, adminOnly);

// List users
router.get('/users', async (req, res) => {
  const users = await User.find().select('-passwordHash');
  res.json({ users });
});

// Make or revoke admin
router.post('/users/:id/admin', async (req, res) => {
  const { id } = req.params;
  const { isAdmin } = req.body;
  if (typeof isAdmin !== 'boolean') return res.status(400).json({ error: 'isAdmin boolean required' });
  const user = await User.findByIdAndUpdate(id, { isAdmin }, { new: true }).select('-passwordHash');
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user });
});

// Delete user
router.delete('/users/:id', async (req, res) => {
  const { id } = req.params;
  await User.findByIdAndDelete(id);
  res.json({ ok: true });
});

module.exports = router;
