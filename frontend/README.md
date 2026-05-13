# AI Content Creation Platform - Frontend

A modern, responsive web application for AI-powered content creation, built with React and Vite. This frontend interfaces with a Node.js backend to provide translation, creative writing, text improvement, and project quoting services using Google's Gemini AI.

## 🚀 Features

- **Translation Service**: Translate text into multiple languages with professional accuracy
- **Creative Writing**: Generate long-form creative content based on user prompts
- **Text Improvement**: Enhance writing for clarity, grammar, and professionalism
- **Project Quoting**: Get instant quotes for translation projects with word count analysis
- **Content History**: View past generations and track usage
- **Responsive Design**: Optimized for desktop and mobile devices
- **Real-time Feedback**: Toast notifications and loading states
- **Rate Limiting**: Built-in protection against abuse

## 🛠 Tech Stack

### Frontend
- **React 19** - Modern React with hooks and concurrent features
- **Vite** - Fast build tool and development server
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **React Hot Toast** - User notifications
- **Lucide React** - Beautiful icons
- **CSS Modules** - Scoped styling

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Google Gemini AI** - AI content generation
- **MongoDB** - Data persistence (optional)
- **Express Rate Limit** - API protection
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend server running (see backend README)

## 🚀 Getting Started

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd ai-content-creation/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Linting

```bash
npm run lint
```

## 📁 Project Structure

```
frontend/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── AIFormCard.jsx    # Main AI service forms
│   │   ├── Contact.jsx       # Contact form
│   │   ├── Hero.jsx          # Landing section
│   │   ├── Navbar.jsx        # Navigation
│   │   ├── QuoteSection.jsx  # Pricing info
│   │   └── Services.jsx      # Service overview
│   ├── context/         # React context providers
│   │   └── ThemeContext.jsx  # Theme management
│   ├── services/        # API integration
│   │   └── api.js       # Axios configuration
│   ├── styles/          # Global styles
│   │   └── index.css    # Main stylesheet
│   ├── App.jsx          # Main app component
│   └── main.jsx         # App entry point
├── package.json
├── vite.config.js       # Vite configuration
└── eslint.config.js     # ESLint configuration
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the backend directory (not frontend) with:

```env
GEMINI_API_KEY=your_google_gemini_api_key
MONGO_URI=your_mongodb_connection_string
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

### API Endpoints

The frontend communicates with the backend at `http://localhost:5000/api`:

- `POST /api/ai/translate` - Text translation
- `POST /api/ai/creative` - Creative content generation
- `POST /api/ai/improve` - Text improvement
- `POST /api/ai/quote` - Project quoting
- `GET /api/ai/history` - Content generation history
- `POST /api/contact` - Contact form submission
- `GET /api/health` - Health check

## 🎨 Styling

The application uses custom CSS with:
- CSS custom properties for theming
- Responsive design with mobile-first approach
- Smooth animations and transitions
- Accessible color contrasts

## 🚀 Deployment

### Frontend (Static Hosting)

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy to hosting service**
   - Netlify
   - Vercel
   - GitHub Pages
   - AWS S3 + CloudFront

3. **Configure environment**
   Update API base URL to production backend URL

### Backend Deployment

Deploy the backend to:
- Heroku
- Railway
- Vercel (serverless)
- AWS EC2
- DigitalOcean App Platform

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License - see the LICENSE file for details.

## 📞 Support

For support, email support@aicontentcreation.com or create an issue in the repository.

## 🙏 Acknowledgments

- Google Gemini AI for content generation
- React and Vite communities
- Open source contributors
