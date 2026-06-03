import { useEffect, useMemo, useState } from "react";
import { getStoredUser } from "../utils/auth";
import Navbar from "../components/Navbar";
import { FaEnvelope, FaUser, FaCamera, FaShieldAlt, FaEye, FaEyeSlash } from "react-icons/fa";
import "./Account.css";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Field = ({ icon, label, value, onChange, placeholder, type = "text", autoComplete, readOnly = false }) => (
  <label className="account-field">
    <span className="account-field-label">{label}</span>
    <div className="account-input-wrap">
      <input
        type={type}
        className="account-input"
        value={value}
        onChange={readOnly ? undefined : (e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        readOnly={readOnly}
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

const formatJoinedDate = (value) => {
  if (!value) return "Unknown";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Unknown";

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
};

const Account = () => {
  const storedUser = useMemo(() => getStoredUser(), []);
  const [account, setAccount] = useState(storedUser);
  const [loading, setLoading] = useState(true);
  const [loadMessage, setLoadMessage] = useState("Loading your account details...");
  const [bio, setBio] = useState("Collector of indie RPGs, strategy titles, and limited edition loot.");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState("Your profile is being loaded.");

  useEffect(() => {
    const loadAccount = async () => {
      const userId = storedUser?.uid ?? storedUser?.user_id;

      if (!userId) {
        setLoading(false);
        setLoadMessage("No saved login was found. Please sign in again.");
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/users/${userId}`);
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload?.message || "Failed to load account details.");
        }

        setAccount(payload.data);
        setStatus("Account details loaded successfully.");
        setLoadMessage("Account details loaded successfully.");
      } catch (error) {
        setLoadMessage(error?.message || "Unable to load account details.");
        setStatus("Unable to refresh account details from the backend.");
      } finally {
        setLoading(false);
      }
    };

    loadAccount();
  }, [storedUser]);

  const username = account?.username || "Unknown user";
  const email = account?.email || "No email loaded";
  const uid = account?.uid ?? account?.user_id ?? "Unknown UID";
  const accountStatus = account?.status || "active";
  const joinedAt = formatJoinedDate(account?.created_at);

  const handleSubmit = (event) => {
    event.preventDefault();

    if ((newPassword || confirmPassword || currentPassword) && newPassword !== confirmPassword) {
      setStatus("New password and confirm password must match.");
      return;
    }

    setStatus("Account details are loaded from the database. Saving changes is not connected yet.");
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
              {loadMessage}
            </p>
          </div>

          <div className="account-avatar-card">
            <div className="account-avatar">
              <FaUser />
            </div>
            <div>
              <h2>{username}</h2>
              <p>{email}</p>
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
            <p className="account-card-copy">
              These values are loaded from the user row created at registration.
            </p>

            <Field
              icon={<FaUser />}
              label="Username"
              value={username}
              onChange={(value) => setAccount((previous) => ({ ...previous, username: value }))}
              placeholder="Choose a username"
              autoComplete="username"
            />

            <Field
              icon={<FaShieldAlt />}
              label="UID"
              value={String(uid)}
              onChange={() => {}}
              placeholder="User UID"
              readOnly
            />

            <Field
              icon={<FaEnvelope />}
              label="Email address"
              type="email"
              value={email}
              onChange={(value) => setAccount((previous) => ({ ...previous, email: value }))}
              placeholder="Enter your email"
              autoComplete="email"
            />

            <Field
              icon={<FaShieldAlt />}
              label="Account status"
              value={accountStatus}
              onChange={() => {}}
              placeholder="Account status"
              readOnly
            />

            <Field
              icon={<FaCamera />}
              label="Joined on"
              value={joinedAt}
              onChange={() => {}}
              placeholder="Joined date"
              readOnly
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

            {loading && <p className="account-status">Loading profile...</p>}
            <p className="account-status">{status}</p>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Account;