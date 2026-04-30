const router = require('express').Router();
const auth   = require('../middleware/auth');
const db     = require('../db/database');

// GET /api/data  — load all keys for this user
router.get('/', auth, (req, res) => {
  const rows = db.all('SELECT key, value FROM user_data WHERE user_id = ?', [req.user.id]);
  const result = {};
  rows.forEach(r => {
    try { result[r.key] = JSON.parse(r.value); } catch { result[r.key] = r.value; }
  });
  res.json(result);
});

// GET /api/data/:key
router.get('/:key', auth, (req, res) => {
  const row = db.get('SELECT value FROM user_data WHERE user_id = ? AND key = ?', [req.user.id, req.params.key]);
  try { res.json({ value: row ? JSON.parse(row.value) : null }); } catch { res.json({ value: null }); }
});

// POST /api/data/:key
router.post('/:key', auth, (req, res) => {
  const value = JSON.stringify(req.body.value ?? null);
  const now   = new Date().toISOString();
  const existing = db.get('SELECT id FROM user_data WHERE user_id = ? AND key = ?', [req.user.id, req.params.key]);
  if (existing) {
    db.run('UPDATE user_data SET value = ?, updated_at = ? WHERE user_id = ? AND key = ?',
      [value, now, req.user.id, req.params.key]);
  } else {
    db.run('INSERT INTO user_data (user_id, key, value, updated_at) VALUES (?, ?, ?, ?)',
      [req.user.id, req.params.key, value, now]);
  }
  res.json({ ok: true });
});

// DELETE /api/data/:key
router.delete('/:key', auth, (req, res) => {
  db.run('DELETE FROM user_data WHERE user_id = ? AND key = ?', [req.user.id, req.params.key]);
  res.json({ ok: true });
});

module.exports = router;
