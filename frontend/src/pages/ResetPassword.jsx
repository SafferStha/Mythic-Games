import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import './Auth.css';

import logo from '../assets/MythicLogo.png';

const ResetPassword = () => {
  const [email, setEmail] = useState('');

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log(email);

    navigate('/otp-verification');
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

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Enter your email"
            className="auth-input"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            required
          />

          <button
            type="submit"
            className="auth-button"
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;