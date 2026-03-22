import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/request-otp', { identifier });
      if (res.data.success) {
        alert("Developer Note: Check your VS Code Terminal for the 4-digit code!");
        setStep(2);
      }
    } catch (err) {
      alert("Error: Ensure backend server is running.");
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/verify-otp', { identifier, otp });
      if (res.data.success) {
          // Developer Note: Store identity and role for the private dashboard
          const isDoctor = identifier.trim().toLowerCase().endsWith('@doctor.ac.in');
          localStorage.setItem('userIdentifier', identifier);
          localStorage.setItem('userRole', isDoctor ? 'doctor' : 'worker');
          navigate(isDoctor ? '/doctor-dashboard' : '/dashboard');
      }
    } catch (err) {
      alert("Invalid Code. Please try again.");
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <div className="login-brand">Sahyadri</div>
        <h2>Sign in</h2>
        <p className="login-subtitle">Secure access for doctors and workers</p>

        {step === 1 ? (
          <form onSubmit={handleRequestOtp}>
            <div className="input-group">
              <label>Sign in</label>
              <p style={{ fontSize: 13, color: '#64748b', marginBottom: 8 }}>
                <strong>Doctors:</strong> your registered <code>@doctor.ac.in</code> email only (no mobile).
                <br />
                <strong>Workers:</strong> mobile number or registered email.
              </p>
              <input 
                type="text" 
                placeholder="doctor@doctor.ac.in or mobile number"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="login-btn">Generate Verification Code</button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp}>
            <div className="input-group">
              <label>Enter 4-Digit OTP</label>
              <input 
                type="text" 
                placeholder="0 0 0 0"
                maxLength="4"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="login-btn verify">Verify & Access Dashboard</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;