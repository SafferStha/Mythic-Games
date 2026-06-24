import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useGameLibrary } from "../contexts/GameLibraryContext.jsx";
import { createDemoCheckout } from "../services/paymentService";
import { getStoredUser } from "../utils/auth";
import "./Checkout.css";

const DEFAULT_PAYMENT_METHOD = "esewa";

const normalizeGame = (game) => ({
  id: game?.id,
  key: String(game?.key || game?.id || game?.title || Math.random()),
  title: game?.title || "Game Name",
  price: Number(game?.price || 0),
  image: game?.image || game?.image_url || "",
  type: game?.type || game?.game_type || "Base Game",
  quantity: Number(game?.quantity || 1),
});

const formatAmount = (amount) => `Rs. ${Number(amount || 0).toFixed(2)}`;

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cartItems } = useGameLibrary();
  const currentUser = getStoredUser();
  const userId = currentUser?.uid ?? currentUser?.user_id;

  const checkoutItems = useMemo(() => {
    const options = [];
    const stateGame = location.state?.selectedGame;

    if (stateGame?.id) {
      options.push(normalizeGame(stateGame));
    }

    cartItems.forEach((item) => {
      const normalized = normalizeGame(item);
      if (
        !options.some((entry) => String(entry.id) === String(normalized.id))
      ) {
        options.push(normalized);
      }
    });

    return options;
  }, [cartItems, location.state]);

  const [selectedGameId, setSelectedGameId] = useState(
    () => checkoutItems[0]?.id ?? null,
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const selectedGame =
    checkoutItems.find((game) => String(game.id) === String(selectedGameId)) ||
    null;

  const totalAmount = useMemo(
    () =>
      checkoutItems.reduce(
        (sum, item) =>
          sum + Number(item.price || 0) * Number(item.quantity || 1),
        0,
      ),
    [checkoutItems],
  );

  useEffect(() => {
    if (!selectedGameId && checkoutItems.length > 0) {
      setSelectedGameId(checkoutItems[0].id);
    }
  }, [checkoutItems, selectedGameId]);

  const handleProceed = async () => {
    if (!selectedGame?.id || !userId) {
      setError("Please select a valid item before proceeding to payment.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      const payload = await createDemoCheckout({
        userId,
        gameId: selectedGame.id,
        paymentMethod: DEFAULT_PAYMENT_METHOD,
      });

      navigate(`/payment/${DEFAULT_PAYMENT_METHOD}/${payload.data.paymentId}`, {
        state: {
          checkoutItems,
          totalAmount,
          selectedGameId: selectedGame.id,
        },
      });
    } catch (checkoutError) {
      setError(checkoutError.message || "Failed to start demo payment flow.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="checkout-page">
      <Navbar />

      <main className="checkout-main">
        <div className="checkout-header">
          <p className="checkout-notice">Demo Payment Gateway</p>
          <h1>Checkout</h1>
          <p className="checkout-subtitle">
            Review your items and continue to the payment screen. Payment
            methods will appear only after you click proceed.
          </p>
        </div>

        <div className="checkout-body">
          <section className="checkout-panel">
            <div className="checkout-panel-heading">
              <h2 className="checkout-section-label">Items</h2>
              <span className="checkout-item-count">
                {checkoutItems.length} item
                {checkoutItems.length !== 1 ? "s" : ""}
              </span>
            </div>

            {checkoutItems.length === 0 ? (
              <p className="checkout-empty">
                No game selected. Add a game to cart or use Buy Now.
              </p>
            ) : (
              <div className="checkout-game-list">
                {checkoutItems.map((game) => (
                  <button
                    key={game.key}
                    type="button"
                    className={`checkout-game-card ${String(selectedGameId) === String(game.id) ? "selected" : ""}`}
                    onClick={() => setSelectedGameId(game.id)}
                  >
                    <div className="checkout-game-thumb">
                      {game.image ? (
                        <img src={game.image} alt={game.title} />
                      ) : (
                        <div className="checkout-game-thumb-placeholder" />
                      )}
                    </div>
                    <div className="checkout-game-info">
                      <strong>{game.title}</strong>
                      <span>{game.type}</span>
                    </div>
                    <span className="checkout-game-price">
                      {formatAmount(game.price)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </section>

          <aside className="checkout-summary">
            <h2 className="checkout-section-label">Order Summary</h2>

            {checkoutItems.length > 0 ? (
              <>
                <div className="checkout-summary-items">
                  {checkoutItems.map((item) => (
                    <div className="checkout-summary-row" key={item.key}>
                      <span>{item.title}</span>
                      <strong>{formatAmount(item.price)}</strong>
                    </div>
                  ))}
                </div>
                <div className="checkout-summary-total-row">
                  <span>Total</span>
                  <strong>{formatAmount(totalAmount)}</strong>
                </div>
                <div className="checkout-summary-note">
                  On the next screen you can choose eSewa, Khalti, or view the
                  card option.
                </div>
              </>
            ) : (
              <p className="checkout-empty">Select a game to continue.</p>
            )}

            {error && <p className="checkout-error">{error}</p>}

            <button
              type="button"
              className="checkout-confirm-btn"
              onClick={handleProceed}
              disabled={!selectedGame || submitting}
            >
              {submitting ? "Preparing Demo Gateway..." : "Proceed to Payment"}
            </button>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default Checkout;
