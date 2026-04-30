const router = require('express').Router();
const auth   = require('../middleware/auth');
const db     = require('../db/database');

// GET /api/sessions — all sessions for user
router.get('/', auth, (req, res) => {
  const rows = db.all('SELECT * FROM sessions WHERE user_id = ? ORDER BY date DESC', [req.user.id]);
  res.json(rows.map(r => ({ ...r, events: JSON.parse(r.events || '[]') })));
});

// GET /api/sessions/:date
router.get('/:date', auth, (req, res) => {
  const row = db.get('SELECT * FROM sessions WHERE user_id = ? AND date = ?', [req.user.id, req.params.date]);
  if (!row) return res.json(null);
  res.json({ ...row, events: JSON.parse(row.events || '[]') });
});

// POST /api/sessions/:date
router.post('/:date', auth, (req, res) => {
  const { started_at, ended_at, events } = req.body;
  const eventsJson = JSON.stringify(events || []);
  const existing = db.get('SELECT id FROM sessions WHERE user_id = ? AND date = ?', [req.user.id, req.params.date]);
  if (existing) {
    db.run('UPDATE sessions SET started_at=?, ended_at=?, events=? WHERE id=?',
      [started_at, ended_at, eventsJson, existing.id]);
  } else {
    db.run('INSERT INTO sessions (user_id, date, started_at, ended_at, events) VALUES (?,?,?,?,?)',
      [req.user.id, req.params.date, started_at, ended_at, eventsJson]);
  }
  res.json({ ok: true });
});

module.exports = router;
