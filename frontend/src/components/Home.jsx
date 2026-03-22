import React from 'react';
import { useNavigate } from 'react-router-dom';
import HeroImg from '../assets/hero-illustration.svg';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-wrapper">
      <nav className="home-nav">
        <div className="logo">SAHAYADRI</div>
        <div className="nav-links">
          <button type="button" onClick={() => navigate('/login')} className="nav-login-btn">Sign in</button>
        </div>
      </nav>

      <main className="hero-container">
        <div className="hero-left">
          <span className="hero-eyebrow">Occupational health</span>
          <h1>Digital fitness certification for labour</h1>
          <p className="lead">
            Real-time health parameters and AI-assisted fitness assessment—built for workers, clinics, and compliance teams.
          </p>
          <div className="hero-actions">
            <button type="button" onClick={() => navigate('/login')} className="primary-btn">Open dashboard</button>
          </div>

          <div className="home-features">
            <div className="home-feature-card">
              <strong>Structured records</strong>
              <span>Medical flags and demographics in one secure profile.</span>
            </div>
            <div className="home-feature-card">
              <strong>Explainable AI</strong>
              <span>Job-aware scans with clear contribution breakdowns.</span>
            </div>
            <div className="home-feature-card">
              <strong>Dual access</strong>
              <span>Workers view their file; doctors manage the roster.</span>
            </div>
          </div>

          <footer className="home-footer">
            Sahyadri · Labour fitness &amp; digital health records
          </footer>
        </div>

        <div className="hero-right">
          <div className="img-card">
            <img src={HeroImg} alt="" className="main-hero-img" width={420} height={320} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
