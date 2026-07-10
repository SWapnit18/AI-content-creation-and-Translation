import React, { useState } from 'react';
import { BarChart3, ExternalLink, RefreshCw, Maximize2 } from 'lucide-react';

const DASHBOARD_URL =
  'https://charts.mongodb.com/charts-ai-content-creation-and-t-zdnodme/dashboards/000813a0-da8e-4c87-95a3-c9ace96c9fab';

export default function MongoChartsEmbed() {
  const [key, setKey] = useState(0); // Used to force-reload iframe
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleRefresh = () => setKey(prev => prev + 1);

  const handleFullscreen = () => setIsFullscreen(prev => !prev);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .charts-section {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 16px;
          overflow: hidden;
          margin-bottom: 2rem;
          transition: box-shadow 0.3s;
        }
        .charts-section:hover {
          box-shadow: var(--shadow);
        }
        .charts-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid var(--border);
          flex-wrap: wrap;
          gap: 0.75rem;
        }
        .charts-header-left {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .charts-icon-badge {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: rgba(16, 185, 129, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #10b981;
          flex-shrink: 0;
        }
        .charts-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--text-heading);
          margin: 0;
        }
        .charts-subtitle {
          font-size: 0.8rem;
          color: var(--text-body);
          margin: 2px 0 0 0;
        }
        .charts-header-actions {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .charts-action-btn {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 8px 14px;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 500;
          cursor: pointer;
          border: 1px solid var(--border);
          background: transparent;
          color: var(--text-body);
          transition: all 0.2s;
          text-decoration: none;
        }
        .charts-action-btn:hover {
          color: var(--text-heading);
          border-color: var(--text-body);
          background: rgba(255,255,255,0.04);
        }
        .charts-action-btn.primary-btn {
          background: rgba(16, 185, 129, 0.12);
          color: #10b981;
          border-color: rgba(16, 185, 129, 0.3);
        }
        .charts-action-btn.primary-btn:hover {
          background: rgba(16, 185, 129, 0.22);
          border-color: #10b981;
        }
        .charts-iframe-wrapper {
          position: relative;
          width: 100%;
          height: 680px;
          background: var(--bg-alt);
        }
        .charts-iframe-wrapper.fullscreen-mode {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          z-index: 9000;
          height: 100vh;
          border-radius: 0;
        }
        .charts-iframe {
          width: 100%;
          height: 100%;
          border: none;
          display: block;
          filter: hue-rotate(0deg);
        }
        .charts-live-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 0.72rem;
          font-weight: 600;
          color: #10b981;
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.25);
          border-radius: 9999px;
          padding: 3px 10px;
        }
        .live-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #10b981;
          animation: pulse-dot 1.8s ease-in-out infinite;
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.7); }
        }
        .spin-refresh { animation: spin-anim 1s linear infinite; }
        @keyframes spin-anim {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}} />

      <div className="charts-section">
        {/* Header */}
        <div className="charts-header">
          <div className="charts-header-left">
            <div className="charts-icon-badge">
              <BarChart3 size={20} />
            </div>
            <div>
              <h3 className="charts-title">📊 AI Content Analytics Dashboard</h3>
              <p className="charts-subtitle">Powered by MongoDB Charts — real-time insights</p>
            </div>
            <span className="charts-live-badge">
              <span className="live-dot" />
              LIVE
            </span>
          </div>

          <div className="charts-header-actions">
            <button
              className="charts-action-btn"
              onClick={handleRefresh}
              title="Reload Dashboard"
            >
              <RefreshCw size={14} />
              Refresh
            </button>

            <button
              className="charts-action-btn"
              onClick={handleFullscreen}
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              <Maximize2 size={14} />
              {isFullscreen ? 'Exit' : 'Fullscreen'}
            </button>

            <a
              href={DASHBOARD_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="charts-action-btn primary-btn"
              title="Open in MongoDB Charts"
            >
              <ExternalLink size={14} />
              Open in Charts
            </a>
          </div>
        </div>

        {/* Iframe wrapper */}
        <div className={`charts-iframe-wrapper ${isFullscreen ? 'fullscreen-mode' : ''}`}>
          {isFullscreen && (
            <button
              onClick={handleFullscreen}
              style={{
                position: 'absolute',
                top: 12,
                right: 16,
                zIndex: 9001,
                background: 'rgba(0,0,0,0.7)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#fff',
                borderRadius: 8,
                padding: '6px 14px',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 600,
              }}
            >
              ✕ Exit Fullscreen
            </button>
          )}
          <iframe
            key={key}
            className="charts-iframe"
            src={DASHBOARD_URL}
            title="AI Content Analytics MongoDB Charts Dashboard"
            allowFullScreen
          />
        </div>
      </div>
    </>
  );
}
