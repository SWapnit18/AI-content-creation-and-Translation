import React, { useState } from 'react';
import toast from 'react-hot-toast';

// Converts markdown-like text to HTML
function formatOutput(text) {
  if (!text) return '';
  return text
    .split('\n')
    .map((line) => {
      const t = line.trim();
      if (!t) return '';
      if (t.startsWith('**') && t.endsWith('**'))
        return `<h3>${t.slice(2, -2)}</h3>`;
      if (t.startsWith('* '))
        return `<li>${t.slice(2)}</li>`;
      if (/^\d+\.\s/.test(t))
        return `<li>${t.replace(/^\d+\.\s/, '')}</li>`;
      return `<p>${t}</p>`;
    })
    .join('');
}

export default function AIFormCard({ id, title, description, onSubmit, extraField, submitLabel = 'Generate', placeholder = 'Enter your text here...' }) {
  const [text, setText] = useState('');
  const [extra, setExtra] = useState(extraField?.options?.[0] || '');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    setResult('');
    try {
      const res = await onSubmit(text, extra);
      setResult(res);
    } catch (err) {
      toast.error(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    const el = document.getElementById(`${id}-output`);
    navigator.clipboard.writeText(el?.innerText || result).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div id={id} style={{ maxWidth: 760, margin: '0 auto', backgroundColor: 'var(--bg-card)', borderRadius: 12, padding: '2rem', boxShadow: 'var(--shadow)' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '0.5rem' }}>{title}</h2>
      <p style={{ color: 'var(--text-body)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>{description}</p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder={placeholder}
          rows={5}
          maxLength={3000}
          required
          style={{
            width: '100%', padding: '0.85rem', borderRadius: 8,
            border: `1px solid var(--border)`, backgroundColor: 'var(--bg-alt)',
            color: 'var(--text-heading)', fontSize: '0.95rem', resize: 'vertical',
            outline: 'none', fontFamily: 'inherit',
          }}
        />

        {extraField && (
          <select value={extra} onChange={e => setExtra(e.target.value)}
            style={{
              width: '100%', padding: '0.85rem', borderRadius: 8,
              border: `1px solid var(--border)`, backgroundColor: 'var(--bg-alt)',
              color: 'var(--text-heading)', fontSize: '0.95rem', outline: 'none',
            }}>
            {extraField.options.map(opt => <option key={opt}>{opt}</option>)}
          </select>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-body)' }}>{text.length}/3000</span>
          <button type="submit" disabled={loading || !text.trim()}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              backgroundColor: 'var(--accent)', color: '#fff',
              border: 'none', borderRadius: 9999, padding: '0.75rem 2rem',
              fontWeight: 600, cursor: loading || !text.trim() ? 'not-allowed' : 'pointer',
              opacity: loading || !text.trim() ? 0.7 : 1, fontSize: '0.95rem',
              transition: 'opacity 0.2s',
            }}>
            {loading && <span className="spinner" />}
            {loading ? 'Generating…' : submitLabel}
          </button>
        </div>
      </form>

      {result && (
        <div style={{ marginTop: '1.5rem', padding: '1.25rem', backgroundColor: 'var(--bg-alt)', borderRadius: 8, border: `1px solid var(--border)` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontWeight: 600, color: 'var(--text-heading)' }}>Result</span>
            <button onClick={handleCopy}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-body)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              {copied ? '✓ Copied!' : (
                <>
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy
                </>
              )}
            </button>
          </div>
          <div id={`${id}-output`} className="prose-output"
            style={{ color: 'var(--text-body)', lineHeight: 1.7 }}
            dangerouslySetInnerHTML={{ __html: formatOutput(result) }} />
        </div>
      )}
    </div>
  );
}
