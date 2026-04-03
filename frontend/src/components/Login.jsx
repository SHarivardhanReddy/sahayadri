import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/axiosConfig';

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [userRole, setUserRole] = useState('worker'); // 'doctor' or 'worker'
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Validate doctor login
    if (userRole === 'doctor') {
      const email = identifier.trim().toLowerCase();
      if (!email.endsWith('@mlrit.ac.in')) {
        setError('⚠ Doctors must login with @mlrit.ac.in email address only');
        setLoading(false);
        return;
      }
      if (!email.includes('@')) {
        setError('⚠ Please enter a valid @mlrit.ac.in email address for doctor login');
        setLoading(false);
        return;
      }
    }

    // Validate worker login
    if (userRole === 'worker') {
      const trimmedId = identifier.trim();
      const isEmail = trimmedId.includes('@');
      const isMobile = /^\d{10,}$/.test(trimmedId.replace(/\D/g, ''));
      
      if (isEmail && trimmedId.toLowerCase().endsWith('@mlrit.ac.in')) {
        setError('⚠ Workers cannot use @mlrit.ac.in email. Please use your personal email or mobile number');
        setLoading(false);
        return;
      }
      
      if (!isEmail && !isMobile) {
        setError('⚠ Enter a valid email or 10-digit mobile number for worker login');
        setLoading(false);
        return;
      }
    }

    try {
      const res = await apiClient.post('/api/request-otp', { identifier });
      if (res.data.success) {
        setSuccess("✓ Code sent! Check your email for the 4-digit verification code.");
        setTimeout(() => {
          setSuccess('');
          setStep(2);
        }, 1500);
      }
    } catch (err) {
      console.error('OTP Request Error:', err);
      if (err.code === 'ECONNABORTED') {
        setError('⚠ Request timeout. Backend server may be slow.');
      } else if (!err.response) {
        setError('⚠ Cannot connect to backend server. Ensure it\'s running on http://localhost:5000');
      } else {
        setError(err.response.data?.message || '⚠ Error from server. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await apiClient.post('/api/verify-otp', { identifier, otp });
      if (res.data.success) {
        setSuccess('✓ Verification successful! Redirecting...');
        localStorage.setItem('userIdentifier', identifier);
        localStorage.setItem('userRole', userRole);
        setTimeout(() => {
          navigate(userRole === 'doctor' ? '/doctor-dashboard' : '/dashboard');
        }, 1000);
      }
    } catch (err) {
      console.error('OTP Verify Error:', err);
      setError('✕ Invalid code. Please check and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        {/* Progress Indicator */}
        <div className="login-progress">
          <div className="login-step">
            <div className={`step-circle ${step >= 1 ? 'active' : 'inactive'}`}>
              {step > 1 ? '✓' : '1'}
            </div>
            <span className={`step-label ${step === 1 ? 'active' : ''}`}>Email/Phone</span>
          </div>
          <div className={`step-line ${step >= 2 ? 'active' : ''}`}></div>
          <div className="login-step">
            <div className={`step-circle ${step >= 2 ? (step === 2 ? 'active' : 'completed') : 'inactive'}`}>
              {step > 2 ? '✓' : '2'}
            </div>
            <span className={`step-label ${step === 2 ? 'active' : ''}`}>Verify</span>
          </div>
        </div>

        <div className="login-brand">Sahyadri</div>
        <h2>{step === 1 ? 'Sign in' : 'Verify Code'}</h2>
        <p className="login-subtitle">
          {step === 1 ? 'Secure access for doctors and workers' : 'Enter the 4-digit code sent to your email'}
        </p>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <span className="error-message-icon">✕</span>
            <span className="error-message-text">{error}</span>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="success-message">
            <span className="success-message-icon">✓</span>
            <span className="success-message-text">{success}</span>
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleRequestOtp} className="login-form">
            {/* Role Selection */}
            <div className="role-selector">
              <label className="role-label">Login As:</label>
              <div className="role-buttons">
                <button
                  type="button"
                  className={`role-btn ${userRole === 'doctor' ? 'active' : ''}`}
                  onClick={() => {
                    setUserRole('doctor');
                    setIdentifier('');
                    setError('');
                  }}
                >
                  👨‍⚕️ Doctor
                </button>
                <button
                  type="button"
                  className={`role-btn ${userRole === 'worker' ? 'active' : ''}`}
                  onClick={() => {
                    setUserRole('worker');
                    setIdentifier('');
                    setError('');
                  }}
                >
                  👷 Worker
                </button>
              </div>
            </div>

            <div className="input-group">
              <label>
                <span className="input-icon">📧</span>
                {userRole === 'doctor' ? '@mlrit.ac.in Email' : 'Email or Phone Number'}
              </label>
              <div className="input-help">
                {userRole === 'doctor' ? (
                  <>Only <code>@mlrit.ac.in</code> email addresses are allowed for doctors</>
                ) : (
                  <>Enter your registered mobile number or personal email</>
                )}
              </div>
              <input
                type="text"
                placeholder={userRole === 'doctor' ? 'doctor@mlrit.ac.in' : '9876543210 or email@example.com'}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <button type="submit" className="login-btn" disabled={loading}>
              <span className="login-btn-icon">{loading ? '⏳' : '✉️'}</span>
              {loading ? 'Generating Code...' : 'Generate Verification Code'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="login-form">
            <div className="input-group">
              <label>
                <span className="input-icon">🔐</span>
                4-Digit Code
              </label>
              <input
                type="text"
                placeholder="0 0 0 0"
                maxLength="4"
                inputMode="numeric"
                value={otp}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setOtp(val);
                }}
                required
                disabled={loading}
                autoFocus
              />
            </div>
            <button type="submit" className="login-btn verify" disabled={loading}>
              <span className="login-btn-icon">{loading ? '⏳' : '✓'}</span>
              {loading ? 'Verifying...' : 'Verify & Access Dashboard'}
            </button>
            <div className="resend-section">
              <span className="resend-text">Didn't receive the code?</span>
              <button
                type="button"
                className="resend-btn"
                onClick={() => {
                  setStep(1);
                  setOtp('');
                  setError('');
                }}
              >
                Request a new code
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;