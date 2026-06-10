import React, { useState } from 'react';
import './App.css';

const API = 'https://collabdocs-backend-e7yz.onrender.com';

export default function App() {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [docs, setDocs] = useState([]);
  const [activeDoc, setActiveDoc] = useState(null);
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [users, setUsers] = useState([]);
  const [shareWith, setShareWith] = useState('');
  const [msg, setMsg] = useState('');

  const login = async () => {
    const res = await fetch(`${API}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    if (res.ok) {
      const u = await res.json();
      setUser(u);
      loadDocs(u.id);
      loadUsers();
    } else {
      setMsg('Invalid credentials. Try harini/pass123 or ajaia/pass123');
    }
  };

  const loadDocs = async (uid) => {
    const res = await fetch(`${API}/documents/${uid}`);
    setDocs(await res.json());
  };

  const loadUsers = async () => {
    const res = await fetch(`${API}/users`);
    setUsers(await res.json());
  };

  const newDoc = async () => {
    const res = await fetch(`${API}/documents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Untitled', content: '', owner_id: user.id })
    });
    const doc = await res.json();
    setDocs([...docs, doc]);
    openDoc(doc);
  };

  const openDoc = (doc) => {
    setActiveDoc(doc);
    setTitle(doc.title);
    setContent(doc.content);
  };

  const saveDoc = async () => {
    await fetch(`${API}/documents/${activeDoc.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content })
    });
    setDocs(docs.map(d => d.id === activeDoc.id ? { ...d, title, content } : d));
    setMsg('Saved!');
    setTimeout(() => setMsg(''), 2000);
  };

  const shareDoc = async () => {
    const target = users.find(u => u.username === shareWith);
    if (!target) return setMsg('User not found');
    await fetch(`${API}/share`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ doc_id: activeDoc.id, shared_with_id: target.id })
    });
    setMsg(`Shared with ${shareWith}!`);
    setTimeout(() => setMsg(''), 2000);
  };

  const uploadFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API}/upload/${user.id}`, {
      method: 'POST',
      body: formData
    });
    const doc = await res.json();
    setDocs([...docs, doc]);
    openDoc(doc);
  };

  if (!user) return (
    <div className="login">
      <h1>📝 CollabDocs</h1>
      <p>Test accounts: <b>harini / pass123</b> or <b>ajaia / pass123</b></p>
      <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
      <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
      <button onClick={login}>Login</button>
      {msg && <p className="msg">{msg}</p>}
    </div>
  );

  return (
    <div className="app">
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>📝 CollabDocs</h2>
          <p>👤 {user.username}</p>
          <button onClick={newDoc}>+ New Doc</button>
          <label className="upload-btn">
            📂 Upload File
            <input type="file" accept=".txt,.md" onChange={uploadFile} hidden />
          </label>
        </div>
        <div className="doc-list">
          {docs.map(doc => (
            <div
              key={doc.id}
              className={`doc-item ${activeDoc?.id === doc.id ? 'active' : ''}`}
              onClick={() => openDoc(doc)}
            >
              <span>{doc.title}</span>
              <span className={`badge ${doc.type}`}>{doc.type}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="editor">
        {activeDoc ? (
          <>
            <div className="editor-header">
              <input
                className="title-input"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Document title"
              />
              <button onClick={saveDoc}>💾 Save</button>
            </div>
            <div className="share-row">
              <input
                placeholder="Share with username (e.g. ajaia)"
                value={shareWith}
                onChange={e => setShareWith(e.target.value)}
              />
              <button onClick={shareDoc}>🔗 Share</button>
            </div>
            {msg && <p className="msg">{msg}</p>}
            <textarea
              className="content-editor"
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Start typing your document here..."
            />
          </>
        ) : (
          <div className="empty">
            <h2>Select a document or create a new one</h2>
          </div>
        )}
      </div>
    </div>
  );
}