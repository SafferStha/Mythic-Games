import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import CartItemCard from "../components/cart/CartItemCard";
import CartSummaryCard from "../components/cart/CartSummaryCard";
import "./Cart.css";
import { useGameLibrary } from "../contexts/GameLibraryContext.jsx";

const formatAmount = (amount) => `Rs. ${Number(amount || 0).toFixed(2)}`;

const Cart = () => {
  const navigate = useNavigate();
  const { cartItems, moveCartItemToWishlist, removeFromCart, isInWishlist } =
    useGameLibrary();
  const [showCheckoutPopup, setShowCheckoutPopup] = useState(false);

  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );
  const taxes = 0;
  const total = subtotal + taxes;

  const openCheckoutPopup = () => {
    if (cartItems.length === 0) return;
    setShowCheckoutPopup(true);
  };

  const closeCheckoutPopup = () => setShowCheckoutPopup(false);

  const proceedToCheckout = () => {
    closeCheckoutPopup();
    navigate("/checkout");
  };

  return (
    <div className="cart-page">
      <Navbar />

      <main className="cart-main">
        <div className="cart-header">
          <h1 className="cart-page-title">Cart</h1>
          <span className="cart-item-count">
            {cartItems.length} item{cartItems.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="cart-body">
          <div className="cart-items">
            {cartItems.length > 0 ? (
              cartItems.map((item) => (
                <CartItemCard
                  key={item.key}
                  title={item.title}
                  price={item.price}
                  quantity={item.quantity}
                  image={item.image}
                  platform={item.platform}
                  onRemove={() => removeFromCart(item.key)}
                  onMoveToWishlist={() => moveCartItemToWishlist(item.key)}
                  primaryActionLabel={
                    isInWishlist(item)
                      ? "Already on wishlist"
                      : "Move to wishlist"
                  }
                />
              ))
            ) : (
              <div className="cart-empty">
                <div className="cart-empty-icon" aria-hidden="true">
                  🛒
                </div>
                <h2>Your cart is empty</h2>
                <p>Find your next favourite game and add it to your cart.</p>
                <Link to="/discover" className="cart-empty-link">
                  Browse Games
                </Link>
              </div>
            )}
          </div>

          <aside className="cart-aside">
            <CartSummaryCard
              title="Order Summary"
              rows={[
                { label: "Subtotal", value: formatAmount(subtotal) },
                { label: "Taxes", value: formatAmount(taxes) },
                {
                  label: "Total",
                  value: formatAmount(total),
                  isTotal: true,
                },
              ]}
              actionLabel="Check Out"
              onAction={openCheckoutPopup}
              navigateTo={null}
            />
          </aside>
        </div>
      </main>

      {showCheckoutPopup && (
        <>
          <div className="cart-checkout-overlay" onClick={closeCheckoutPopup} />
          <div
            className="cart-checkout-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-checkout-title"
          >
            <div className="cart-checkout-header">
              <div>
                <p className="cart-checkout-badge">Demo Payment Gateway</p>
                <h2 id="cart-checkout-title">Checkout</h2>
              </div>
              <button
                type="button"
                className="cart-checkout-close"
                onClick={closeCheckoutPopup}
                aria-label="Close checkout popup"
              >
                ×
              </button>
            </div>

            <div className="cart-checkout-content">
              <div className="cart-checkout-items">
                {cartItems.map((item) => (
                  <div className="cart-checkout-item" key={item.key}>
                    <div className="cart-checkout-thumb">
                      {item.image ? (
                        <img src={item.image} alt={item.title} />
                      ) : (
                        <div className="cart-checkout-thumb-placeholder" />
                      )}
                    </div>
                    <div className="cart-checkout-copy">
                      <strong>{item.title}</strong>
                      <span>{item.platform}</span>
                    </div>
                    <div className="cart-checkout-price">
                      {formatAmount(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="cart-checkout-summary">
                <div className="cart-checkout-row">
                  <span>Subtotal</span>
                  <strong>{formatAmount(subtotal)}</strong>
                </div>
                <div className="cart-checkout-row">
                  <span>Taxes</span>
                  <strong>{formatAmount(taxes)}</strong>
                </div>
                <div className="cart-checkout-row total">
                  <span>Total</span>
                  <strong>{formatAmount(total)}</strong>
                </div>
              </div>
            </div>

            <div className="cart-checkout-actions">
              <button
                type="button"
                className="cart-checkout-btn cart-checkout-btn-secondary"
                onClick={closeCheckoutPopup}
              >
                Continue Shopping
              </button>
              <button
                type="button"
                className="cart-checkout-btn cart-checkout-btn-primary"
                onClick={proceedToCheckout}
              >
                Proceed to Payment
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;
