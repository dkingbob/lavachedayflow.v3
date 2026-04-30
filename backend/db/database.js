const path = require('path');
const fs   = require('fs');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../dayflow.db');
let db = null, SQL = null;

async function init() {
  if (db) return db;
  const initSqlJs = require('sql.js');
  SQL = await initSqlJs();
  if (fs.existsSync(DB_PATH)) {
    db = new SQL.Database(fs.readFileSync(DB_PATH));
  } else {
    db = new SQL.Database();
  }
  setInterval(persist, 5000);
  process.on('exit', persist);
  process.on('SIGINT',  () => { persist(); process.exit(0); });
  process.on('SIGTERM', () => { persist(); process.exit(0); });
  migrate();
  return db;
}

function persist() {
  if (!db) return;
  try {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    fs.writeFileSync(DB_PATH, Buffer.from(db.export()));
  } catch(e) { console.error('[DB] persist error:', e.message); }
}

function migrate() {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS user_data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      key TEXT NOT NULL,
      value TEXT DEFAULT '{}',
      updated_at TEXT DEFAULT (datetime('now')),
      UNIQUE(user_id, key),
      FOREIGN KEY(user_id) REFERENCES users(id)
    );
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      started_at TEXT,
      ended_at TEXT,
      events TEXT DEFAULT '[]',
      UNIQUE(user_id, date),
      FOREIGN KEY(user_id) REFERENCES users(id)
    );
  `);
  console.log('[DB] migrations OK');
}

function get(sql, params=[]) {
  const s = db.prepare(sql); s.bind(params);
  if (s.step()) { const r = s.getAsObject(); s.free(); return r; }
  s.free(); return null;
}
function all(sql, params=[]) {
  const rows=[], s=db.prepare(sql); s.bind(params);
  while(s.step()) rows.push(s.getAsObject());
  s.free(); return rows;
}
function run(sql, params=[]) {
  db.run(sql, params);
  const r = get('SELECT last_insert_rowid() as id',[]);
  return { lastInsertRowid: r?.id };
}

module.exports = { init, get, all, run, persist };
