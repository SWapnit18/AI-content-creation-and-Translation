import React from 'react';
import { Sparkles, Check, ArrowRight } from 'lucide-react';

export default function Hero() {
  return (
    <section style={{ padding: '7rem 3rem', position: 'relative', overflow: 'hidden' }}>
      <div className="hero-bg" style={{ position: 'absolute', top: 0, right: 0, width: '60%', height: '100%', background: 'radial-gradient(circle at right, rgba(99,102,241,0.15) 0%, rgba(0,0,0,0) 60%)', zIndex: -1 }}></div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '5rem' }}>
        <div style={{ flex: 1, textAlign: 'left' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', padding: '8px 16px', borderRadius: '999px', fontSize: '0.85rem', fontWeight: 700, marginBottom: '2rem', border: '1px solid rgba(99, 102, 241, 0.2)', letterSpacing: '0.5px' }}>
            <Sparkles size={16} /> POWERED BY NEXT-GEN AI
          </div>
          
          <h1 style={{ fontSize: 'clamp(3rem, 4.5vw, 4.5rem)', fontWeight: 800, lineHeight: 1.15, marginBottom: '1.5rem', color: 'var(--text-heading)' }}>
            Create Multilingual <br />
            <span style={{ color: 'var(--primary)' }}>Masterpieces</span> with AI
          </h1>
          
          <p style={{ fontSize: '1.15rem', color: 'var(--text-body)', marginBottom: '2.5rem', maxWidth: '500px', lineHeight: 1.6 }}>
            Break language barriers and unleash your creativity. Experience flawless translations and writing refinement powered by the latest AI technology.
          </p>

          <div style={{ display: 'flex', gap: '1rem', marginBottom: '3.5rem' }}>
            <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '16px 32px', fontSize: '1.1rem', borderRadius: '12px' }}>
              Get Started
            </button>
            <button className="btn-outline" style={{ padding: '16px 32px', fontSize: '1.1rem', borderRadius: '12px', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-heading)', fontWeight: 600 }}>
              View Pricing
            </button>
          </div>

          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', color: 'var(--text-heading)', fontSize: '1rem', fontWeight: 500 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ background: 'rgba(99, 102, 241, 0.2)', color: 'var(--primary)', borderRadius: '50%', padding: '4px' }}><Check size={16} strokeWidth={3} /></div> Neural Translation
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ background: 'rgba(99, 102, 241, 0.2)', color: 'var(--primary)', borderRadius: '50%', padding: '4px' }}><Check size={16} strokeWidth={3} /></div> Creative Content
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ background: 'rgba(99, 102, 241, 0.2)', color: 'var(--primary)', borderRadius: '50%', padding: '4px' }}><Check size={16} strokeWidth={3} /></div> Writing Refinement
            </div>
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <div style={{ 
            width: '100%', 
            maxWidth: '520px', 
            background: 'var(--bg-card)', 
            border: '1px solid var(--border)', 
            borderRadius: '24px', 
            padding: '32px', 
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)' 
          }}>
             <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
               <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: '#ef4444' }}></div>
               <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: '#eab308' }}></div>
               <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: '#22c55e' }}></div>
             </div>
             
             <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                <div style={{ height: '50px', background: 'var(--bg-alt)', borderRadius: '12px', border: '1px solid var(--border)', flex: 1 }}></div>
                <div style={{ height: '50px', background: 'var(--bg-alt)', borderRadius: '12px', border: '1px solid var(--border)', flex: 1 }}></div>
             </div>
             <div style={{ height: '180px', background: 'var(--bg-alt)', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '16px' }}></div>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <div style={{ height: '20px', background: 'var(--bg-alt)', border: '1px solid var(--border)', borderRadius: '6px', width: '30%' }}></div>
               <div style={{ height: '45px', background: 'var(--primary)', borderRadius: '12px', width: '40%', opacity: 0.9 }}></div>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
}
