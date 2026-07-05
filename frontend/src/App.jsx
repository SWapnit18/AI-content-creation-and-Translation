import React, { useState, useEffect } from 'react';
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

import { translateText, generateCreativeContent, improveWriting, resetPassword, verifyEmail, getMe } from './services/api';
import { Lock, RefreshCcw, Eye, EyeOff } from 'lucide-react';

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
  const [resetToken, setResetToken] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  
  const { isAuthenticated, loginWithToken, refreshUser } = useAuth();

  useEffect(() => {
    const handleQueryParams = async () => {
      const params = new URLSearchParams(window.location.search);
      const resetTokenParam = params.get('resetToken');
      const verifyTokenParam = params.get('verifyToken');
      const googleTokenParam = params.get('googleToken');

      let cleanUrlNeeded = false;

      if (resetTokenParam) {
        setResetToken(resetTokenParam);
        cleanUrlNeeded = true;
      }

      if (verifyTokenParam) {
        cleanUrlNeeded = true;
        try {
          const res = await verifyEmail(verifyTokenParam);
          if (res.success) {
            toast.success('Email verified successfully! Welcome to WordFlow Global.');
            await refreshUser();
          }
        } catch (err) {
          toast.error(err.message || 'Email verification failed. The link might be invalid or expired.');
        }
      }

      if (googleTokenParam) {
        cleanUrlNeeded = true;
        localStorage.setItem('token', googleTokenParam);
        try {
          const res = await getMe();
          if (res.success) {
            loginWithToken(googleTokenParam, res.user);
          }
        } catch (err) {
          localStorage.removeItem('token');
          toast.error('Google login failed: ' + err.message);
        }
      }

      if (cleanUrlNeeded) {
        const newUrl = window.location.pathname + window.location.hash;
        window.history.replaceState({}, document.title, newUrl);
      }
    };

    handleQueryParams();
  }, []);

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

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      return;
    }
    setResetLoading(true);

    try {
      const res = await resetPassword(resetToken, newPassword);
      if (res.success) {
        toast.success('Password reset successfully!');
        loginWithToken(res.token, res.user);
        setResetToken(null);
        setNewPassword('');
      }
    } catch (err) {
      toast.error(err.message || 'Reset password failed. Link might be expired.');
    } finally {
      setResetLoading(false);
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

      {/* Glass Reset Password Modal overlay */}
      {resetToken && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(5, 8, 16, 0.75)',
            backdropFilter: 'blur(8px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 440,
              background: 'var(--bg-alt)',
              border: '1px solid var(--border)',
              borderRadius: 16,
              boxShadow: 'var(--shadow)',
              padding: '2.25rem',
              position: 'relative',
              animation: 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {/* Logo and title */}
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-heading)', marginBottom: '0.5rem' }}>
                <RefreshCcw size={22} style={{ color: 'var(--primary)' }} strokeWidth={2.5} />
                <span>WordFlow <span style={{ color: 'var(--primary)' }}>Global</span></span>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-body)' }}>
                Create a strong new password for your account
              </p>
            </div>

            {/* Reset Password Form */}
            <form onSubmit={handleResetSubmit}>
              <div className="auth-input-group">
                <Lock size={18} className="auth-icon" />
                <input
                  type={showResetPassword ? 'text' : 'password'}
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  className="auth-input"
                  style={{ paddingRight: '42px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowResetPassword(!showResetPassword)}
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-body)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {showResetPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <button
                type="submit"
                disabled={resetLoading}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: 8,
                  border: 'none',
                  background: 'var(--primary)',
                  color: '#fff',
                  fontWeight: 600,
                  cursor: resetLoading ? 'not-allowed' : 'pointer',
                  opacity: resetLoading ? 0.8 : 1,
                  marginTop: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)',
                }}
              >
                {resetLoading && <span className="spinner" style={{ border: '2px solid #fff', borderTop: '2px solid transparent', borderRadius: '50%', width: 14, height: 14, display: 'inline-block', animation: 'spin 1s linear infinite' }} />}
                {resetLoading ? 'Resetting...' : 'Reset Password'}
              </button>

              <button
                type="button"
                onClick={() => setResetToken(null)}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                  background: 'transparent',
                  color: 'var(--text-body)',
                  fontWeight: 500,
                  cursor: 'pointer',
                  marginTop: '0.75rem',
                }}
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
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
