import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getPaymentDetails } from "../services/paymentService";
import { getStoredUser } from "../utils/auth";
import "./PaymentSuccess.css";

const formatAmount = (amount) => `Rs. ${Number(amount || 0).toFixed(2)}`;

const PaymentSuccess = () => {
  const { paymentId } = useParams();
  const navigate = useNavigate();
  const currentUser = getStoredUser();
  const userId = currentUser?.uid ?? currentUser?.user_id;

  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userId) {
      navigate("/login", {
        replace: true,
        state: { from: `/payment/success/${paymentId}` },
      });
      return;
    }

    const loadPayment = async () => {
      try {
        setLoading(true);
        const payload = await getPaymentDetails({ paymentId, userId });
        setPayment(payload.data);
      } catch (loadError) {
        setError(loadError.message || "Failed to load payment details.");
      } finally {
        setLoading(false);
      }
    };

    loadPayment();
  }, [navigate, paymentId, userId]);

  return (
    <div className="payment-success-page">
      <Navbar />
      <main className="payment-success-main">
        <section className="payment-success-card">
          <p className="payment-success-badge">Demo Payment Gateway</p>
          <h1>Payment Successful</h1>

          {loading ? (
            <p className="payment-success-info">Loading payment summary...</p>
          ) : error ? (
            <p className="payment-success-error">{error}</p>
          ) : !payment ? (
            <p className="payment-success-error">
              Payment details were not found.
            </p>
          ) : (
            <>
              <div className="payment-success-grid">
                <div>
                  <span>Game</span>
                  <strong>{payment.game_title}</strong>
                </div>
                <div>
                  <span>Amount</span>
                  <strong>{formatAmount(payment.amount)}</strong>
                </div>
                <div>
                  <span>Payment Method</span>
                  <strong>{payment.payment_method_label}</strong>
                </div>
                <div>
                  <span>Transaction ID</span>
                  <strong>{payment.transaction_id}</strong>
                </div>
              </div>

              <div className="payment-success-actions">
                <Link
                  to="/library"
                  className="payment-success-btn payment-success-btn-primary"
                >
                  Go to Library
                </Link>
                <Link
                  to="/discover"
                  className="payment-success-btn payment-success-btn-secondary"
                >
                  Continue Shopping
                </Link>
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
};

export default PaymentSuccess;
