import { useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import './Auth.css';
import './OtpVerification.css';

import logo from '../assets/MythicLogo.png';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const OtpVerification = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const email = location.state?.email || '';

  const [otp, setOtp] = useState(new Array(6).fill(''));
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const inputRefs = useRef([]);

  const handleChange = (value, index) => {
    if (isNaN(value)) return;

    const newOtp = [...otp];
    // Ensure we only take the last character if someone tries to type over
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto-focus next input field
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    // Move to previous field on backspace if current is empty
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pasteData)) return;

    const newOtp = [...otp];
    pasteData.split('').forEach((char, index) => {
      newOtp[index] = char;
    });
    setOtp(newOtp);

    // Focus the last filled input or the 6th one
    const lastIndex = Math.min(pasteData.length, 5);
    inputRefs.current[lastIndex].focus();
  };

  const handleResend = async () => {
    if (!email) return;
    
    setLoading(true);
    setMessage('');
    setMessageType('');
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to resend OTP.');
      }

      setMessageType('success');
      setMessage('A new 6-digit code has been sent to your email.');
    } catch (err) {
      setMessageType('error');
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length < 6 || loading) return;

    setLoading(true);
    setMessage('');
    setMessageType('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp: otpCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'OTP verification failed.');
      }

      setIsOtpVerified(true);
      setMessageType('success');
      setMessage('OTP verified successfully! Please enter your new password.');
    } catch (err) {
      setMessageType('error');
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (newPassword.length < 6) {
      setMessageType('error');
      setMessage('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessageType('error');
      setMessage('Passwords do not match.');
      return;
    }

    setLoading(true);
    setMessage('');
    setMessageType('');
    const otpCode = otp.join('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp: otpCode, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to reset password.');
      }

      setMessageType('success');
      setMessage('Password reset successful! Redirecting to login page...');
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setMessageType('error');
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  // If email is missing, show a fallback message to go back
  if (!email) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <img src={logo} alt="logo" className="auth-logo" />
          <h2 className="auth-title" style={{ fontSize: '24px' }}>Session Expired</h2>
          <p className="auth-subtitle">No email session was found. Please request a new code.</p>
          <button onClick={() => navigate('/reset-password')} className="auth-button">
            Request New Code
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <img src={logo} alt="logo" className="auth-logo" />

        {!isOtpVerified ? (
          <>
            <h2 className="auth-title">OTP Verification</h2>
            <p className="auth-subtitle">Enter the 6-digit code sent to <strong>{email}</strong></p>

            {message && (
              <div className={`auth-message ${messageType}`}>
                {message}
              </div>
            )}

            <form onSubmit={handleOtpSubmit}>
              <div className="otp-container">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    inputMode="numeric"
                    className="otp-input"
                    value={digit}
                    onChange={(e) => handleChange(e.target.value, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    onPaste={handlePaste}
                    ref={(el) => (inputRefs.current[index] = el)}
                    disabled={loading}
                    required
                  />
                ))}
              </div>

              <button 
                type="submit" 
                className="auth-button"
                disabled={otp.some(v => v === '') || loading}
              >
                {loading ? 'Verifying...' : 'Continue'}
              </button>

              <div className="resend-wrapper">
                <p>Didn't receive the code?</p>
                <button 
                  type="button" 
                  className="resend-link" 
                  onClick={handleResend}
                  disabled={loading}
                >
                  Resend Code
                </button>
              </div>
            </form>
          </>
        ) : (
          <>
            <h2 className="auth-title" style={{ fontSize: '28px' }}>New Password</h2>
            <p className="auth-subtitle">Create a secure new password for your account</p>

            {message && (
              <div className={`auth-message ${messageType}`}>
                {message}
              </div>
            )}

            <form onSubmit={handlePasswordSubmit}>
              <div className="auth-input-wrapper">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="New Password"
                  className="auth-input"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  className="auth-eye-toggle"
                  onClick={() => setShowNewPassword(prev => !prev)}
                  aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                >
                  {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              <div className="auth-input-wrapper">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm Password"
                  className="auth-input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  className="auth-eye-toggle"
                  onClick={() => setShowConfirmPassword(prev => !prev)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              <button 
                type="submit" 
                className="auth-button"
                disabled={loading || !newPassword || !confirmPassword}
              >
                {loading ? 'Updating...' : 'Reset Password'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};


export default OtpVerification;