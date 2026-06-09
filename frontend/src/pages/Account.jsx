import { useEffect, useMemo, useState } from "react";
import { getStoredUser, setStoredUser } from "../utils/auth";
import Navbar from "../components/Navbar";
import {
  FaEnvelope,
  FaUser,
  FaCamera,
  FaShieldAlt,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import "./Account.css";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

const Field = ({
  icon,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  autoComplete,
  readOnly = false,
}) => (
  <label className="account-field">
    <span className="account-field-label">{label}</span>
    <div className="account-input-wrap">
      <input
        type={type}
        className="account-input"
        value={value}
        onChange={
          readOnly ? undefined : (e) => onChange(e.target.value)
        }
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

const PasswordField = ({
  label,
  value,
  onChange,
  placeholder,
  autoComplete,
}) => {
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
  const [loadMessage, setLoadMessage] = useState(
    "Loading your account details..."
  );

  const [bio, setBio] = useState(
    "Collector of indie RPGs, strategy titles, and limited edition loot."
  );

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState("Your profile is being loaded.");

  const [avatarPreview, setAvatarPreview] = useState(null);

  useEffect(() => {
    const loadAccount = async () => {
      const userId = storedUser?.uid ?? storedUser?.user_id;

      if (!userId) {
        setLoading(false);
        setLoadMessage("No saved login was found. Please sign in again.");
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/users/${userId}`
        );
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(
            payload?.message || "Failed to load account details."
          );
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

  const uid = account?.uid ?? account?.user_id;
  const accountStatus = account?.status || "active";
  const joinedAt = formatJoinedDate(account?.created_at);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      if (
        (currentPassword || newPassword || confirmPassword) &&
        newPassword !== confirmPassword
      ) {
        setStatus("Passwords do not match.");
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/api/users/${uid}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: account?.username,
            email: account?.email,
            status: account?.status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      if (currentPassword && newPassword && confirmPassword) {
        const passwordResponse = await fetch(
          `${API_BASE_URL}/api/users/change-password`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId: uid,
              email: account?.email,
              currentPassword,
              newPassword,
            }),
          }
        );

        const passwordData = await passwordResponse.json();

        if (!passwordResponse.ok) {
          throw new Error(passwordData.message);
        }
      }

      // ✅ FIX: sync state + localStorage properly
      const updatedUser = data.data;
      setAccount(updatedUser);
      setStoredUser(updatedUser);

      setStatus("Profile updated successfully.");
    } catch (error) {
      setStatus(error.message);
    }
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
              {avatarPreview || account?.avatar ? (
                <img
                  src={
                    avatarPreview ||
                    `${API_BASE_URL}/uploads/${account.avatar}`
                  }
                  alt="avatar"
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <FaUser />
              )}
            </div>

            <div>
              <h2>{account?.username || "Unknown user"}</h2>
              <p>{account?.email || "No email loaded"}</p>
            </div>

            <label className="account-avatar-action">
              <FaCamera />
              Change avatar

              <input
                hidden
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files[0];
                  if (!file) return;

                  const formData = new FormData();
                  formData.append("avatar", file);
                  formData.append("userId", uid);

                  const response = await fetch(
                    `${API_BASE_URL}/api/users/upload-avatar`,
                    {
                      method: "POST",
                      body: formData,
                    }
                  );

                  const data = await response.json();

                  if (response.ok) {
                    const updated = data.data;
                    setAvatarPreview(
                      `${API_BASE_URL}/uploads/${updated.avatar}`
                    );
                    setAccount(updated);
                    setStoredUser(updated);
                  }
                }}
              />
            </label>
          </div>
        </section>

        <div className="account-grid">
          <form className="account-card account-form-card" onSubmit={handleSubmit}>
            <h2>Profile details</h2>

            <Field
              icon={<FaUser />}
              label="Username"
              value={account?.username || ""}
              onChange={(value) =>
                setAccount((prev) => ({ ...prev, username: value }))
              }
              placeholder="Choose a username"
              autoComplete="username"
            />

            <Field
              icon={<FaShieldAlt />}
              label="UID"
              value={String(uid)}
              readOnly
            />

            <Field
              icon={<FaEnvelope />}
              label="Email address"
              type="email"
              value={account?.email || ""}
              onChange={(value) =>
                setAccount((prev) => ({ ...prev, email: value }))
              }
              autoComplete="email"
            />

            <Field
              icon={<FaShieldAlt />}
              label="Account status"
              value={accountStatus}
              readOnly
            />

            <Field
              icon={<FaCamera />}
              label="Joined on"
              value={joinedAt}
              readOnly
            />

            <label className="account-field">
              <span className="account-field-label">Bio</span>
              <textarea
                className="account-textarea"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
              />
            </label>

            <PasswordField
              label="Current password"
              value={currentPassword}
              onChange={setCurrentPassword}
              autoComplete="current-password"
            />

            <PasswordField
              label="New password"
              value={newPassword}
              onChange={setNewPassword}
              autoComplete="new-password"
            />

            <PasswordField
              label="Confirm password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              autoComplete="new-password"
            />

            <div className="account-actions">
              <button type="submit" className="account-primary-btn">
                Save changes
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