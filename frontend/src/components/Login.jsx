import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [loginData, setLoginData] = useState({ email: '', mobile: '' });
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // For now, we allow entry if both fields have values
    if (loginData.email && loginData.mobile) {
      navigate('/dashboard');
    } else {
      alert("Please enter both Email and Mobile Number");
    }
  };

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f4f7f6'
    }}>
      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '10px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h2 style={{ textAlign: 'center', color: '#2c3e50', marginBottom: '30px' }}>Staff Login</h2>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: '#7f8c8d' }}>Email Address</label>
            <input 
              type="email" 
              required
              style={{ width: '100%', padding: '12px', borderRadius: '5px', border: '1px solid #ddd' }}
              onChange={(e) => setLoginData({...loginData, email: e.target.value})}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: '#7f8c8d' }}>Mobile Number</label>
            <input 
              type="tel" 
              required
              style={{ width: '100%', padding: '12px', borderRadius: '5px', border: '1px solid #ddd' }}
              onChange={(e) => setLoginData({...loginData, mobile: e.target.value})}
            />
          </div>
          <button type="submit" style={{
            backgroundColor: '#3498db',
            color: 'white',
            padding: '14px',
            border: 'none',
            borderRadius: '5px',
            fontWeight: 'bold',
            cursor: 'pointer',
            marginTop: '10px'
          }}>
            Access Dashboard
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;