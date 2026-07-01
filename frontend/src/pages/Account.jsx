import { useEffect, useMemo, useRef, useState } from "react";
import { getStoredUser, setStoredUser } from "../utils/auth";
import { apiFetch } from "../utils/api";
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
  const [bio, setBio] = useState("Collector of indie RPGs, strategy titles, and limited edition loot.");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState("Your profile is being loaded.");
  const fileInputRef = useRef(null);

  useEffect(() => {
    const loadAccount = async () => {
      const userId = storedUser?.uid ?? storedUser?.user_id;

      if (!userId) {
        setStatus("No saved login was found. Please sign in again.");
        return;
      }

      try {
        const response = await apiFetch(`${API_BASE_URL}/api/users/${userId}`);
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload?.message || "Failed to load account details.");
        }

        setAccount(payload.data);
        setBio(payload.data.bio || "Collector of indie RPGs, strategy titles, and limited edition loot."); // Initialize bio from fetched data
        setStatus("Account details loaded successfully.");
      } catch (error) {
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
  const profileImage = account?.profile_image;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setStatus("Saving changes...");

    try {
      if ((newPassword || confirmPassword || currentPassword) && newPassword !== confirmPassword) {
        throw new Error("New password and confirm password must match.");
      }

      // Update profile details (username, email, bio)
      const profileResponse = await apiFetch(`${API_BASE_URL}/api/users/${uid}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, bio }),
      });

      const profilePayload = await profileResponse.json();
      if (!profileResponse.ok) {
        throw new Error(profilePayload.message || 'Failed to update profile.');
      }

      // Update local storage and state with new profile data
      setAccount(profilePayload.data);
      setStoredUser(profilePayload.data);
      setStatus("Profile updated successfully!");

      // TODO: Add password change logic here if newPassword is provided

    } catch (error) {
      setStatus(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Client-side validation: 2MB limit
    if (file.size > 2 * 1024 * 1024) {
      setStatus("Error: File size must be less than 2MB.");
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      setStatus("Error: Only image files are allowed.");
      return;
    }

    setLoading(true);
    setStatus("Uploading new avatar...");

    const formData = new FormData();
    formData.append('profileImage', file); // 'profileImage' must match the fieldname in multer config

    try {
      const response = await apiFetch(`${API_BASE_URL}/api/users/${uid}/avatar`, {
        method: 'PUT',
        // No 'Content-Type' header needed for FormData, browser sets it automatically
        body: formData,
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.message || 'Failed to upload avatar.');
      }

      setAccount(payload.data); // Update account state with new data including profile_image
      setStoredUser(payload.data); // Update local storage
      setStatus("Avatar updated successfully!");
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="account-page">
      <Navbar />
      <main className="account-main">
        <section className="account-hero">
          <div className="account-hero-text">
            <p className="account-kicker">Account settings</p>
            <h1>Manage your account details</h1>
          </div>
          
          <div className="account-avatar-card">
            <img
              src={
                profileImage
                  ? profileImage.startsWith("http")
                    ? profileImage
                    : `${API_BASE_URL}${profileImage}`
                  : "https://via.placeholder.com/150"
              }
              alt="Profile Avatar"
              className="account-avatar-img"
            />
            <div>
              <h2>{username}</h2>
              <p>{email}</p>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              style={{ display: 'none' }}
              accept="image/*"
            />
            <button type="button" className="account-avatar-action" onClick={() => fileInputRef.current.click()}>
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

            {loading && <p className="account-status">Loading profile... (or saving)</p>}
            <p className="account-status">{status}</p>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Account;