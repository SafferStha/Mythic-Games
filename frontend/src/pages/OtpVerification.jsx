import { useState } from 'react';
import './Auth.css';

import logo from '../assets/MythicLogo.png';

const OtpVerification = () => {
  const [otp, setOtp] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log(otp);

    alert('OTP Verified');
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
          OTP Verification
        </h2>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter the six digit code"
            className="auth-input"
            value={otp}
            onChange={(e) =>
              setOtp(e.target.value)
            }
            maxLength={6}
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

export default OtpVerification;