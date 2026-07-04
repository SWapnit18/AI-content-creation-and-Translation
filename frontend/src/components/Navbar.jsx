import React from 'react';
import { Moon, Sun, RefreshCcw, LayoutDashboard, Home, LogOut, User } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ currentView, setCurrentView, onOpenAuth }) {
  const { theme, toggleTheme } = useTheme();
  const { user, logout, isAuthenticated } = useAuth();

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
    <nav className="glass-nav" style={{ padding: '1.25rem 3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
      {/* Brand logo */}
      <div 
        onClick={() => setCurrentView('home')}
        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-heading)', cursor: 'pointer' }}
      >
        <RefreshCcw size={26} style={{ color: 'var(--primary)' }} strokeWidth={2.5} />
        <span style={{ color: 'var(--text-heading)' }}>WordFlow <span style={{ color: 'var(--primary)' }}>Global</span></span>
      </div>
      
      {/* Navigation links */}
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

      {/* Auth and Theme panel */}
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
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
    </nav>
  );
}
