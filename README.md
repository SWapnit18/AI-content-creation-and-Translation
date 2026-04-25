# AI Creative Content & Translation System

A full-stack web application for AI-powered translation, creative content generation, and writing improvement — built with **React**, **Node.js**, **Express.js**, and **MongoDB**.

---

## 🏗️ Architecture

```
ai-creative-content/
├── backend/                  # Node.js + Express API
│   ├── config/
│   │   └── db.js             # MongoDB connection
│   ├── middleware/
│   │   └── rateLimiter.js    # Rate limiting
│   ├── models/
│   │   ├── ContentGeneration.js  # AI output storage
│   │   └── Contact.js            # Contact form submissions
│   ├── routes/
│   │   ├── aiRoutes.js       # /api/ai/* endpoints
│   │   └── contactRoutes.js  # /api/contact endpoint
│   ├── server.js             # Express entry point
│   ├── .env.example
│   └── package.json
│
└── frontend/                 # React SPA
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── Hero.jsx
    │   │   ├── Services.jsx
    │   │   ├── AIFormCard.jsx    # Reusable AI form widget
    │   │   ├── QuoteSection.jsx  # Project cost estimator
    │   │   └── Contact.jsx
    │   ├── context/
    │   │   └── ThemeContext.jsx  # Dark/light mode
    │   ├── hooks/
    │   │   └── useAI.js          # Reusable AI hook
    │   ├── services/
    │   │   └── api.js            # Axios API layer
    │   ├── styles/
    │   │   └── index.css
    │   ├── App.jsx
    │   └── index.jsx
    └── package.json
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- Anthropic API key → [console.anthropic.com](https://console.anthropic.com)

### 1. Backend Setup

```bash
cd backend
cp .env.example .env
# Fill in MONGO_URI and ANTHROPIC_API_KEY in .env
npm install
npm run dev          # starts on http://localhost:5000
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm start            # starts on http://localhost:3000
```

The React app proxies `/api/*` requests to `localhost:5000` automatically.

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/translate` | Translate text to any language |
| POST | `/api/ai/creative` | Generate creative content |
| POST | `/api/ai/improve` | Improve writing quality |
| POST | `/api/ai/quote` | Analyze project & estimate cost |
| GET | `/api/ai/history` | Retrieve past generations |
| POST | `/api/contact` | Submit contact form |
| GET | `/api/contact` | List contact submissions (admin) |
| GET | `/api/health` | Server health check |

### Example request — Translation
```bash
curl -X POST http://localhost:5000/api/ai/translate \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello, world!", "targetLanguage": "French"}'
```

---

## 🗄️ MongoDB Collections

### `contentgenerations`
Stores every AI-generated output with type (`translation`, `creative`, `improve`, `quote`), input text, output, metadata, IP, and processing time.

### `contacts`
Stores contact form submissions with name, email, subject, message, and status (`new` → `read` → `replied` → `archived`).

---

## 🔒 Security Features
- **Helmet** — HTTP security headers
- **CORS** — restricted to frontend origin
- **Rate limiting** — 10 AI req/min per IP, 5 contact submissions/hour
- **Input validation** — express-validator on all endpoints
- **API keys server-side only** — never exposed to the browser

---

## 🌐 Deployment

### Backend (Railway / Render / Fly.io)
Set environment variables: `MONGO_URI`, `ANTHROPIC_API_KEY`, `CLIENT_URL`, `NODE_ENV=production`

### Frontend (Vercel / Netlify)
Set `REACT_APP_API_URL` to your deployed backend URL and update the `proxy` in `package.json`.
