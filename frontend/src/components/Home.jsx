import React from 'react';
import { useNavigate } from 'react-router-dom';
import HeroImg from '../assets/hero-illustration.svg';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-wrapper">
      {/* Professional Navbar */}
      <nav className="home-nav">
        <div className="logo">SAHAYADRI</div>
        <div className="nav-links">
          <button onClick={() => navigate('/login')} className="nav-login-btn">Login</button>
        </div>
      </nav>
      
      {/* Modern Hero Section */}
      <main className="hero-container">
        <div className="hero-left">
          <h1>Digital AI Health Certifier for Workers</h1>
          <p>
            The industry-leading platform for real-time health tracking and AI-driven fitness certifications.
          </p>
          <div className="hero-actions">
            <button onClick={() => navigate('/login')} className="primary-btn">Open Dashboard</button>
          </div>
          
          
        </div>

        <div className="hero-right">
          <div className="img-card">
            <img src={HeroImg} alt="AI health illustration" className="main-hero-img" />
          </div>
        </div>
      {/* compact hero — no extra feature block */}
      </main>
    </div>
  );
};

export default Home;