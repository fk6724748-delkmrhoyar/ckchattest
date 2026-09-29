// CK Chat Node.js server (Express + MySQL). Serves the built app and the API.
import express from 'express';
import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA = path.join(__dirname, 'data');
const CFG = path.join(DATA, 'config.json');
const LOCK = path.join(DATA, 'install.lock');
fs.mkdirSync(DATA, { recursive: true });

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use((_, res, next) => { res.set('Cache-Control', 'no-store'); next(); });

let pool = null;
const installed = () => fs.existsSync(LOCK) && fs.existsSync(CFG);
async function getPool() {
  if (pool) return pool;
  const c = JSON.parse(fs.readFileSync(CFG, 'utf8'));
  pool = mysql.createPool({ host: c.host, user: c.user, password: c.pass, database: c.name, charset: 'utf8mb4', connectionLimit: 10 });
  return pool;
}

app.get('/api/install', (_, res) => res.json({ installed: installed() }));

app.post('/api/install', async (req, res) => {
  if (installed()) return res.status(403).json({ ok: false, error: 'CK Chat is already installed.' });
  const db = req.body?.db || {}, ad = req.body?.admin || {};
  for (const k of ['host', 'name', 'user']) if (!String(db[k] || '').trim()) return res.status(422).json({ ok: false, error: `Database ${k} is required` });
  for (const k of ['username', 'displayName', 'email', 'pass']) if (!String(ad[k] || '').trim()) return res.status(422).json({ ok: false, error: `Admin ${k} is required` });
  if (String(ad.pass).length < 6) return res.status(422).json({ ok: false, error: 'Admin password must be at least 6 characters' });
  try {
    const conn = await mysql.createConnection({ host: db.host, user: db.user, password: db.pass || '', database: db.name });
    await conn.query('CREATE TABLE IF NOT EXISTS ck_state (k VARCHAR(64) PRIMARY KEY, v LONGTEXT NOT NULL, updated BIGINT NOT NULL) CHARACTER SET utf8mb4');
    await conn.end();
  } catch (e) {
    return res.status(400).json({ ok: false, error: 'Database connection failed: ' + e.message });
  }
  fs.writeFileSync(CFG, JSON.stringify({ host: db.host, name: db.name, user: db.user, pass: db.pass || '' }));
  fs.writeFileSync(LOCK, new Date().toISOString());
  res.json({ ok: true });
});

const ARRAYS = ['users', 'chats', 'messages', 'channels', 'channelPosts', 'calls', 'verifyRequests', 'groupInvites', 'reports'];
async function load() {
  const [rows] = await (await getPool()).query('SELECT k, v FROM ck_state');
  const s = {}; for (const r of rows) s[r.k] = JSON.parse(r.v); return s;
}

app.get('/api/state', async (_, res) => {
  if (!installed()) return res.status(409).json({ error: 'not installed' });
  try { res.json(await load()); } catch (e) { res.status(500).json({ error: e.message }); }
});

let queue = Promise.resolve();
app.post('/api/state', (req, res) => {
  if (!installed()) return res.status(409).json({ error: 'not installed' });
  queue = queue.then(async () => {
    const { state = {}, deleted = {} } = req.body || {};
    const cur = await load();
    const p = await getPool();
    for (const [k, v] of Object.entries(state)) {
      let val = v;
      if (ARRAYS.includes(k)) {
        const idk = k === 'users' ? 'uid' : 'id';
        const map = new Map();
        for (const r of cur[k] || []) map.set(r[idk], r);
        for (const r of v || []) map.set(r[idk], r);
        for (const id of deleted[k] || []) map.delete(id);
        val = [...map.values()];
      } else if (k !== 'systemSettings') continue;
      await p.query('REPLACE INTO ck_state (k, v, updated) VALUES (?, ?, ?)', [k, JSON.stringify(val), Date.now()]);
    }
    res.json({ ok: true });
  }).catch((e) => res.status(500).json({ error: e.message }));
});

const dist = path.join(__dirname, 'dist');
app.use(express.static(dist));
app.get(/^(?!\/api).*/, (_, res) => res.sendFile(path.join(dist, 'index.html')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`CK Chat running on http://localhost:${PORT}`));
