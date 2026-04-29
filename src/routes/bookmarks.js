const express = require('express');
const Bookmark = require('../models/Bookmark');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// Create bookmark
router.post('/', async (req, res) => {
  const { title, url, tags } = req.body;
  if (!title || !url) return res.status(400).json({ error: 'Missing title or url' });
  const b = await Bookmark.create({ user: req.user._id, title, url, tags: tags || [] });
  res.json({ bookmark: b });
});

// List user's bookmarks
router.get('/', async (req, res) => {
  const bookmarks = await Bookmark.find({ user: req.user._id }).sort('-createdAt');
  res.json({ bookmarks });
});

// Update
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const b = await Bookmark.findOneAndUpdate({ _id: id, user: req.user._id }, req.body, { new: true });
  if (!b) return res.status(404).json({ error: 'Not found' });
  res.json({ bookmark: b });
});

// Delete
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  await Bookmark.findOneAndDelete({ _id: id, user: req.user._id });
  res.json({ ok: true });
});

module.exports = router;
