const express = require('express');
const cors = require('cors');
const multer = require('multer');
const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

// File upload setup
const upload = multer({ dest: 'uploads/' });
if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');

// Database setup
const db = new sqlite3.Database('docs.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE,
    password TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS documents (
    id TEXT PRIMARY KEY,
    title TEXT,
    content TEXT,
    owner_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS shares (
    id TEXT PRIMARY KEY,
    doc_id TEXT,
    shared_with_id TEXT
  )`);

  // Seed 2 test users
  const u1 = uuidv4(), u2 = uuidv4();
  db.run(`INSERT OR IGNORE INTO users (id, username, password) VALUES (?, 'harini', 'pass123')`, [u1]);
  db.run(`INSERT OR IGNORE INTO users (id, username, password) VALUES (?, 'ajaia', 'pass123')`, [u2]);
});

// ── AUTH ──────────────────────────────────────────────
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.get(`SELECT * FROM users WHERE username=? AND password=?`, [username, password], (err, user) => {
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    res.json({ id: user.id, username: user.username });
  });
});

app.get('/users', (req, res) => {
  db.all(`SELECT id, username FROM users`, [], (err, rows) => res.json(rows));
});

// ── DOCUMENTS ─────────────────────────────────────────
app.get('/documents/:userId', (req, res) => {
  const { userId } = req.params;
  db.all(`
    SELECT d.*, 'owned' as type FROM documents d WHERE d.owner_id = ?
    UNION
    SELECT d.*, 'shared' as type FROM documents d
    JOIN shares s ON s.doc_id = d.id WHERE s.shared_with_id = ?
  `, [userId, userId], (err, rows) => res.json(rows));
});

app.post('/documents', (req, res) => {
  const { title, content, owner_id } = req.body;
  const id = uuidv4();
  db.run(`INSERT INTO documents (id, title, content, owner_id) VALUES (?, ?, ?, ?)`,
    [id, title || 'Untitled', content || '', owner_id],
    () => res.json({ id, title, content, owner_id, type: 'owned' }));
});

app.put('/documents/:id', (req, res) => {
  const { title, content } = req.body;
  db.run(`UPDATE documents SET title=?, content=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`,
    [title, content, req.params.id],
    () => res.json({ success: true }));
});

app.delete('/documents/:id', (req, res) => {
  db.run(`DELETE FROM documents WHERE id=?`, [req.params.id],
    () => res.json({ success: true }));
});

// ── SHARING ───────────────────────────────────────────
app.post('/share', (req, res) => {
  const { doc_id, shared_with_id } = req.body;
  const id = uuidv4();
  db.run(`INSERT OR IGNORE INTO shares (id, doc_id, shared_with_id) VALUES (?, ?, ?)`,
    [id, doc_id, shared_with_id],
    () => res.json({ success: true }));
});

// ── FILE UPLOAD ───────────────────────────────────────
app.post('/upload/:userId', upload.single('file'), (req, res) => {
  const content = fs.readFileSync(req.file.path, 'utf8');
  const id = uuidv4();
  const title = req.file.originalname.replace(/\.[^/.]+$/, '');
  db.run(`INSERT INTO documents (id, title, content, owner_id) VALUES (?, ?, ?, ?)`,
    [id, title, content, req.params.userId],
    () => {
      fs.unlinkSync(req.file.path);
      res.json({ id, title, content, type: 'owned' });
    });
});

app.listen(5000, () => console.log('Server running on http://localhost:5000'));