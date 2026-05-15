import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

import logo from '../assets/MythicLogo.png';

import { FaEnvelope, FaUser, FaEye, FaEyeSlash } from 'react-icons/fa';

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
        autoComplete="new-password"
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

const SignUp = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [submitMessage, setSubmitMessage] = useState('');
  const [submitType, setSubmitType] = useState('');

  const resetMessage = () => {
    setSubmitMessage('');
    setSubmitType('');
  };

  const validate = () => {
    if (!fullName.trim()) return 'Full name is required.';
    if (!username.trim()) return 'Username is required.';
    if (!email.trim()) return 'Email is required.';
    if (!password) return 'Password is required.';
    if (!confirmPassword) return 'Confirm Password is required.';
    if (password !== confirmPassword) return 'Passwords do not match.';

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
      setSubmitType('error');
      setSubmitMessage(
        'Sign-up is not available yet (backend auth endpoints not implemented).'
      );
    } catch {
      setSubmitType('error');
      setSubmitMessage('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <img src={logo} alt="logo" className="login-logo" />

          <h2 className="login-title">Sign Up</h2>

          <form onSubmit={onMainButtonClick}>
            <div className="login-input-wrapper">
              <input
                type="text"
                placeholder="Full Name"
                className="login-input"
                name="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                autoComplete="name"
              />

              <FaUser className="login-icon" />
            </div>

            <div className="login-input-wrapper">
              <input
                type="text"
                placeholder="Username"
                className="login-input"
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
              />

              <FaUser className="login-icon" />
            </div>

            <div className="login-input-wrapper">
              <input
                type="email"
                placeholder="Email"
                className="login-input"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />

              <FaEnvelope className="login-icon" />
            </div>

            <PasswordField
              placeholder="Password"
              name="password"
              value={password}
              onChange={setPassword}
            />

            <PasswordField
              placeholder="Confirm Password"
              name="confirmPassword"
              value={confirmPassword}
              onChange={setConfirmPassword}
            />

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

            <button className="login-button" type="submit" disabled={loading}>
              {loading ? 'Please wait…' : 'Register'}
            </button>
          </form>

          <p className="login-text">
            Already have an account?
            <span className="login-link" onClick={() => navigate('/login')}>
              {' '}Login
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;