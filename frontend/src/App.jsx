import React from 'react';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';

import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Services from './components/Services';
import AIFormCard from './components/AIFormCard';
import QuoteSection from './components/QuoteSection';
import Contact from './components/Contact';

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

function SectionWrapper({ alt, children }) {
  return (
    <section style={{ padding: '5rem 1.5rem', backgroundColor: alt ? 'var(--bg-alt)' : 'var(--bg-card)' }}>
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

export default function App() {
  return (
    <ThemeProvider>
      <Toaster position="top-right" toastOptions={{ style: { background: 'var(--bg-card)', color: 'var(--text-heading)', border: '1px solid var(--border)' } }} />
      <Navbar />
      <main>
        <Hero />
        <Services />

        {/* ── Translation ── */}
        <SectionWrapper alt>
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
            onSubmit={(text, language) => translateText(text, language || LANGUAGES[0]).then(d => d.result)}
          />
        </SectionWrapper>

        {/* ── Creative Writing ── */}
        <SectionWrapper>
          <SectionHeader
            title="AI Creative Content Generator"
            desc="Describe your idea and let AI craft a compelling, imaginative long-form piece of about 3000 words in the language of your choice."
          />
          <AIFormCard
            id="creative"
            title=""
            description=""
            placeholder="Describe your creative idea (e.g. 'A long-form article about the future of AI and society')…"
            submitLabel="Generate Content"
            extraField={{ label: 'Output Language', options: LANGUAGES }}
            onSubmit={(text, language) => generateCreativeContent(text, language || LANGUAGES[20]).then(d => d.result)}
          />
        </SectionWrapper>

        {/* ── Improve Writing ── */}
        <SectionWrapper alt>
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
            onSubmit={(text) => improveWriting(text).then(d => d.result)}
          />
        </SectionWrapper>

        <QuoteSection />
        <Contact />
      </main>

      <footer style={{ backgroundColor: 'var(--bg-card)', borderTop: `1px solid var(--border)`, padding: '2rem 1.5rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-body)', fontSize: '0.9rem' }}>
          © {new Date().getFullYear()} AI Creative Content &amp; Translation System. All rights reserved.
        </p>
      </footer>
    </ThemeProvider>
  );
}
