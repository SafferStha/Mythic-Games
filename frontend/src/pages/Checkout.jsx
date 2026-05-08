import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useGameLibrary } from "../contexts/GameLibraryContext.jsx";
import "./Checkout.css";

const PAYMENT_METHODS = [
  {
    id: "esewa",
    label: "eSewa",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <circle cx="24" cy="24" r="20" fill="#60BB46" />
        <text
          x="24"
          y="29"
          textAnchor="middle"
          fontSize="14"
          fontWeight="800"
          fill="#fff"
        >
          eSewa
        </text>
      </svg>
    ),
  },
  {
    id: "khalti",
    label: "Khalti",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <circle cx="24" cy="24" r="20" fill="#5C2D91" />
        <text
          x="24"
          y="29"
          textAnchor="middle"
          fontSize="13"
          fontWeight="800"
          fill="#fff"
        >
          Khalti
        </text>
      </svg>
    ),
  },
  {
    id: "card",
    label: "Visa / MasterCard",
    icon: (
      <svg viewBox="0 0 48 32" fill="none" aria-hidden="true">
        <rect width="48" height="32" rx="6" fill="#1A1F71" />
        <text
          x="8"
          y="21"
          fontSize="11"
          fontWeight="900"
          fill="#fff"
          letterSpacing="0"
        >
          VISA
        </text>
        <circle cx="34" cy="16" r="7" fill="#EB001B" fillOpacity="0.9" />
        <circle cx="40" cy="16" r="7" fill="#F79E1B" fillOpacity="0.85" />
      </svg>
    ),
  },
];

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems } = useGameLibrary();
  const [selectedMethod, setSelectedMethod] = useState("esewa");

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * (Number(item.quantity) || 1),
    0,
  );
  const total = subtotal;

  const handleConfirm = () => {
    navigate("/");
  };

  return (
    <div className="checkout-page">
      <Navbar />

      <main className="checkout-main">
        <div className="checkout-header">
          <h1>Checkout</h1>
        </div>

        <div className="checkout-body">
          {/* ── Left: Payment methods ── */}
          <section className="checkout-methods-section">
            <h2 className="checkout-section-label">Payment Method</h2>
            <div className="checkout-methods-list">
              {PAYMENT_METHODS.map((method) => (
                <button
                  key={method.id}
                  type="button"
                  className={`checkout-method-item${selectedMethod === method.id ? " selected" : ""}`}
                  onClick={() => setSelectedMethod(method.id)}
                >
                  <span className="checkout-method-icon">{method.icon}</span>
                  <span className="checkout-method-name">{method.label}</span>
                  {selectedMethod === method.id && (
                    <span className="checkout-method-check">&#10003;</span>
                  )}
                </button>
              ))}
            </div>
          </section>

          {/* ── Right: Order summary ── */}
          <aside className="checkout-summary">
            <h2 className="checkout-section-label">Order Summary</h2>

            <div className="checkout-items-list">
              {cartItems.length === 0 ? (
                <p className="checkout-empty">Your cart is empty.</p>
              ) : (
                cartItems.map((item) => (
                  <div className="checkout-item-row" key={item.key}>
                    <div className="checkout-item-thumb">
                      {item.image ? (
                        <img src={item.image} alt={item.title} />
                      ) : (
                        <div className="checkout-item-thumb-placeholder" />
                      )}
                    </div>
                    <div className="checkout-item-info">
                      <span className="checkout-item-title">{item.title}</span>
                    </div>
                    <span className="checkout-item-price">
                      {(item.price * (Number(item.quantity) || 1)).toFixed(2)}{" "}
                      NPR
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="checkout-totals">
              <div className="checkout-total-row">
                <span>Price</span>
                <span>{subtotal.toFixed(2)} NPR</span>
              </div>
              <div className="checkout-total-row checkout-grand-total">
                <span>Total</span>
                <strong>{total.toFixed(2)} NPR</strong>
              </div>
            </div>

            <button
              type="button"
              className="checkout-confirm-btn"
              onClick={handleConfirm}
              disabled={cartItems.length === 0}
            >
              Confirm Payment
            </button>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default Checkout;
