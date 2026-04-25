import React from 'react';
import { Moon, Sun, RefreshCcw } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="glass-nav" style={{ padding: '1.25rem 3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-heading)' }}>
        <RefreshCcw size={26} style={{ color: 'var(--primary)' }} strokeWidth={2.5} />
        <span style={{ color: 'var(--text-heading)' }}>WordFlow <span style={{ color: 'var(--primary)' }}>Global</span></span>
      </div>
      
      <div className="nav-links" style={{ display: 'flex', gap: '2.5rem', alignItems: 'center', fontWeight: '500', color: 'var(--text-heading)' }}>
        <a href="#translation" className="nav-link" style={{ color: 'var(--text-heading)', fontSize: '1.05rem', textDecoration: 'none' }}>Translate</a>
        <a href="#creative" className="nav-link" style={{ color: 'var(--text-heading)', fontSize: '1.05rem', textDecoration: 'none' }}>Creative</a>
        <a href="#improve" className="nav-link" style={{ color: 'var(--text-heading)', fontSize: '1.05rem', textDecoration: 'none' }}>Refine</a>
        <a href="#analyze" className="nav-link" style={{ color: 'var(--text-heading)', fontSize: '1.05rem', textDecoration: 'none' }}>Analyze</a>
      </div>

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
      </div>
    </nav>
  );
}
