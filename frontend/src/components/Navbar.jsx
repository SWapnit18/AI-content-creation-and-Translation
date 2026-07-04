import React, { useState, useEffect } from 'react';
import { Moon, Sun, RefreshCcw, LayoutDashboard, Home, LogOut, User, Menu, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ currentView, setCurrentView, onOpenAuth }) {
  const { theme, toggleTheme } = useTheme();
  const { user, logout, isAuthenticated } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Close mobile menu on screen resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleNavClick = (sectionId) => {
    setCurrentView('home');
    // Allow React state update before scrolling
    setTimeout(() => {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <nav className="glass-nav nav-container" style={{ position: 'relative' }}>
      {/* Brand logo */}
      <div 
        onClick={() => { setCurrentView('home'); setIsMenuOpen(false); }}
        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-heading)', cursor: 'pointer' }}
      >
        <RefreshCcw size={26} style={{ color: 'var(--primary)' }} strokeWidth={2.5} />
        <span style={{ color: 'var(--text-heading)' }}>WordFlow <span style={{ color: 'var(--primary)' }}>Global</span></span>
      </div>
      
      {/* Desktop Navigation links */}
      <div className="nav-links" style={{ display: 'flex', gap: '2.5rem', alignItems: 'center', fontWeight: '500', color: 'var(--text-heading)' }}>
        {currentView === 'home' ? (
          <>
            <a href="#translation" onClick={(e) => { e.preventDefault(); handleNavClick('translation'); }} className="nav-link" style={{ color: 'var(--text-heading)', fontSize: '1.05rem' }}>Translate</a>
            <a href="#creative" onClick={(e) => { e.preventDefault(); handleNavClick('creative'); }} className="nav-link" style={{ color: 'var(--text-heading)', fontSize: '1.05rem' }}>Creative</a>
            <a href="#improve" onClick={(e) => { e.preventDefault(); handleNavClick('improve'); }} className="nav-link" style={{ color: 'var(--text-heading)', fontSize: '1.05rem' }}>Refine</a>
            <a href="#quote" onClick={(e) => { e.preventDefault(); handleNavClick('quote'); }} className="nav-link" style={{ color: 'var(--text-heading)', fontSize: '1.05rem' }}>Analyze</a>
          </>
        ) : (
          <button 
            onClick={() => setCurrentView('home')} 
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'var(--text-heading)', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.4rem', 
              fontSize: '1.05rem', 
              fontWeight: 500,
              cursor: 'pointer'
            }}
            className="nav-link"
          >
            <Home size={18} style={{ color: 'var(--primary)' }} />
            Home / Tools
          </button>
        )}

        {/* Dashboard Link (Only visible if authenticated) */}
        {isAuthenticated && (
          <button 
            onClick={() => setCurrentView(currentView === 'dashboard' ? 'home' : 'dashboard')} 
            style={{ 
              background: 'none', 
              border: 'none', 
              color: currentView === 'dashboard' ? 'var(--primary)' : 'var(--text-heading)', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.4rem', 
              fontSize: '1.05rem', 
              fontWeight: 500,
              cursor: 'pointer'
            }}
            className="nav-link"
          >
            <LayoutDashboard size={18} />
            Dashboard
          </button>
        )}
      </div>

      {/* Desktop Auth and Theme panel */}
      <div className="nav-right-actions" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <button 
          onClick={toggleTheme} 
          style={{ 
            background: 'var(--bg-alt)', 
            border: '1px solid var(--border)', 
            color: 'var(--text-heading)', 
            padding: '10px 12px', 
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {isAuthenticated ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '4px 8px 4px 12px', background: 'var(--bg-alt)', border: '1px solid var(--border)', borderRadius: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <User size={16} style={{ color: 'var(--primary)' }} />
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-heading)' }}>{user.name}</span>
            </div>
            <button
              onClick={logout}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-body)',
                padding: '6px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-body)'}
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="btn-primary"
            style={{
              padding: '10px 20px',
              borderRadius: '10px',
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Sign In
          </button>
        )}
      </div>

      {/* Hamburger / Mobile menu toggle button */}
      <button 
        className="mobile-menu-toggle"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        style={{
          display: 'none', // Overridden by CSS media query in index.css
          background: 'none',
          border: 'none',
          color: 'var(--text-heading)',
          cursor: 'pointer',
          padding: '8px',
          borderRadius: '8px',
        }}
      >
        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile drop-down overlay menu container */}
      {isMenuOpen && (
        <div 
          className="mobile-menu-dropdown"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 999,
          }}
        >
          {currentView === 'home' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <a href="#translation" onClick={(e) => { e.preventDefault(); handleNavClick('translation'); setIsMenuOpen(false); }} className="nav-link" style={{ color: 'var(--text-heading)', fontSize: '1.05rem', padding: '8px 0', display: 'block' }}>Translate</a>
              <a href="#creative" onClick={(e) => { e.preventDefault(); handleNavClick('creative'); }} className="nav-link" style={{ color: 'var(--text-heading)', fontSize: '1.05rem', padding: '8px 0', display: 'block' }}>Creative</a>
              <a href="#improve" onClick={(e) => { e.preventDefault(); handleNavClick('improve'); }} className="nav-link" style={{ color: 'var(--text-heading)', fontSize: '1.05rem', padding: '8px 0', display: 'block' }}>Refine</a>
              <a href="#quote" onClick={(e) => { e.preventDefault(); handleNavClick('quote'); }} className="nav-link" style={{ color: 'var(--text-heading)', fontSize: '1.05rem', padding: '8px 0', display: 'block' }}>Analyze</a>
            </div>
          ) : (
            <button 
              onClick={() => { setCurrentView('home'); setIsMenuOpen(false); }} 
              style={{ 
                background: 'none', 
                border: 'none', 
                color: 'var(--text-heading)', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem', 
                fontSize: '1.05rem', 
                fontWeight: 500,
                cursor: 'pointer',
                padding: '8px 0',
                width: '100%',
                textAlign: 'left'
              }}
              className="nav-link"
            >
              <Home size={18} style={{ color: 'var(--primary)' }} />
              Home / Tools
            </button>
          )}

          {isAuthenticated && (
            <button 
              onClick={() => { setCurrentView(currentView === 'dashboard' ? 'home' : 'dashboard'); setIsMenuOpen(false); }} 
              style={{ 
                background: 'none', 
                border: 'none', 
                color: currentView === 'dashboard' ? 'var(--primary)' : 'var(--text-heading)', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem', 
                fontSize: '1.05rem', 
                fontWeight: 500,
                cursor: 'pointer',
                padding: '8px 0',
                width: '100%',
                textAlign: 'left'
              }}
              className="nav-link"
            >
              <LayoutDashboard size={18} style={{ marginRight: '0.2rem' }} />
              Dashboard
            </button>
          )}

          <div style={{ height: '1px', backgroundColor: 'var(--border)', margin: '8px 0' }} />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0' }}>
            <span style={{ fontSize: '1.05rem', color: 'var(--text-body)' }}>Theme Mode</span>
            <button 
              onClick={toggleTheme} 
              style={{ 
                background: 'var(--bg-alt)', 
                border: '1px solid var(--border)', 
                color: 'var(--text-heading)', 
                padding: '8px 12px', 
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>

          <div style={{ marginTop: '0.75rem' }}>
            {isAuthenticated ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <User size={16} style={{ color: 'var(--primary)' }} />
                  <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-heading)' }}>{user.name}</span>
                </div>
                <button
                  onClick={() => { logout(); setIsMenuOpen(false); }}
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: 'none',
                    color: '#ef4444',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => { onOpenAuth(); setIsMenuOpen(false); }}
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'center'
                }}
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
