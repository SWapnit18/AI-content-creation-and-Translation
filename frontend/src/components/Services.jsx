import React from 'react';
import { Globe2, Sparkles, Wand2 } from 'lucide-react';

export default function Services() {
  const items = [
    {
      title: "Neural Translation",
      desc: "Context-aware translation across 50+ languages capturing nuances perfectly.",
      icon: <Globe2 size={24} color="var(--primary)" />
    },
    {
      title: "Creative Catalyst",
      desc: "Overcome writer's block. We generate stories, poems, and articles on demand.",
      icon: <Sparkles size={24} color="var(--secondary)" />
    },
    {
      title: "Writing Polish",
      desc: "Enhance grammar, tone, and clarity of your existing copy automatically.",
      icon: <Wand2 size={24} color="#10b981" />
    }
  ];

  return (
    <section style={{ padding: '5rem 2rem', backgroundColor: 'var(--bg-alt)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        {items.map((item, i) => (
          <div key={i} className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '12px', marginBottom: '1rem' }}>
              {item.icon}
            </div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{item.title}</h3>
            <p>{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
