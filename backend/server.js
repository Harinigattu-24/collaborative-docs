const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

let users = [
  { id: '1', username: 'harini', password: 'pass123' },
  { id: '2', username: 'ajaia', password: 'pass123' }
];
let documents = [];
let shares = [];

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  res.json({ id: user.id, username: user.username });
});

app.get('/users', (req, res) => {
  res.json(users.map(u => ({ id: u.id, username: u.username })));
});

app.get('/documents/:userId', (req, res) => {
  const { userId } = req.params;
  const owned = documents.filter(d => d.owner_id === userId).map(d => ({ ...d, type: 'owned' }));
  const sharedIds = shares.filter(s => s.shared_with_id === userId).map(s => s.doc_id);
  const shared = documents.filter(d => sharedIds.includes(d.id)).map(d => ({ ...d, type: 'shared' }));
  res.json([...owned, ...shared]);
});

app.post('/documents', (req, res) => {
  const { title, content, owner_id } = req.body;
  const doc = { id: uuidv4(), title: title || 'Untitled', content: content || '', owner_id };
  documents.push(doc);
  res.json({ ...doc, type: 'owned' });
});

app.put('/documents/:id', (req, res) => {
  const { title, content } = req.body;
  const doc = documents.find(d => d.id === req.params.id);
  if (doc) { doc.title = title; doc.content = content; }
  res.json({ success: true });
});

app.delete('/documents/:id', (req, res) => {
  documents = documents.filter(d => d.id !== req.params.id);
  res.json({ success: true });
});

app.post('/share', (req, res) => {
  const { doc_id, shared_with_id } = req.body;
  shares.push({ id: uuidv4(), doc_id, shared_with_id });
  res.json({ success: true });
});

app.post('/upload/:userId', upload.single('file'), (req, res) => {
  const content = req.file.buffer.toString('utf8');
  const title = req.file.originalname.replace(/\.[^/.]+$/, '');
  const doc = { id: uuidv4(), title, content, owner_id: req.params.userId };
  documents.push(doc);
  res.json({ ...doc, type: 'owned' });
});

app.listen(5000, () => console.log('Server running on http://localhost:5000'));