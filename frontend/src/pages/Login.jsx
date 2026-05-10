import { useMemo, useState } from 'react';
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
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();


  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [submitMessage, setSubmitMessage] = useState('');
  const [submitType, setSubmitType] = useState(''); 

  const title = useMemo(
    () => (isLogin ? 'Sign In' : 'Sign Up'),
    [isLogin]
  );

  const actionLabel = useMemo(
    () => (isLogin ? 'Login' : 'Register'),
    [isLogin]
  );

  const resetMessage = () => {
    setSubmitMessage('');
    setSubmitType('');
  };

  const validate = () => {
    if (!email.trim()) return 'Email is required.';
    if (!password) return 'Password is required.';

    if (!isLogin) {
      if (!username.trim()) return 'Username is required.';
      if (!confirmPassword) return 'Confirm Password is required.';
      if (password !== confirmPassword) return 'Passwords do not match.';
    }

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
        'Login/Register is not available yet (backend auth endpoints not implemented).'
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
          <img
            src={logo}
            alt="logo"
            className="login-logo"
          />

          <h2 className="login-title">{title}</h2>

          <form onSubmit={onMainButtonClick}>
            {!isLogin && (
              <div className="login-input-wrapper">
                <input
                  type="text"
                  placeholder="Username"
                  className="login-input"
                  name="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />

                <FaUser className="login-icon" />
              </div>
            )}

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

            {!isLogin && (
              <div className="login-input-wrapper">
                <input
                  type="password"
                  placeholder="Confirm Password"
                  className="login-input"
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            )}

            {isLogin && (
              <div className="login-forgot-row">
                <button
                  type="button"
                  className="login-forgot"
                  onClick={() => navigate('/reset-password')}
                >
                  Forgot password?
                </button>
              </div>
            )}

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
              {loading ? 'Please wait…' : actionLabel}
            </button>
          </form>

          <p className="login-text">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}
            <span
              className="login-link"
              onClick={() => {
                setIsLogin(!isLogin);
                setSubmitMessage('');
                setSubmitType('');
                setUsername('');
                setEmail('');
                setPassword('');
                setConfirmPassword('');
                setLoading(false);
              }}
            >
              {isLogin ? ' Sign Up' : ' Login'}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
