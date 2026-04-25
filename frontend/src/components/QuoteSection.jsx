import React, { useState } from 'react';

export default function QuoteSection() {
  const [words, setWords] = useState(1000);
  const cost = (words * 0.05).toFixed(2);

  return (
    <section style={{ padding: '6rem 2rem', textAlign: 'center' }}>
      <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Instant Project <span className="gradient-text">Estimator</span></h2>
      <p style={{ marginBottom: '2rem' }}>Get a quick quote for premium human-reviewed AI generation tasks.</p>
      
      <div className="card" style={{ maxWidth: 600, margin: '0 auto' }}>
        <label style={{ display: 'block', textAlign: 'left', marginBottom: '1rem', fontWeight: 500, color: 'var(--text-heading)' }}>
          Word Count: {words}
        </label>
        <input 
          type="range" 
          min="100" 
          max="10000" 
          step="100"
          value={words} 
          onChange={e => setWords(e.target.value)}
          style={{ width: '100%', marginBottom: '2rem', accentColor: 'var(--primary)' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
          <span style={{ fontSize: '1.25rem' }}>Estimated Cost:</span>
          <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)' }}>${cost}</span>
        </div>
      </div>
    </section>
  );
}
