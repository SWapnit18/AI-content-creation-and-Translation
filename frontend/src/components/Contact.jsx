import React, { useState } from 'react';
import { submitContact } from '../services/api';
import toast from 'react-hot-toast';

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await submitContact(formData);
      toast.success("Message sent successfully! We'll be in touch.");
      setFormData({ name: '', email: '', message: '' });
    } catch {
      toast.error("Failed to send message.");
    }
    setLoading(false);
  };

  return (
    <section style={{ padding: '6rem 2rem', backgroundColor: 'var(--bg-alt)' }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <h2 style={{ fontSize: '2.5rem', textAlign: 'center', marginBottom: '2rem' }}>Get in <span className="gradient-text">Touch</span></h2>
        <form onSubmit={handleSubmit} className="card">
          <input required type="text" placeholder="Your Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          <input required type="email" placeholder="Your Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          <textarea required rows="5" placeholder="How can we help?" value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} />
          <button className="btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>
    </section>
  );
}
