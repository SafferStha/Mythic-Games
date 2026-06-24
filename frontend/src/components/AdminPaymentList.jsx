import { useEffect, useState } from "react";
import { getAdminPayments } from "../services/paymentService";
import "./AdminPaymentList.css";

const FILTERS = ["ALL", "PAID", "FAILED", "PENDING", "CANCELLED"];

const formatAmount = (amount) => `Rs. ${Number(amount || 0).toFixed(2)}`;

const AdminPaymentList = () => {
  const [status, setStatus] = useState("ALL");
  const [search, setSearch] = useState("");
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPayments = async () => {
      try {
        setLoading(true);
        setError("");
        const payload = await getAdminPayments({
          status,
          search: search.trim(),
        });
        setPayments(payload.data || []);
      } catch (loadError) {
        setError(loadError.message || "Failed to load payments.");
      } finally {
        setLoading(false);
      }
    };

    loadPayments();
  }, [search, status]);

  return (
    <section className="admin-payments">
      <div className="admin-header">
        <div>
          <h2>Manage Payments</h2>
          <p className="admin-payments-subtitle">Demo Payment Gateway</p>
        </div>
      </div>

      <div className="admin-payments-toolbar">
        <div className="admin-payments-filters">
          {FILTERS.map((filter) => (
            <button
              key={filter}
              type="button"
              className={`admin-payments-filter ${status === filter ? "active" : ""}`}
              onClick={() => setStatus(filter)}
            >
              {filter}
            </button>
          ))}
        </div>

        <input
          type="text"
          className="admin-payments-search"
          placeholder="Search by transaction ID"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      {loading ? (
        <p className="admin-payments-state">Loading payments...</p>
      ) : error ? (
        <p className="admin-payments-state admin-payments-error">{error}</p>
      ) : payments.length === 0 ? (
        <p className="admin-payments-state">
          No payments found for the selected filters.
        </p>
      ) : (
        <div className="admin-payments-table-wrap">
          <table className="admin-payments-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Transaction ID</th>
                <th>User</th>
                <th>Game</th>
                <th>Method</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td>#{payment.id}</td>
                  <td>{payment.transaction_id || "-"}</td>
                  <td>{payment.username || payment.user_id}</td>
                  <td>{payment.game_title}</td>
                  <td>{payment.payment_method_label}</td>
                  <td>{formatAmount(payment.amount)}</td>
                  <td>
                    <span
                      className={`payment-status-chip ${String(payment.payment_status).toLowerCase()}`}
                    >
                      {payment.payment_status}
                    </span>
                  </td>
                  <td>{new Date(payment.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default AdminPaymentList;
