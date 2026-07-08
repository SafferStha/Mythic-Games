import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import './Auth.css';

import logo from '../assets/MythicLogo.png';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setMessage('');
    setMessageType('');
    setLoading(true);

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
        throw new Error(data.message || 'Something went wrong.');
      }

      setMessageType('success');
      setMessage(data.message || 'OTP verification code sent to your email.');

      // Wait 1.5 seconds so user can read the success message before transition
      setTimeout(() => {
        navigate('/otp-verification', { state: { email } });
      }, 1500);

    } catch (err) {
      setMessageType('error');
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <img
          src={logo}
          alt="logo"
          className="auth-logo"
        />

        <h2 className="auth-title">
          Reset Password
        </h2>

        {message && (
          <div className={`auth-message ${messageType}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Enter your email"
            className="auth-input"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            disabled={loading}
            required
          />

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  );
};


export default ResetPassword;