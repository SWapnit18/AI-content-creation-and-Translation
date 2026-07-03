# AI Content Creation Platform

A full-stack web application for AI-powered content creation, translation, and writing improvement. Built with React, Node.js, Express.js, and MongoDB, featuring Google's Gemini AI for intelligent content generation.

##  Features

- **AI Translation**: Professional text translation across multiple languages
- **Creative Writing**: Generate long-form creative content from prompts
- **Text Enhancement**: Improve writing for clarity and professionalism
- **Project Quoting**: Instant cost estimation for translation projects
- **Content History**: Track and review past AI generations
- **Contact Management**: Handle customer inquiries
- **Rate Limiting**: Built-in API protection
- **Responsive Design**: Mobile-friendly interface
- **Real-time Notifications**: User feedback with toast messages

##  Tech Stack

### Frontend
- **React 19** - Modern UI framework
- **Vite** - Fast development and build tool
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **React Hot Toast** - Notifications
- **Lucide React** - Icon library
- **CSS** - Custom styling with responsive design

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Google Gemini AI** - AI content generation
- **MongoDB** - Database for data persistence
- **Express Rate Limit** - API protection
- **Helmet** - Security middleware
- **CORS** - Cross-origin handling
- **Express Validator** - Input validation

##  Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB (local or MongoDB Atlas)
- Google Gemini API key

## 🚀 Getting Started

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd ai-content-creation
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp .env.example .env  # Configure your environment variables
   npm start
   ```

3. **Frontend Setup** (in a new terminal)
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Access the application**
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:5000`

## 🔧 Configuration

### Environment Variables (Backend)

Create a `.env` file in the `backend` directory:

```env
GEMINI_API_KEY=your_google_gemini_api_key_here
MONGO_URI=mongodb://localhost:27017/ai-content-creation
# or for MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net?????????????/ai-content-creation
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
GEMINI_MODEL=gemini-2.5-flash
GEMINI_MAX_OUTPUT_TOKENS=6144
```

## 📁 Project Structure

```
ai-content-creation/
├── backend/                  # Node.js API server
│   ├── config/
│   │   └── db.js            # MongoDB connection
│   ├── middleware/
│   │   └── rateLimiter.js   # Rate limiting logic
│   ├── models/
│   │   ├── ContentGeneration.js  # AI content schema
│   │   └── Contact.js       # Contact form schema
│   ├── routes/
│   │   ├── aiRoutes.js      # AI service endpoints
│   │   └── contactRoutes.js # Contact endpoints
│   ├── server.js            # Express app entry
│   ├── .env                 # Environment variables
│   └── package.json
│
└── frontend/                 # React SPA
    ├── public/
    │   └── index.html       # HTML template
    ├── src/
    │   ├── components/      # UI components
    │   │   ├── AIFormCard.jsx    # AI service forms
    │   │   ├── Contact.jsx       # Contact form
    │   │   ├── Hero.jsx          # Landing hero
    │   │   ├── Navbar.jsx        # Navigation
    │   │   ├── QuoteSection.jsx  # Pricing section
    │   │   └── Services.jsx      # Services overview
    │   ├── context/
    │   │   └── ThemeContext.jsx  # Theme provider
    │   ├── services/
    │   │   └── api.js            # API client
    │   ├── styles/
    │   │   └── index.css         # Global styles
    │   ├── App.jsx               # Main app
    │   └── main.jsx              # App entry
    ├── package.json
    ├── vite.config.js            # Vite config
    └── eslint.config.js          # ESLint config
```

## 🔌 API Endpoints

### AI Services
- `POST /api/ai/translate` - Translate text
- `POST /api/ai/creative` - Generate creative content
- `POST /api/ai/improve` - Improve text quality
- `POST /api/ai/quote` - Get project quote
- `GET /api/ai/history` - View generation history

### Contact
- `POST /api/contact` - Submit contact form

### Health
- `GET /api/health` - Server status check

### Example API Usage

```bash
# Translation
curl -X POST http://localhost:5000/api/ai/translate \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello world", "targetLanguage": "Spanish"}'

# Creative Writing
curl -X POST http://localhost:5000/api/ai/creative \
  -H "Content-Type: application/json" \
  -d '{"text": "A story about space exploration", "language": "English"}'
```

## 🚀 Deployment

### Frontend
1. Build for production: `npm run build`
2. Deploy to static hosting (Netlify, Vercel, GitHub Pages)
3. Update API base URL to production backend

### Backend
Deploy to cloud platforms:
- **Heroku**: `git push heroku main`
- **Railway**: Connect GitHub repo
- **Vercel**: Use serverless functions
- **AWS/DigitalOcean**: Container deployment

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -m 'Add new feature'`
4. Push branch: `git push origin feature/new-feature`
5. Submit pull request

## 📝 License

ISC License - see LICENSE file for details.

## 📞 Support

For issues or questions:
- Create GitHub issue
- Email: support@aicontentcreation.com

## 🙏 Acknowledgments

- Google Gemini AI team
- React and Node.js communities
- Open source contributors

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
