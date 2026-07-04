import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User, RefreshCcw, Key, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { forgotPassword } from '../services/api';
import toast from 'react-hot-toast';

export default function AuthModal({ isOpen, onClose }) {
  const [mode, setMode] = useState('login'); // 'login', 'signup', 'forgot'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  
  // New States: Remember Me, Show Password, Google OAuth help modal
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showGoogleHelp, setShowGoogleHelp] = useState(false);

  const { login, signup } = useAuth();

  // Reset states when modal is opened, closed, or switched mode
  useEffect(() => {
    setError('');
    setIsShaking(false);
    setShowPassword(false);
  }, [mode, isOpen]);

  if (!isOpen) return null;

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  // Password strength checker logic
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: '', color: 'transparent', percent: '0%' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 2) return { score, label: 'Weak ⚠️', color: '#ef4444', percent: '33%' };
    if (score <= 4) return { score, label: 'Medium ⚡', color: '#f59e0b', percent: '66%' };
    return { score, label: 'Strong 💪', color: '#10b981', percent: '100%' };
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || (mode !== 'forgot' && !password) || (mode === 'signup' && !name)) return;
    setLoading(true);
    setError('');

    try {
      if (mode === 'login') {
        const success = await login(email, password, rememberMe);
        if (success) {
          setEmail('');
          setPassword('');
          setName('');
          onClose();
        }
      } else if (mode === 'signup') {
        const success = await signup(name, email, password, rememberMe);
        if (success) {
          setEmail('');
          setPassword('');
          setName('');
          onClose();
        }
      } else if (mode === 'forgot') {
        const res = await forgotPassword(email);
        toast.success(res.message || 'Password reset link sent to your email!');
        
        // If testing locally/dev and token is returned in response, display it clearly for the developer
        if (res.resetUrl) {
          console.log('Reset URL:', res.resetUrl);
          toast.success(`Reset link logged to console! Click 'Proceed' or copy from console to reset.`, { duration: 6000 });
        }
        setMode('login');
      }
    } catch (err) {
      setError(err.message || 'Authentication action failed.');
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
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
        onClick={onClose}
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
            animation: isShaking 
              ? 'shake 0.4s ease-in-out' 
              : 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Style tag for CSS animations */}
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes slideIn {
              from { transform: translateY(20px); opacity: 0; }
              to { transform: translateY(0); opacity: 1; }
            }
            @keyframes shake {
              0%, 100% { transform: translateX(0); }
              15%, 45%, 75% { transform: translateX(-6px); }
              30%, 60%, 90% { transform: translateX(6px); }
            }
            .auth-tab {
              flex: 1;
              padding: 0.9rem;
              text-align: center;
              font-weight: 600;
              font-size: 1.05rem;
              border-bottom: 2px solid transparent;
              cursor: pointer;
              color: var(--text-body);
              transition: all 0.2s;
            }
            .auth-tab.active {
              color: var(--primary);
              border-bottom-color: var(--primary);
            }
            .auth-tab:hover {
              color: var(--text-heading);
            }
            .auth-input-group {
              position: relative;
              margin-bottom: 1.35rem;
            }
            .auth-icon {
              position: absolute;
              left: 14px;
              top: 50%;
              transform: translateY(-50%);
              color: var(--text-body);
              pointer-events: none;
            }
            .auth-input {
              width: 100%;
              padding: 14px 16px 14px 44px !important;
              margin-bottom: 0 !important;
              font-size: 1rem !important;
              border-radius: 12px !important;
            }
          `}} />

          {/* Close Button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              background: 'none',
              border: 'none',
              color: 'var(--text-body)',
              cursor: 'pointer',
              padding: 4,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <X size={20} />
          </button>

          {/* Logo and title */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-heading)', marginBottom: '0.6rem' }}>
              <RefreshCcw size={26} style={{ color: 'var(--primary)' }} strokeWidth={2.5} />
              <span>WordFlow <span style={{ color: 'var(--primary)' }}>Global</span></span>
            </div>
            <p style={{ fontSize: '1rem', color: 'var(--text-body)', lineHeight: 1.5 }}>
              {mode === 'login' && 'Sign in to access your dashboard & history'}
              {mode === 'signup' && 'Create an account to start saving content'}
              {mode === 'forgot' && 'Reset your password to regain access'}
            </p>
          </div>

          {/* Switcher Tabs */}
          {mode !== 'forgot' && (
            <div style={{ display: 'flex', marginBottom: '1.75rem', borderBottom: '1px solid var(--border)' }}>
              <div
                className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
                onClick={() => setMode('login')}
              >
                Sign In
              </div>
              <div
                className={`auth-tab ${mode === 'signup' ? 'active' : ''}`}
                onClick={() => setMode('signup')}
              >
                Create Account
              </div>
            </div>
          )}

          {/* Auth Form */}
          <form onSubmit={handleSubmit}>
            {mode === 'signup' && (
              <div className="auth-input-group">
                <User size={18} className="auth-icon" />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="auth-input"
                />
              </div>
            )}

            <div className="auth-input-group">
              <Mail size={18} className="auth-icon" />
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="auth-input"
              />
            </div>

            {mode !== 'forgot' && (
              <>
                <div className="auth-input-group">
                  <Lock size={18} className="auth-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="auth-input"
                    style={{ paddingRight: '42px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
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
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {/* Password Strength Checker for Signup */}
                {mode === 'signup' && password && (
                  <div style={{ marginBottom: '1.25rem', marginTop: '-0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-body)' }}>Password Strength:</span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: strength.color }}>{strength.label}</span>
                    </div>
                    <div style={{ width: '100%', height: 5, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 2.5, overflow: 'hidden' }}>
                      <div style={{ width: strength.percent, height: '100%', backgroundColor: strength.color, transition: 'all 0.3s' }} />
                    </div>
                  </div>
                )}

                {mode === 'login' && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', marginTop: '-0.25rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.95rem', color: 'var(--text-body)', userSelect: 'none' }}>
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        style={{ cursor: 'pointer', width: '16px', height: '16px', margin: 0 }}
                      />
                      Remember Me
                    </label>
                    <span
                      style={{
                        fontSize: '0.95rem',
                        color: 'var(--primary)',
                        cursor: 'pointer',
                        fontWeight: 600,
                      }}
                      onClick={() => setMode('forgot')}
                    >
                      Forgot Password?
                    </span>
                  </div>
                )}
              </>
            )}

            {error && (
              <div style={{
                color: '#ef4444',
                fontSize: '0.95rem',
                fontWeight: 600,
                textAlign: 'center',
                marginBottom: '1.25rem',
                marginTop: '0.5rem'
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: 12,
                border: 'none',
                background: 'var(--primary)',
                color: '#fff',
                fontWeight: 600,
                fontSize: '1.05rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.8 : 1,
                marginTop: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)',
              }}
            >
              {loading && <span className="spinner" style={{ border: '2px solid #fff', borderTop: '2px solid transparent', borderRadius: '50%', width: 14, height: 14, display: 'inline-block', animation: 'spin 1s linear infinite' }} />}
              {loading ? 'Processing...' : mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'}
            </button>
          </form>

          {/* Google Sign-In UI Button */}
          {mode !== 'forgot' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', margin: '1.5rem 0', gap: '10px' }}>
                <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border)' }} />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-body)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Or continue with</span>
                <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border)' }} />
              </div>

              <button
                type="button"
                onClick={() => setShowGoogleHelp(true)}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: 12,
                  border: '1px solid var(--border)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  color: 'var(--text-heading)',
                  fontWeight: 600,
                  fontSize: '1rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)'}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                </svg>
                Google Account
              </button>
            </>
          )}

          {/* Small text to switch */}
          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.95rem', color: 'var(--text-body)' }}>
            {mode === 'login' && (
              <>
                Don't have an account?{' '}
                <span
                  style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}
                  onClick={() => setMode('signup')}
                >
                  Sign Up
                </span>
              </>
            )}
            {mode === 'signup' && (
              <>
                Already have an account?{' '}
                <span
                  style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}
                  onClick={() => setMode('login')}
                >
                  Sign In
                </span>
              </>
            )}
            {mode === 'forgot' && (
              <span
                style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}
                onClick={() => setMode('login')}
              >
                Back to Sign In
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Google Setup Guidance Overlay */}
      {showGoogleHelp && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(5, 8, 16, 0.8)',
            backdropFilter: 'blur(10px)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
          onClick={() => setShowGoogleHelp(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 400,
              background: 'var(--bg-alt)',
              border: '1px solid var(--border)',
              borderRadius: 16,
              boxShadow: 'var(--shadow)',
              padding: '2rem',
              textAlign: 'center',
              position: 'relative',
              animation: 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 48, height: 48, borderRadius: '50%', backgroundColor: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', marginBottom: '1.25rem' }}>
              <Key size={24} />
            </div>
            <h3 style={{ color: 'var(--text-heading)', marginBottom: '0.75rem', fontWeight: 700 }}>Google OAuth Setup</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-body)', lineHeight: 1.5, marginBottom: '1.5rem', textAlign: 'left' }}>
              To enable single sign-on via Google, configure the OAuth credentials on your environment:
              <br /><br />
              1. Open the <strong>Google Cloud Console</strong>.
              <br />
              2. Register a new OAuth 2.0 Web Client credentials.
              <br />
              3. Set the authorized redirect URI to: <br /><code style={{ display: 'block', padding: '6px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px', margin: '4px 0', fontSize: '0.8rem', wordBreak: 'break-all' }}>https://ai-content-creation-and-translation.vercel.app/api/auth/google/callback</code>
              4. Define <code>GOOGLE_CLIENT_ID</code> in your backend environment configuration.
            </p>
            <button
              onClick={() => setShowGoogleHelp(false)}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: 8,
                border: 'none',
                background: 'var(--primary)',
                color: '#fff',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
