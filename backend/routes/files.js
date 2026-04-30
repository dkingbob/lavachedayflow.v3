// backend/routes/files.js
// Files are stored as base64 in SQLite (suitable for personal use / small files).
// For heavy usage, swap `data` column for an S3/R2 key.

const express = require('express');
const db = require('../db/database');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth);

const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8 MB

// GET /api/files  →  list all files (no data, just metadata)
router.get('/', (req, res) => {
  const { category } = req.query;
  let query = 'SELECT id, category, name, size, mime_type, created_at FROM files WHERE user_id = ?';
  const params = [req.user.id];
  if (category) { query += ' AND category = ?'; params.push(category); }
  query += ' ORDER BY created_at DESC';
  res.json(db.prepare(query).all(...params));
});

// GET /api/files/:id  →  download / preview (returns full base64 data)
router.get('/:id', (req, res) => {
  const row = db
    .prepare('SELECT * FROM files WHERE id = ? AND user_id = ?')
    .get(req.params.id, req.user.id);
  if (!row) return res.status(404).json({ error: 'File not found' });
  res.json(row);
});

// POST /api/files  →  upload a file
router.post('/', (req, res) => {
  const { category = 'General', name, size, mime_type = '', data } = req.body;
  if (!name || !data) return res.status(400).json({ error: 'name and data are required' });
  if (size > MAX_FILE_SIZE) return res.status(413).json({ error: 'File exceeds 8 MB limit' });

  const result = db
    .prepare('INSERT INTO files (user_id, category, name, size, mime_type, data) VALUES (?,?,?,?,?,?)')
    .run(req.user.id, category, name, size || 0, mime_type, data);

  res.status(201).json({ id: result.lastInsertRowid, category, name, size, mime_type });
});

// PATCH /api/files/:id  →  rename or move category
router.patch('/:id', (req, res) => {
  const { name, category } = req.body;
  const row = db.prepare('SELECT id FROM files WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!row) return res.status(404).json({ error: 'File not found' });

  if (name !== undefined) db.prepare('UPDATE files SET name = ? WHERE id = ?').run(name, req.params.id);
  if (category !== undefined) db.prepare('UPDATE files SET category = ? WHERE id = ?').run(category, req.params.id);
  res.json({ ok: true });
});

// DELETE /api/files/:id
router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM files WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
  res.json({ ok: true });
});

// GET /api/files/categories/list  →  distinct categories for this user
router.get('/categories/list', (req, res) => {
  const rows = db
    .prepare("SELECT DISTINCT category FROM files WHERE user_id = ? ORDER BY category")
    .all(req.user.id);
  res.json(['General', ...rows.map(r => r.category).filter(c => c !== 'General')]);
});

module.exports = router;
