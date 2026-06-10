# CollabDocs – Collaborative Document Editor

A lightweight Google Docs-inspired collaborative document editor.

## Live Demo
- **Frontend:** https://collabdocs-frontend-ten.vercel.app
- **Backend:** https://collabdocs-backend-e7yz.onrender.com

## Test Accounts
| Username | Password |
|----------|----------|
| harini   | pass123  |
| ajaia    | pass123  |

## Features
- Create, rename, edit, and save documents
- Rich text editing (bold, italic, underline, lists)
- File upload (.txt, .md files)
- Share documents with other users
- Owned vs shared document distinction

## Local Setup

### Backend
```bash
cd backend
npm install
node server.js
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## Tech Stack
- **Frontend:** React
- **Backend:** Node.js, Express
- **Storage:** In-memory
- **Deployment:** Vercel (frontend), Render (backend)