import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-wrapper">
      {/* Professional Navbar */}
      <nav className="home-nav">
        <div className="logo">SAHAYADRI</div>
        <div className="nav-links">
          <span onClick={() => navigate('/about')} className="nav-item">How it Works</span>
          <button onClick={() => navigate('/login')} className="nav-login-btn">Staff Login</button>
        </div>
      </nav>
      
      {/* Modern Hero Section */}
      <main className="hero-container">
        <div className="hero-left">
          <div className="status-pill">● System Live: Workforce Monitoring</div>
          <h1>Advanced Digital Health for the Global Workforce</h1>
          <p>
            The industry-leading platform for real-time health tracking, 
            AI-driven fitness certifications, and secure medical record management.
          </p>
          <div className="hero-actions">
            <button onClick={() => navigate('/login')} className="primary-btn">Open Dashboard</button>
            <button onClick={() => navigate('/about')} className="secondary-btn">Learn More —&gt;</button>
          </div>
          
          <div className="hero-stats">
            <div className="stat"><strong>24/7</strong><span>Monitoring</span></div>
            <div className="stat"><strong>AI</strong><span>Fitness Scan</span></div>
            <div className="stat"><strong>Secure</strong><span>Cloud Data</span></div>
          </div>
        </div>

        <div className="hero-right">
          <img 
            src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1000&q=80" 
            alt="Medical Dashboard" 
            className="main-hero-img"
          />
        </div>
      </main>
    </div>
  );
};

export default Home;