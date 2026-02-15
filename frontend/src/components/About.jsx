import React from 'react';
import { useNavigate } from 'react-router-dom';

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="about-wrapper">
      {/* Matching Navbar */}
      <nav className="home-nav">
        <div className="logo" onClick={() => navigate('/')} style={{cursor: 'pointer'}}>SAHAYADRI</div>
        <button onClick={() => navigate('/')} className="nav-login-btn">Back to Home</button>
      </nav>

      {/* Modern About Hero */}
      <section className="about-hero-minimal">
        <span className="badge">Our Mission</span>
        <h1>Revolutionizing Labor Healthcare</h1>
        <p>Sahayadri provides a secure, AI-powered ecosystem designed to monitor and improve the health standards of the global workforce.</p>
      </section>

      {/* Service Cards Grid */}
      <div className="info-grid-container">
        <div className="info-card-modern">
          <div className="card-icon">📊</div>
          <h3>Digital Health Records</h3>
          <p>Centralized medical history storage accessible in real-time, ensuring that every worker's health data is secure and up-to-date.</p>
        </div>

        <div className="info-card-modern">
          <div className="card-icon">🤖</div>
          <h3>AI Fitness Scanning</h3>
          <p>Using advanced biometric analysis to provide instant fitness certifications and respiratory health screenings.</p>
        </div>

        <div className="info-card-modern">
          <div className="card-icon">🛡️</div>
          <h3>Secure Management</h3>
          <p>Enterprise-grade security protocols to protect sensitive medical information for both employers and employees.</p>
        </div>
      </div>

      {/* Visual Detail Section */}
      <section className="about-image-section">
        <div className="image-text">
          <h2>Built for Reliability</h2>
          <p>Our platform handles thousands of records daily, providing seamless health assessments and operational efficiency for industrial sectors.</p>
        </div>
        <div className="about-img-wrap">
          <img src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80" alt="Tech Healthcare" />
        </div>
      </section>

      <footer className="about-footer">
        <p>&copy; 2026 Sahayadri Systems. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default About;