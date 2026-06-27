import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import { getUserPaymentHistory } from "../services/paymentService";
import { getStoredUser } from "../utils/auth";
import "./PurchaseHistory.css";

const formatAmount = (amount) => `Rs. ${Number(amount || 0).toFixed(2)}`;

const PurchaseHistory = () => {
  const currentUser = getStoredUser();
  const userId = currentUser?.uid ?? currentUser?.user_id;
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadHistory = async () => {
      if (!userId) {
        setPayments([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");
        const payload = await getUserPaymentHistory({ userId });
        setPayments(payload.data || []);
      } catch (loadError) {
        setError(loadError.message || "Failed to load purchase history.");
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [userId]);

  const paidPayments = useMemo(
    () => payments.filter((payment) => payment.payment_status === "PAID"),
    [payments],
  );

  const totalSpent = useMemo(
    () =>
      paidPayments.reduce(
        (total, payment) => total + Number(payment.amount || 0),
        0,
      ),
    [paidPayments],
  );

  return (
    <div className="purchase-history-page">
      <Navbar />
      <main className="purchase-history-main">
        <section className="purchase-history-header">
          <div>
            <h1>Purchase History</h1>
            <p>Review your completed Mythic Games purchases.</p>
          </div>
          <div className="purchase-history-total">
            <span>Total spent</span>
            <strong>{formatAmount(totalSpent)}</strong>
          </div>
        </section>

        {loading ? (
          <p className="purchase-history-state">Loading purchase history...</p>
        ) : error ? (
          <p className="purchase-history-state purchase-history-error">{error}</p>
        ) : paidPayments.length === 0 ? (
          <p className="purchase-history-state">No completed purchases yet.</p>
        ) : (
          <div className="purchase-history-table-wrap">
            <table className="purchase-history-table">
              <thead>
                <tr>
                  <th>Payment ID</th>
                  <th>Game</th>
                  <th>Method</th>
                  <th>Amount</th>
                  <th>Transaction ID</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {paidPayments.map((payment) => (
                  <tr key={payment.id}>
                    <td>#{payment.id}</td>
                    <td>{payment.game_title || "Unknown game"}</td>
                    <td>{payment.payment_method_label}</td>
                    <td>{formatAmount(payment.amount)}</td>
                    <td>{payment.transaction_id || "-"}</td>
                    <td>{new Date(payment.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};

export default PurchaseHistory;
