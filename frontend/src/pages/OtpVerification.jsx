import { useState, useRef } from 'react';
import './Auth.css';
import './OtpVerification.css';

import logo from '../assets/MythicLogo.png';

const OtpVerification = () => {
  const [otp, setOtp] = useState(new Array(6).fill(''));
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

  const handleResend = () => {
    // Logic to resend OTP
    console.log("Resending OTP...");
    alert("A new 6-digit code has been sent to your email.");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const otpCode = otp.join('');

    console.log("Submitted OTP:", otpCode);

    alert('OTP Verified: ' + otpCode);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <img src={logo} alt="logo" className="auth-logo" />

        <h2 className="auth-title">OTP Verification</h2>
        <p className="auth-subtitle">Enter the 6-digit code sent to your email</p>

        <form onSubmit={handleSubmit}>
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
                required
              />
            ))}
          </div>

          <button 
            type="submit" 
            className="auth-button"
            disabled={otp.some(v => v === '')}
          >
            Continue
          </button>

          <div className="resend-wrapper">
            <p>Didn't receive the code?</p>
            <button type="button" className="resend-link" onClick={handleResend}>
              Resend Code
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OtpVerification;