import React, { useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';

import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Services from './components/Services';
import AIFormCard from './components/AIFormCard';
import QuoteSection from './components/QuoteSection';
import Contact from './components/Contact';
import AuthModal from './components/AuthModal';
import Dashboard from './components/Dashboard';

import { translateText, generateCreativeContent, improveWriting } from './services/api';

import './styles/index.css';

// Language options
const LANGUAGES = [
  'English','Afrikaans','Albanian','Amharic','Arabic','Armenian','Bengali','Bulgarian',
  'Catalan','Chinese (Simplified)','Chinese (Traditional)','Croatian','Czech',
  'Danish','Dutch','Finnish','French','German','Greek','Gujarati',
  'Hebrew','Hindi','Hungarian','Indonesian','Italian','Japanese','Kannada',
  'Korean','Latvian','Lithuanian','Malay','Malayalam','Marathi','Nepali',
  'Norwegian','Persian','Polish','Portuguese','Punjabi','Romanian','Russian',
  'Serbian','Slovak','Spanish','Swahili','Swedish','Tamil','Telugu','Thai',
  'Turkish','Ukrainian','Urdu','Vietnamese','Welsh','Zulu',
];

function SectionWrapper({ alt, id, children }) {
  return (
    <section id={id} style={{ padding: '5rem 1.5rem', backgroundColor: alt ? 'var(--bg-alt)' : 'var(--bg-card)' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>{children}</div>
    </section>
  );
}

function SectionHeader({ title, desc }) {
  return (
    <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
      <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.25rem)', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '0.6rem' }}>{title}</h2>
      <p style={{ color: 'var(--text-body)', maxWidth: 560, margin: '0 auto' }}>{desc}</p>
    </div>
  );
}

function AppContent() {
  const [currentView, setCurrentView] = useState('home');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  const handleTranslate = async (text, language) => {
    try {
      const res = await translateText(text, language || LANGUAGES[0]);
      if (isAuthenticated) {
        toast.success('Translation saved to your dashboard history!');
      }
      return res.result;
    } catch (err) {
      throw new Error(err.message || 'Translation failed');
    }
  };

  const handleCreative = async (text, language) => {
    try {
      const res = await generateCreativeContent(text, language || LANGUAGES[20]);
      if (isAuthenticated) {
        toast.success('Creative copy saved to your dashboard history!');
      }
      return res.result;
    } catch (err) {
      throw new Error(err.message || 'Generation failed');
    }
  };

  const handleImprove = async (text) => {
    try {
      const res = await improveWriting(text);
      if (isAuthenticated) {
        toast.success('Polished output saved to your dashboard history!');
      }
      return res.result;
    } catch (err) {
      throw new Error(err.message || 'Improvement failed');
    }
  };

  return (
    <>
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        onOpenAuth={() => setAuthModalOpen(true)}
      />

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem', minHeight: 'calc(100vh - 200px)' }}>
        {currentView === 'dashboard' && isAuthenticated ? (
          <Dashboard />
        ) : (
          <>
            <Hero />
            <Services />

            {/* ── Translation ── */}
            <SectionWrapper alt id="translation">
              <SectionHeader
                title="Quick AI-Powered Translation"
                desc="Paste your text, choose a target language, and see high-quality translation instantly."
              />
              <AIFormCard
                id="translation"
                title=""
                description=""
                placeholder="Enter text to translate…"
                submitLabel="Translate"
                extraField={{ label: 'Target Language', options: LANGUAGES }}
                onSubmit={handleTranslate}
              />
            </SectionWrapper>

            {/* ── Creative Writing ── */}
            <SectionWrapper id="creative">
              <SectionHeader
                title="AI Creative Content Generator"
                desc="Describe your idea and let AI craft a compelling, imaginative piece in the language of your choice."
              />
              <AIFormCard
                id="creative"
                title=""
                description=""
                placeholder="Describe your creative idea (e.g. 'A short story about a time traveler in modern Rome')…"
                submitLabel="Generate Content"
                extraField={{ label: 'Output Language', options: LANGUAGES }}
                onSubmit={handleCreative}
              />
            </SectionWrapper>

            {/* ── Improve Writing ── */}
            <SectionWrapper alt id="improve">
              <SectionHeader
                title="Improve Your Writing"
                desc="Paste any text and get an AI-polished version with better clarity, grammar, and style."
              />
              <AIFormCard
                id="improve"
                title=""
                description=""
                placeholder="Paste your text here to improve it…"
                submitLabel="Improve Writing"
                onSubmit={handleImprove}
              />
            </SectionWrapper>

            <div id="quote">
              <QuoteSection />
            </div>
            
            <Contact />
          </>
        )}
      </main>

      <footer style={{ backgroundColor: 'var(--bg-card)', borderTop: `1px solid var(--border)`, padding: '2rem 1.5rem', textAlign: 'center', marginTop: '4rem' }}>
        <p style={{ color: 'var(--text-body)', fontSize: '0.9rem' }}>
          © {new Date().getFullYear()} WordFlow Global. All rights reserved.
        </p>
      </footer>

      {/* Glass Auth Modal overlay */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'var(--bg-alt)',
              color: 'var(--text-heading)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
            },
          }}
        />
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
