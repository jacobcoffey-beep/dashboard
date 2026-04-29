const express = require('express');
const User = require('../models/User');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// Member search by username or email (partial)
router.get('/members', async (req, res) => {
  const q = req.query.q || '';
  if (!q || q.length < 1) return res.json({ results: [] });
  const regex = new RegExp(q, 'i');
  const users = await User.find({ $or: [{ username: regex }, { email: regex }] }).select('username email online').limit(50);
  res.json({ results: users });
});

module.exports = router;
