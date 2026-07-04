import React, { useState } from 'react';
import { X, Mail, Lock, User, RefreshCcw, Key } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { forgotPassword } from '../services/api';
import toast from 'react-hot-toast';

export default function AuthModal({ isOpen, onClose }) {
  const [mode, setMode] = useState('login'); // 'login', 'signup', 'forgot'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, signup } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || (mode !== 'forgot' && !password) || (mode === 'signup' && !name)) return;
    setLoading(true);

    try {
      if (mode === 'login') {
        const success = await login(email, password);
        if (success) {
          setEmail('');
          setPassword('');
          setName('');
          onClose();
        }
      } else if (mode === 'signup') {
        const success = await signup(name, email, password);
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
      toast.error(err.message || 'Authentication action failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
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
          animation: 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Style tag for CSS animations */}
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes slideIn {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          .auth-tab {
            flex: 1;
            padding: 0.75rem;
            text-align: center;
            font-weight: 600;
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
            margin-bottom: 1.25rem;
          }
          .auth-icon {
            position: absolute;
            left: 12px;
            top: 50%;
            transform: translateY(-50%);
            color: var(--text-body);
            pointer-events: none;
          }
          .auth-input {
            width: 100%;
            padding: 12px 16px 12px 42px !important;
            margin-bottom: 0 !important;
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
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-heading)', marginBottom: '0.5rem' }}>
            <RefreshCcw size={22} style={{ color: 'var(--primary)' }} strokeWidth={2.5} />
            <span>WordFlow <span style={{ color: 'var(--primary)' }}>Global</span></span>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-body)' }}>
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
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="auth-input"
                />
              </div>

              {mode === 'login' && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.25rem', marginTop: '-0.5rem' }}>
                  <span
                    style={{
                      fontSize: '0.8rem',
                      color: 'var(--primary)',
                      cursor: 'pointer',
                      fontWeight: 500,
                    }}
                    onClick={() => setMode('forgot')}
                  >
                    Forgot Password?
                  </span>
                </div>
              )}
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: 8,
              border: 'none',
              background: 'var(--primary)',
              color: '#fff',
              fontWeight: 600,
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

        {/* Small text to switch */}
        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-body)' }}>
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
              style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              onClick={() => setMode('login')}
            >
              Back to Sign In
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
