import React from 'react';
import './About.css';
import { Link } from 'react-router-dom';

export default function About() {
  return (
    <section className="about">
      <header className="about__hero">
        <div className="about__hero-content">
          <h1>About SpacePortal</h1>
          <p className="about__tagline">Your window into near‑real‑time space weather and solar activity.</p>
          <div className="about__cta">
            <Link to="/register" className="btn">Get Started</Link>
            <Link to="/contact" className="btn secondary">Contact</Link>
          </div>
        </div>
      </header>

      <div className="about__grid">
        <section className="about__card">
          <h2>Mission</h2>
          <p>
            SpacePortal helps enthusiasts, students, and researchers explore solar activity and
            space weather in a clear, approachable way. We bring together curated visualizations
            and data integrations so you can focus on insights, not plumbing.
          </p>
        </section>

        <section className="about__card">
          <h2>What you can do</h2>
          <ul>
            <li>Browse solar flare events from NASA’s DONKI service</li>
            <li>Save time with an approachable UI—no API keys required for basic viewing</li>
            <li>Manage user roles (Admin only) and import event data</li>
            <li>Keep your account profile up to date</li>
          </ul>
        </section>

        <section className="about__card">
          <h2>Data sources</h2>
          <p>
            We integrate with NASA’s DONKI (Space Weather Database Of Notifications, Knowledge,
            Information) for solar flare data. Data availability and latency are subject to the
            upstream provider.
          </p>
          <Link to="/flares" className="about__link">Explore solar flares →</Link>
        </section>

        <section className="about__card">
          <h2>Technology</h2>
          <ul>
            <li>Frontend: React + TypeScript</li>
            <li>Backend: ASP.NET Core Web API (JWT auth)</li>
            <li>Styling: lightweight CSS with design tokens</li>
          </ul>
        </section>

        <section className="about__card">
          <h2>Privacy & security</h2>
          <ul>
            <li>Authentication via short‑lived JWTs (session by default)</li>
            <li>No tokens or secrets are shown in the UI</li>
            <li>Admin routes are protected both client‑side and server‑side</li>
          </ul>
        </section>

        <section className="about__card">
          <h2>Roadmap</h2>
          <ul>
            <li>Richer event timelines and filtering</li>
            <li>Personalized dashboards</li>
            <li>Additional DONKI endpoints and imagery</li>
          </ul>
        </section>
      </div>

      <footer className="about__footer">
        <p>
          Questions or feedback? Visit our <Link to="/contact">Contact</Link> page—
          we’d love to hear from you.
        </p>
      </footer>
    </section>
  );
}
