import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Login.css';

import logo from '../assets/MythicLogo.png';

import { FaEnvelope, FaEye, FaEyeSlash } from 'react-icons/fa';
import { setStoredUser } from '../utils/auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';


const PasswordField = ({ placeholder, name, value, onChange }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="login-input-wrapper login-input-wrapper--icon-right">
      <input
        type={showPassword ? 'text' : 'password'}
        placeholder={placeholder}
        className="login-input login-input--no-left-padding"
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="current-password"
      />

      <button
        type="button"
        className="login-eye-toggle"
        onClick={() => setShowPassword((p) => !p)}
        aria-label={showPassword ? 'Hide password' : 'Show password'}
        aria-pressed={showPassword}
      >
        {showPassword ? <FaEye /> : <FaEyeSlash />}
      </button>
    </div>
  );
};


const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = new URLSearchParams(location.search).get('returnTo');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [submitMessage, setSubmitMessage] = useState('');
  const [submitType, setSubmitType] = useState(''); 

  const resetMessage = () => {
    setSubmitMessage('');
    setSubmitType('');
  };

  const validate = () => {
    if (!email.trim()) return 'Email is required.';
    if (!password) return 'Password is required.';

    return '';
  };

  const onMainButtonClick = async (e) => {
    e.preventDefault();
    if (loading) return;

    resetMessage();

    const err = validate();
    if (err) {
      setSubmitType('error');
      setSubmitMessage(err);
      return; 
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identifier: email, password }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.message || 'Login failed.');
      }

      setStoredUser(payload.data);
      setSubmitType('success');
      setSubmitMessage(payload.message || 'Login successful.');
      navigate(location.state?.from || returnTo || '/account', { replace: true });
    } catch (error) {
      setSubmitType('error');
      setSubmitMessage(error?.message || 'Unable to sign in. Check your email and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <img
            src={logo}
            alt="logo"
            className="login-logo"
          />

          <h2 className="login-title">Sign In</h2>

          <form onSubmit={onMainButtonClick}>
            <div className="login-input-wrapper">
              <input
                type="email"
                placeholder="Email"
                className="login-input"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <FaEnvelope className="login-icon" />
            </div>

            <PasswordField
              placeholder="Password"
              name="password"
              value={password}
              onChange={setPassword}
            />

            <div className="login-forgot-row">
              <button
                type="button"
                className="login-forgot"
                onClick={() => navigate('/reset-password')}
              >
                Forgot password?
              </button>
            </div>

            {submitMessage && (

              <p
                className="login-text"
                style={{
                  color: submitType === 'success' ? '#00ff99' : '#ff6b6b',
                  marginTop: 10,
                  marginBottom: 10,
                  fontWeight: 700,
                }}
              >
                {submitMessage}
              </p>
            )}


            <button
              className="login-button"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Please wait…' : 'Login'}
            </button>
          </form>

          <p className="login-text">
            Don't have an account?
            <span
              className="login-link"
              onClick={() => navigate('/signup')}
            >
              {' '}Sign Up
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
