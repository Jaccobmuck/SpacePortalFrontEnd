import React, { useMemo, useState } from 'react';
import './Contact.css';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('SpacePortal Inquiry');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const mailtoHref = useMemo(() => {
    const to = process.env.REACT_APP_CONTACT_EMAIL || 'jmuck@linfield.edu';
    const s = encodeURIComponent(subject || 'SpacePortal Inquiry');
    const body = encodeURIComponent(`From: ${name || 'Anonymous'} <${email || 'n/a'}>\n\n${message}`);
    return `mailto:${to}?subject=${s}&body=${body}`;
  }, [name, email, subject, message]);

  function validate() {
    if (!name.trim()) return 'Please enter your name.';
    if (!email.trim()) return 'Please enter your email.';
    // Lightweight email check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email.';
    if (!message.trim()) return 'Please enter a message.';
    return '';
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    // For now, open the user's mail client with prefilled content to the configured address
    window.location.href = mailtoHref;
    setSent(true);
  }

  return (
    <section className="contact">
      <header className="contact__header">
        <h1>Contact Us</h1>
        <p className="contact__tagline">We’d love to hear from you. Send a message and we’ll get back to you.</p>
      </header>

      <div className="contact__grid">
        <form className="contact__form" onSubmit={handleSubmit} noValidate>
          <div className="contact__row">
            <label htmlFor="name">Name</label>
            <input id="name" className="input" value={name} onChange={e => setName(e.target.value)} maxLength={100} required />
          </div>
          <div className="contact__row">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" className="input" value={email} onChange={e => setEmail(e.target.value)} maxLength={200} required />
          </div>
          <div className="contact__row">
            <label htmlFor="subject">Subject</label>
            <input id="subject" className="input" value={subject} onChange={e => setSubject(e.target.value)} maxLength={150} />
          </div>
          <div className="contact__row">
            <label htmlFor="message">Message</label>
            <textarea id="message" className="input" rows={6} value={message} onChange={e => setMessage(e.target.value)} maxLength={2000} required />
          </div>

          {error && <div className="contact__error">{error}</div>}
          {sent ? (
            <div className="contact__success">Your mail app should have opened with a prefilled message. If not, you can use the email link on the right.</div>
          ) : (
            <button className="btn" type="submit">Send Message</button>
          )}
        </form>

        <aside className="contact__aside">
          <div className="contact__card">
            <h2>Other ways to reach us</h2>
            <ul>
              <li>Email: <a href={mailtoHref}>{process.env.REACT_APP_CONTACT_EMAIL || 'you@example.com'}</a></li>
              <li>Docs: Coming soon</li>
              <li>Status: Coming soon</li>
            </ul>
          </div>

          <div className="contact__card">
            <h2>Tips</h2>
            <ul>
              <li>For account questions, include your username.</li>
              <li>Bug reports: steps to reproduce and screenshots help a ton.</li>
              <li>Data questions: mention dates and filters you used.</li>
            </ul>
          </div>
        </aside>
      </div>
    </section>
  );
}
