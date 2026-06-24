import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useGameLibrary } from "../contexts/GameLibraryContext.jsx";
import {
  getPaymentDetails,
  processDemoPayment,
  updateDemoPaymentMethod,
} from "../services/paymentService";
import { getStoredUser } from "../utils/auth";
import "./DemoPaymentGateway.css";

const ESEWA_LOGO = "https://cdn.esewa.com.np/ui/images/esewa_og.png?111";
const KHALTI_LOGO =
  "https://blog.khalti.com/wp-content/uploads/2025/07/Khalti-Logo-New-3.png";

const GATEWAY_CONFIG = {
  esewa: {
    title: "Demo eSewa Gateway",
    methodLabel: "eSewa",
    themeClass: "esewa",
    logo: ESEWA_LOGO,
    logoAlt: "eSewa logo",
    integrated: true,
    fields: [
      {
        name: "account",
        label: "eSewa ID / Mobile Number",
        type: "text",
        autoComplete: "off",
      },
      {
        name: "secret",
        label: "Password",
        type: "password",
        autoComplete: "new-password",
      },
    ],
    primaryLabel: "Confirm Payment",
    failLabel: "Payment Failed",
  },
  khalti: {
    title: "Demo Khalti Gateway",
    methodLabel: "Khalti",
    themeClass: "khalti",
    logo: KHALTI_LOGO,
    logoAlt: "Khalti logo",
    integrated: true,
    fields: [
      {
        name: "account",
        label: "Mobile Number",
        type: "text",
        autoComplete: "off",
      },
      {
        name: "secret",
        label: "MPIN",
        type: "password",
        autoComplete: "new-password",
      },
    ],
    primaryLabel: "Pay Now",
    failLabel: "Simulate Failure",
  },
  cards: {
    title: "Card Payment Not Available",
    methodLabel: "Credit / Debit Card",
    themeClass: "cards",
    integrated: false,
    fields: [],
  },
};

const PAYMENT_OPTIONS = [
  {
    id: "esewa",
    label: "eSewa",
    logo: ESEWA_LOGO,
    logoAlt: "eSewa logo",
    integrated: true,
    helper: "Demo eSewa wallet flow",
  },
  {
    id: "khalti",
    label: "Khalti",
    logo: KHALTI_LOGO,
    logoAlt: "Khalti logo",
    integrated: true,
    helper: "Demo Khalti wallet flow",
  },
  {
    id: "cards",
    label: "Credit / Debit Card",
    integrated: false,
    helper: "Visible only, not integrated",
  },
];

const formatAmount = (amount) => `Rs. ${Number(amount || 0).toFixed(2)}`;
const normalizeItem = (item) => ({
  id: item?.id,
  key: String(item?.key || item?.id || item?.title || Math.random()),
  title: item?.title || item?.game_title || "Game Name",
  price: Number(item?.price ?? item?.amount ?? 0),
  image: item?.image || item?.image_url || item?.game_image || "",
});

const DemoPaymentGateway = () => {
  const { method, paymentId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { removeCartItemByGameId } = useGameLibrary();
  const currentUser = getStoredUser();
  const userId = currentUser?.uid ?? currentUser?.user_id;

  const [payment, setPayment] = useState(null);
  const [selectedOption, setSelectedOption] = useState(method || "esewa");
  const [formValues, setFormValues] = useState({ account: "", secret: "" });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [switchingMethod, setSwitchingMethod] = useState(false);

  const gateway = useMemo(
    () => GATEWAY_CONFIG[selectedOption] || GATEWAY_CONFIG.esewa,
    [selectedOption],
  );

  const checkoutItems = useMemo(() => {
    const routedItems = Array.isArray(location.state?.checkoutItems)
      ? location.state.checkoutItems.map(normalizeItem)
      : [];

    if (routedItems.length > 0) {
      return routedItems;
    }

    if (payment) {
      return [normalizeItem(payment)];
    }

    return [];
  }, [location.state, payment]);

  const checkoutTotal = useMemo(() => {
    if (typeof location.state?.totalAmount === "number") {
      return location.state.totalAmount;
    }

    return checkoutItems.reduce(
      (sum, item) => sum + Number(item.price || 0),
      0,
    );
  }, [checkoutItems, location.state]);

  useEffect(() => {
    if (!userId) {
      navigate("/login", {
        replace: true,
        state: { from: `/payment/${method}/${paymentId}` },
      });
      return;
    }

    const loadPayment = async () => {
      try {
        setLoading(true);
        const payload = await getPaymentDetails({ paymentId, userId });
        setPayment(payload.data);
        setSelectedOption(payload.data.payment_method || method || "esewa");
      } catch (error) {
        setMessage(error.message || "Failed to load payment details.");
        setMessageType("error");
      } finally {
        setLoading(false);
      }
    };

    loadPayment();
  }, [method, navigate, paymentId, userId]);

  const paymentCompleted = useMemo(
    () => Boolean(payment && payment.payment_status !== "PENDING"),
    [payment],
  );

  const updateField = (fieldName, value) => {
    setFormValues((current) => ({ ...current, [fieldName]: value }));
  };

  const handleMethodSelect = async (optionId) => {
    setMessage("");

    if (optionId === "cards") {
      setSelectedOption("cards");
      setMessage(
        "Credit and debit card is displayed only for UI. Please use demo eSewa or demo Khalti.",
      );
      setMessageType("warning");
      return;
    }

    setSelectedOption(optionId);

    if (!payment || paymentCompleted || payment.payment_method === optionId) {
      navigate(`/payment/${optionId}/${paymentId}`, {
        replace: true,
        state: location.state,
      });
      return;
    }

    try {
      setSwitchingMethod(true);
      const payload = await updateDemoPaymentMethod({
        paymentId,
        userId,
        paymentMethod: optionId,
      });
      setPayment(payload.data);
      setFormValues({ account: "", secret: "" });
      navigate(`/payment/${optionId}/${paymentId}`, {
        replace: true,
        state: location.state,
      });
    } catch (error) {
      setMessage(error.message || "Failed to switch payment method.");
      setMessageType("error");
      setSelectedOption(payment.payment_method || method || "esewa");
    } finally {
      setSwitchingMethod(false);
    }
  };

  const handleProcess = async (action) => {
    if (!payment || !userId || !gateway.integrated) return;

    if (
      action === "success" &&
      (!formValues.account.trim() || !formValues.secret.trim())
    ) {
      setMessage("Please fill in the demo payment fields before continuing.");
      setMessageType("error");
      return;
    }

    try {
      setSubmitting(true);
      setMessage("");
      const payload = await processDemoPayment({ paymentId, userId, action });
      setPayment(payload.data);
      setSelectedOption(payload.data.payment_method || selectedOption);
      setFormValues({ account: "", secret: "" });

      if (payload.data.payment_status === "PAID") {
        removeCartItemByGameId(payload.data.game_id);
        navigate(`/payment/success/${paymentId}`);
        return;
      }

      setMessage(payload.message);
      setMessageType(
        payload.data.payment_status === "FAILED" ? "error" : "warning",
      );
    } catch (error) {
      setMessage(error.message || "Failed to process demo payment.");
      setMessageType("error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`gateway-page ${gateway.themeClass}`}>
      <Navbar />
      <main className="gateway-main">
        <section className="gateway-card">
          <p className="gateway-badge">Demo Payment Gateway</p>
          <h1>{gateway.title}</h1>
          <p className="gateway-subtitle">
            Continue with your order using the demo payment flow below.
          </p>

          <div className="gateway-methods">
            {PAYMENT_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                className={`gateway-method-option ${selectedOption === option.id ? "selected" : ""} ${option.id}`}
                onClick={() => handleMethodSelect(option.id)}
                disabled={
                  loading || submitting || switchingMethod || paymentCompleted
                }
              >
                <span className="gateway-method-logo-wrap">
                  {option.logo ? (
                    <img
                      src={option.logo}
                      alt={option.logoAlt}
                      className="gateway-method-logo"
                    />
                  ) : (
                    <span className="gateway-card-icon" aria-hidden="true">
                      💳
                    </span>
                  )}
                </span>
                <span className="gateway-method-copy">
                  <strong>{option.label}</strong>
                  <small>{option.helper}</small>
                </span>
              </button>
            ))}
          </div>

          {loading ? (
            <p className="gateway-info">Loading payment details...</p>
          ) : !payment ? (
            <div className="gateway-status gateway-status-error">
              <strong>Unable to load payment details.</strong>
              <span>
                {message || "The selected payment could not be found."}
              </span>
            </div>
          ) : (
            <>
              <div className="gateway-layout">
                <div className="gateway-order-panel">
                  <h2 className="gateway-section-title">Your Order</h2>
                  <div className="gateway-order-items">
                    {checkoutItems.map((item) => (
                      <div className="gateway-order-item" key={item.key}>
                        <div className="gateway-order-thumb">
                          {item.image ? (
                            <img src={item.image} alt={item.title} />
                          ) : (
                            <div className="gateway-order-thumb-placeholder" />
                          )}
                        </div>
                        <div className="gateway-order-copy">
                          <strong>{item.title}</strong>
                        </div>
                        <span>{formatAmount(item.price)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="gateway-order-total">
                    <span>Total</span>
                    <strong>{formatAmount(checkoutTotal)}</strong>
                  </div>
                </div>

                <div className="gateway-payment-panel">
                  <div className="gateway-summary">
                    <div>
                      <span>Selected Method</span>
                      <strong>{gateway.methodLabel}</strong>
                    </div>
                    <div>
                      <span>Status</span>
                      <strong>{payment.payment_status}</strong>
                    </div>
                  </div>

                  {paymentCompleted && (
                    <div
                      className={`gateway-status ${payment.payment_status === "FAILED" ? "gateway-status-error" : "gateway-status-warning"}`}
                    >
                      <strong>Payment status: {payment.payment_status}</strong>
                      <span>
                        {payment.payment_status === "FAILED"
                          ? "This demo payment has already been marked as failed."
                          : "This demo payment is no longer pending."}
                      </span>
                    </div>
                  )}

                  {message && (
                    <div
                      className={`gateway-status ${messageType === "error" ? "gateway-status-error" : "gateway-status-warning"}`}
                    >
                      <strong>
                        {messageType === "error"
                          ? "Action failed"
                          : "Status updated"}
                      </strong>
                      <span>{message}</span>
                    </div>
                  )}

                  {switchingMethod && (
                    <p className="gateway-info">Switching payment method...</p>
                  )}

                  {!gateway.integrated ? (
                    <div className="gateway-card-unavailable">
                      <strong>Card payment is not integrated</strong>
                      <span>
                        Please choose demo eSewa or demo Khalti to continue this
                        mock payment flow.
                      </span>
                    </div>
                  ) : (
                    <form
                      className="gateway-form"
                      onSubmit={(event) => event.preventDefault()}
                    >
                      <div className="gateway-brand-row">
                        <img
                          src={gateway.logo}
                          alt={gateway.logoAlt}
                          className="gateway-brand-logo"
                        />
                      </div>

                      {gateway.fields.map((field) => (
                        <label key={field.name} className="gateway-field">
                          <span>{field.label}</span>
                          <input
                            type={field.type}
                            value={formValues[field.name]}
                            autoComplete={field.autoComplete}
                            onChange={(event) =>
                              updateField(field.name, event.target.value)
                            }
                            disabled={
                              submitting || paymentCompleted || switchingMethod
                            }
                          />
                        </label>
                      ))}

                      <div className="gateway-actions">
                        <button
                          type="button"
                          className="gateway-btn gateway-btn-primary"
                          onClick={() => handleProcess("success")}
                          disabled={
                            submitting || paymentCompleted || switchingMethod
                          }
                        >
                          {submitting ? "Processing..." : gateway.primaryLabel}
                        </button>
                        <button
                          type="button"
                          className="gateway-btn gateway-btn-danger"
                          onClick={() => handleProcess("failed")}
                          disabled={
                            submitting || paymentCompleted || switchingMethod
                          }
                        >
                          {gateway.failLabel}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </>
          )}

          <div className="gateway-footer-links">
            <Link to="/checkout">Back to Checkout</Link>
            <Link to="/cart">Back to Cart</Link>
          </div>
        </section>
      </main>
    </div>
  );
};

export default DemoPaymentGateway;
