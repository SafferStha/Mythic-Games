import { useState } from "react";
import Navbar from "../components/Navbar";
import { FaEnvelope, FaUser, FaCamera, FaShieldAlt, FaEye, FaEyeSlash } from "react-icons/fa";
import "./Account.css";

const Field = ({ icon, label, value, onChange, placeholder, type = "text", autoComplete }) => (
  <label className="account-field">
    <span className="account-field-label">{label}</span>
    <div className="account-input-wrap">
      <input
        type={type}
        className="account-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
      />
      <span className="account-field-icon" aria-hidden="true">
        {icon}
      </span>
    </div>
  </label>
);

const PasswordField = ({ label, value, onChange, placeholder, autoComplete }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <label className="account-field">
      <span className="account-field-label">{label}</span>
      <div className="account-input-wrap account-input-wrap--password">
        <input
          type={showPassword ? "text" : "password"}
          className="account-input account-input--password"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
        />
        <button
          type="button"
          className="account-eye-toggle"
          onClick={() => setShowPassword((prev) => !prev)}
          aria-label={showPassword ? "Hide password" : "Show password"}
          aria-pressed={showPassword}
        >
          {showPassword ? <FaEye /> : <FaEyeSlash />}
        </button>
      </div>
    </label>
  );
};

const Account = () => {
  const [fullName, setFullName] = useState("Ava Morgan");
  const [username, setUsername] = useState("ava_mythic");
  const [email, setEmail] = useState("ava@mythicgames.com");
  const [bio, setBio] = useState("Collector of indie RPGs, strategy titles, and limited edition loot.");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState("Your profile edits are kept on the frontend for now. Connect this form to your backend later.");

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!fullName.trim() || !username.trim() || !email.trim()) {
      setStatus("Please fill in your name, username, and email.");
      return;
    }

    if ((newPassword || confirmPassword || currentPassword) && newPassword !== confirmPassword) {
      setStatus("New password and confirm password must match.");
      return;
    }

    setStatus(
      "Account details are ready for backend integration. Hook this form to persist the profile, password changes, and preferences later."
    );
  };

  return (
    <div className="account-page">
      <Navbar />
      <main className="account-main">
        <section className="account-hero">
          <div>
            <p className="account-kicker">Account settings</p>
            <h1>Manage your account details</h1>
            <p className="account-hero-copy">
              Update your profile information, security details, and future preferences from one place.
            </p>
          </div>

          <div className="account-avatar-card">
            <div className="account-avatar">
              <FaUser />
            </div>
            <div>
              <h2>Ava Morgan</h2>
              <p>Level 12 player</p>
            </div>
            <button type="button" className="account-avatar-action">
              <FaCamera />
              Change avatar
            </button>
          </div>
        </section>

        <div className="account-grid">
          <form className="account-card account-form-card" onSubmit={handleSubmit}>
            <h2>Profile details</h2>
            <p className="account-card-copy">These fields are prepared for backend storage later.</p>

            <Field
              icon={<FaUser />}
              label="Full name"
              value={fullName}
              onChange={setFullName}
              placeholder="Enter your full name"
              autoComplete="name"
            />

            <Field
              icon={<FaUser />}
              label="Username"
              value={username}
              onChange={setUsername}
              placeholder="Choose a username"
              autoComplete="username"
            />

            <Field
              icon={<FaEnvelope />}
              label="Email address"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="Enter your email"
              autoComplete="email"
            />

            <label className="account-field">
              <span className="account-field-label">Bio</span>
              <div className="account-textarea-wrap">
                <textarea
                  className="account-textarea"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Write a short bio"
                  rows={4}
                />
              </div>
            </label>

            <div className="account-section-divider">
              <FaShieldAlt />
              <span>Security</span>
            </div>

            <PasswordField
              label="Current password"
              value={currentPassword}
              onChange={setCurrentPassword}
              placeholder="Enter current password"
              autoComplete="current-password"
            />

            <PasswordField
              label="New password"
              value={newPassword}
              onChange={setNewPassword}
              placeholder="Create a new password"
              autoComplete="new-password"
            />

            <PasswordField
              label="Confirm password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder="Confirm the new password"
              autoComplete="new-password"
            />

            <div className="account-actions">
              <button type="submit" className="account-primary-btn">
                Save changes
              </button>
              <button
                type="button"
                className="account-secondary-btn"
                onClick={() => setStatus("Unsaved changes were cleared visually only. Hook reset behavior to backend state later.")}
              >
                Reset
              </button>
            </div>

            <p className="account-status">{status}</p>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Account;