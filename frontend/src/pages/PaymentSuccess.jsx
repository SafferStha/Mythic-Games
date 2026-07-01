import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getPaymentDetails } from "../services/paymentService";
import { getStoredUser } from "../utils/auth";
import "./PaymentSuccess.css";

const formatAmount = (amount) => `Rs. ${Number(amount || 0).toFixed(2)}`;

const parseBatchIds = (search) => {
  const params = new URLSearchParams(search);
  const rawBatch = params.get("batch") || "";

  return [
    ...new Set(
      rawBatch
        .split(",")
        .map((value) => Number(value.trim()))
        .filter((value) => Number.isInteger(value) && value > 0),
    ),
  ];
};

const PaymentSuccess = () => {
  const { paymentId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = getStoredUser();
  const userId = currentUser?.uid ?? currentUser?.user_id;

  const [payments, setPayments] = useState(() =>
    Array.isArray(location.state?.payments) ? location.state.payments : [],
  );
  const [loading, setLoading] = useState(
    !Array.isArray(location.state?.payments) ||
      location.state.payments.length === 0,
  );
  const [error, setError] = useState("");

  const paymentIds = useMemo(() => {
    const queryIds = parseBatchIds(location.search);
    const routeId = Number(paymentId);
    const stateIds = Array.isArray(location.state?.payments)
      ? location.state.payments
          .map((payment) => Number(payment.id))
          .filter((value) => Number.isInteger(value) && value > 0)
      : [];

    return [
      ...new Set(
        [...stateIds, ...queryIds, routeId].filter(
          (value) => Number.isInteger(value) && value > 0,
        ),
      ),
    ];
  }, [location.search, location.state, paymentId]);

  useEffect(() => {
    if (!userId) {
      navigate("/login", {
        replace: true,
        state: { from: `/payment/success/${paymentId}${location.search}` },
      });
      return;
    }

    if (
      Array.isArray(location.state?.payments) &&
      location.state.payments.length
    ) {
      setPayments(location.state.payments);
      setLoading(false);
      return;
    }

    const loadPayments = async () => {
      try {
        setLoading(true);
        const payloads = await Promise.all(
          paymentIds.map((id) => getPaymentDetails({ paymentId: id, userId })),
        );
        setPayments(payloads.map((payload) => payload.data));
      } catch (loadError) {
        setError(loadError.message || "Failed to load payment details.");
      } finally {
        setLoading(false);
      }
    };

    if (paymentIds.length > 0) {
      loadPayments();
    } else {
      setLoading(false);
      setPayments([]);
    }
  }, [
    location.search,
    location.state,
    navigate,
    paymentId,
    paymentIds,
    userId,
  ]);

  const totalAmount = useMemo(() => {
    if (typeof location.state?.totalAmount === "number") {
      return location.state.totalAmount;
    }

    return payments.reduce(
      (sum, payment) => sum + Number(payment.amount || 0),
      0,
    );
  }, [location.state, payments]);

  const paymentMethodLabel =
    payments[0]?.payment_method_label || payments[0]?.payment_method || "-";

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
          ) : payments.length === 0 ? (
            <p className="payment-success-error">
              Payment details were not found.
            </p>
          ) : (
            <>
              <div className="payment-success-grid">
                <div>
                  <span>{payments.length > 1 ? "Games" : "Game"}</span>
                  <strong>
                    {payments.length > 1
                      ? `${payments.length} Games Purchased`
                      : payments[0].game_title}
                  </strong>
                </div>
                <div>
                  <span>Amount</span>
                  <strong>{formatAmount(totalAmount)}</strong>
                </div>
                <div>
                  <span>Payment Method</span>
                  <strong>{paymentMethodLabel}</strong>
                </div>
                <div>
                  <span>Transaction{payments.length > 1 ? "s" : " ID"}</span>
                  <strong>
                    {payments.length > 1
                      ? `${payments.length} Demo Transactions`
                      : payments[0].transaction_id}
                  </strong>
                </div>
              </div>

              {payments.length > 1 && (
                <div className="payment-success-list">
                  {payments.map((payment) => (
                    <div key={payment.id} className="payment-success-list-item">
                      <div>
                        <span>Game</span>
                        <strong>{payment.game_title}</strong>
                      </div>
                      <div>
                        <span>Transaction ID</span>
                        <strong>{payment.transaction_id}</strong>
                      </div>
                      <div>
                        <span>Amount</span>
                        <strong>{formatAmount(payment.amount)}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              )}

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
