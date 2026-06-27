import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import { API_BASE_URL } from "../utils/api";
import "./ManageUsers.css";

const STATUS_FILTERS = ["ALL", "ACTIVE", "BANNED"];

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [status, setStatus] = useState("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingUid, setSavingUid] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch(`${API_BASE_URL}/api/users/admin/users`);
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.message || "Failed to load users.");
      }

      setUsers(payload.data || []);
    } catch (loadError) {
      setError(loadError.message || "Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesStatus =
        status === "ALL" || String(user.status).toUpperCase() === status;
      const matchesSearch =
        !normalizedSearch ||
        String(user.username || "").toLowerCase().includes(normalizedSearch) ||
        String(user.email || "").toLowerCase().includes(normalizedSearch) ||
        String(user.uid || "").includes(normalizedSearch);

      return matchesStatus && matchesSearch;
    });
  }, [search, status, users]);

  const updateUserBan = async (user) => {
    const isBanned = user.status === "banned";
    const action = isBanned ? "unban" : "ban";

    try {
      setSavingUid(user.uid);
      setMessage("");
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/api/users/admin/users/${user.uid}/${action}`,
        { method: "PATCH" },
      );
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.message || `Failed to ${action} user.`);
      }

      setUsers((currentUsers) =>
        currentUsers.map((currentUser) =>
          currentUser.uid === user.uid ? payload.data : currentUser,
        ),
      );
      setMessage(payload.message || `User ${action}ned successfully.`);
    } catch (saveError) {
      setError(saveError.message || `Failed to ${action} user.`);
    } finally {
      setSavingUid(null);
    }
  };

  return (
    <div className="manage-users-page">
      <Navbar />
      <main className="container">
        <section className="admin-users">
          <div className="admin-users-header">
            <div>
              <h2>Manage Users</h2>
              <p className="admin-users-subtitle">Ban or restore player accounts</p>
            </div>
          </div>

          <div className="admin-users-toolbar">
            <div className="admin-users-filters">
              {STATUS_FILTERS.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  className={`admin-users-filter ${status === filter ? "active" : ""}`}
                  onClick={() => setStatus(filter)}
                >
                  {filter}
                </button>
              ))}
            </div>

            <input
              type="text"
              className="admin-users-search"
              placeholder="Search users"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          {message && <p className="admin-users-state admin-users-success">{message}</p>}
          {error && <p className="admin-users-state admin-users-error">{error}</p>}

          {loading ? (
            <p className="admin-users-state">Loading users...</p>
          ) : filteredUsers.length === 0 ? (
            <p className="admin-users-state">No users found.</p>
          ) : (
            <div className="admin-users-table-wrap">
              <table className="admin-users-table">
                <thead>
                  <tr>
                    <th>User ID</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => {
                    const isBanned = user.status === "banned";
                    const isSaving = savingUid === user.uid;

                    return (
                      <tr key={user.uid}>
                        <td>#{user.uid}</td>
                        <td>{user.username}</td>
                        <td>{user.email}</td>
                        <td>
                          <span
                            className={`user-status-chip ${String(user.status).toLowerCase()}`}
                          >
                            {user.status}
                          </span>
                        </td>
                        <td>{new Date(user.created_at).toLocaleDateString()}</td>
                        <td>
                          <button
                            type="button"
                            className={`admin-users-action ${isBanned ? "restore" : "danger"}`}
                            onClick={() => updateUserBan(user)}
                            disabled={isSaving}
                          >
                            <i
                              className={`bx ${isBanned ? "bx-user-check" : "bx-user-x"}`}
                              aria-hidden="true"
                            />
                            <span>{isSaving ? "Saving" : isBanned ? "Unban" : "Ban"}</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default ManageUsers;
