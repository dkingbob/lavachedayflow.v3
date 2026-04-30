// backend/server.js — Dayflow API Server
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const express = require('express');
const cors    = require('cors');
const path    = require('path');
const db      = require('./db/database');

const app  = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));
app.use(express.json({ limit: '20mb' })); // allow file uploads as base64

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/data',     require('./routes/data'));
app.use('/api/sessions', require('./routes/sessions'));

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (_, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));

// ── Serve frontend (when running locally or on Render as full-stack) ──────────
const FRONTEND = path.join(__dirname, '../frontend');
app.use(express.static(FRONTEND));
app.get('*', (_, res) => res.sendFile(path.join(FRONTEND, 'index.html')));

// ── Boot ──────────────────────────────────────────────────────────────────────
db.init().then(() => {
  app.listen(PORT, () => {
    console.log(`\n🟢 Dayflow running → http://localhost:${PORT}`);
    console.log(`   API health     → http://localhost:${PORT}/api/health\n`);
  });
}).catch(err => {
  console.error('❌ Failed to initialize database:', err);
  process.exit(1);
});
