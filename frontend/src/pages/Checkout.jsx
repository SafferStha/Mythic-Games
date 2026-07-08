import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useGameLibrary } from "../contexts/GameLibraryContext.jsx";
import {
  claimFreeGames,
  createBulkDemoCheckout,
} from "../services/paymentService";
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
  isFree:
    Boolean(game?.isFree ?? game?.is_free) || Number(game?.price || 0) <= 0,
});

const formatAmount = (amount) => `Rs. ${Number(amount || 0).toFixed(2)}`;

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cartItems, removeCartItemByGameId, markGamesAsOwned } =
    useGameLibrary();
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

  const [selectedGameIds, setSelectedGameIds] = useState(() =>
    checkoutItems.map((item) => item.id),
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setSelectedGameIds((current) => {
      const validCurrent = current.filter((selectedId) =>
        checkoutItems.some((game) => String(game.id) === String(selectedId)),
      );

      return validCurrent.length > 0
        ? validCurrent
        : checkoutItems.map((item) => item.id);
    });
  }, [checkoutItems]);

  const selectedItems = useMemo(
    () =>
      checkoutItems.filter((game) =>
        selectedGameIds.some(
          (selectedId) => String(selectedId) === String(game.id),
        ),
      ),
    [checkoutItems, selectedGameIds],
  );

  const freeItems = useMemo(
    () =>
      selectedItems.filter((item) => item.isFree || Number(item.price) <= 0),
    [selectedItems],
  );

  const paidItems = useMemo(
    () =>
      selectedItems.filter((item) => !item.isFree && Number(item.price) > 0),
    [selectedItems],
  );

  const totalAmount = useMemo(
    () =>
      checkoutItems.reduce(
        (sum, item) =>
          sum + Number(item.price || 0) * Number(item.quantity || 1),
        0,
      ),
    [checkoutItems],
  );

  const payableAmount = useMemo(
    () =>
      paidItems.reduce(
        (sum, item) =>
          sum + Number(item.price || 0) * Number(item.quantity || 1),
        0,
      ),
    [paidItems],
  );

  const allSelected =
    checkoutItems.length > 0 && selectedItems.length === checkoutItems.length;
  const freeOnlyCheckout = selectedItems.length > 0 && paidItems.length === 0;

  const toggleGameSelection = (gameId) => {
    setSelectedGameIds((current) => {
      const exists = current.some(
        (selectedId) => String(selectedId) === String(gameId),
      );

      if (exists) {
        return current.filter(
          (selectedId) => String(selectedId) !== String(gameId),
        );
      }

      return [...current, gameId];
    });
  };

  const toggleSelectAll = () => {
    setSelectedGameIds(allSelected ? [] : checkoutItems.map((item) => item.id));
  };

  const applyOwnedGamesLocally = (items) => {
    items.forEach((item) => removeCartItemByGameId(item.id));
    markGamesAsOwned(items);
  };

  const handleProceed = async () => {
    if (selectedItems.length === 0 || !userId) {
      setError("Please select at least one valid item before proceeding.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      if (freeOnlyCheckout) {
        const freeClaimPayload = await claimFreeGames({
          userId,
          gameIds: freeItems.map((item) => item.id),
        });

        applyOwnedGamesLocally(freeItems);

        const freePaymentIds = freeClaimPayload.data.paymentIds || [];
        const freeBatchQuery = freePaymentIds.length
          ? `?batch=${encodeURIComponent(freePaymentIds.join(","))}`
          : "";

        navigate(`/payment/success/${freePaymentIds[0]}${freeBatchQuery}`, {
          state: {
            payments: freeClaimPayload.data.payments || [],
            checkoutItems: freeItems,
            totalAmount: 0,
          },
        });
        return;
      }

      const payload = await createBulkDemoCheckout({
        userId,
        gameIds: paidItems.map((item) => item.id),
        paymentMethod: DEFAULT_PAYMENT_METHOD,
      });

      const paymentIds = payload.data.paymentIds || [];
      const batchQuery = paymentIds.length
        ? `?batch=${encodeURIComponent(paymentIds.join(","))}`
        : "";

      navigate(
        `/payment/${DEFAULT_PAYMENT_METHOD}/${payload.data.paymentId}${batchQuery}`,
        {
          state: {
            checkoutItems: selectedItems,
            paidItems,
            freeItems,
            totalAmount: payableAmount,
            paymentIds,
          },
        },
      );
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
            Review your cart, select one or more games, or use select all to pay
            for everything at once. Free games are claimed instantly and do not
            require payment details.
          </p>
        </div>

        <div className="checkout-body">
          <section className="checkout-panel">
            <div className="checkout-panel-heading">
              <h2 className="checkout-section-label">Items</h2>
              <div className="checkout-selection-actions">
                <span className="checkout-item-count">
                  {selectedItems.length} of {checkoutItems.length} selected
                </span>
                {checkoutItems.length > 0 && (
                  <button
                    type="button"
                    className="checkout-select-all-btn"
                    onClick={toggleSelectAll}
                  >
                    {allSelected ? "Clear All" : "Select All"}
                  </button>
                )}
              </div>
            </div>

            {checkoutItems.length === 0 ? (
              <p className="checkout-empty">
                No game selected. Add a game to cart or use Buy Now.
              </p>
            ) : (
              <div className="checkout-game-list">
                {checkoutItems.map((game) => {
                  const isSelected = selectedGameIds.some(
                    (selectedId) => String(selectedId) === String(game.id),
                  );

                  return (
                    <button
                      key={game.key}
                      type="button"
                      className={`checkout-game-card ${isSelected ? "selected" : ""}`}
                      onClick={() => toggleGameSelection(game.id)}
                    >
                      <span className="checkout-game-check" aria-hidden="true">
                        {isSelected ? "✓" : ""}
                      </span>
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
                        {game.isFree ? "Free" : formatAmount(game.price)}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          <aside className="checkout-summary">
            <h2 className="checkout-section-label">Order Summary</h2>

            {checkoutItems.length > 0 ? (
              <>
                <div className="checkout-summary-items">
                  <div className="checkout-summary-row">
                    <span>Selected Items</span>
                    <strong>
                      {selectedItems.length} item
                      {selectedItems.length !== 1 ? "s" : ""}
                    </strong>
                  </div>
                  <div className="checkout-summary-row">
                    <span>Paid Items</span>
                    <strong>
                      {paidItems.length} item
                      {paidItems.length !== 1 ? "s" : ""}
                    </strong>
                  </div>
                  <div className="checkout-summary-row">
                    <span>Free Items</span>
                    <strong>
                      {freeItems.length} item
                      {freeItems.length !== 1 ? "s" : ""}
                    </strong>
                  </div>
                  <div className="checkout-summary-row">
                    <span>Cart Total</span>
                    <strong>{formatAmount(totalAmount)}</strong>
                  </div>
                </div>
                <div className="checkout-summary-total-row">
                  <span>{freeOnlyCheckout ? "Claim Now" : "Pay Now"}</span>
                  <strong>{formatAmount(payableAmount)}</strong>
                </div>
                <div className="checkout-summary-note">
                  {freeOnlyCheckout
                    ? "All selected games are free. No payment form will be shown."
                    : freeItems.length > 0
                      ? "Only paid games will go to the payment gateway. Free games will be claimed automatically after successful payment."
                      : "On the next screen you can choose eSewa, Khalti, or view the card option for paid games."}
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
              disabled={selectedItems.length === 0 || submitting}
            >
              {submitting
                ? freeOnlyCheckout
                  ? "Claiming Free Games..."
                  : "Preparing Demo Gateway..."
                : freeOnlyCheckout
                  ? "Claim for Free"
                  : "Proceed to Payment"}
            </button>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default Checkout;
