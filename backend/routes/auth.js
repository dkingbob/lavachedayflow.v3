const router   = require('express').Router();
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const db       = require('../db/database');

const JWT_SECRET = process.env.JWT_SECRET || 'dayflow-dev-secret-change-in-prod';
const signToken  = (user) => jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { email, password, name = '' } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  try {
    const hash   = await bcrypt.hash(password, 10);
    const result = db.run(
      'INSERT INTO users (email, password, name) VALUES (?, ?, ?)',
      [email.toLowerCase().trim(), hash, name.trim()]
    );
    const user  = { id: result.lastInsertRowid, email: email.toLowerCase(), name };
    res.json({ token: signToken(user), user });
  } catch (e) {
    if (e.message?.includes('UNIQUE')) return res.status(409).json({ error: 'Email already registered' });
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  const user = db.get('SELECT * FROM users WHERE email = ?', [email.toLowerCase().trim()]);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.password);
  if (!ok)   return res.status(401).json({ error: 'Invalid credentials' });
  res.json({ token: signToken(user), user: { id: user.id, email: user.email, name: user.name } });
});

module.exports = router;
