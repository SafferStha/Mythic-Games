import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import CartItemCard from "../components/cart/CartItemCard";
import CartSummaryCard from "../components/cart/CartSummaryCard";
import "./Cart.css";
import { useGameLibrary } from "../contexts/GameLibraryContext.jsx";

const Cart = () => {
  const { cartItems, moveCartItemToWishlist, removeFromCart } =
    useGameLibrary();

  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );
  const taxes = 0;
  const total = subtotal + taxes;

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
                  primaryActionLabel="Move to wishlist"
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
                { label: "Subtotal", value: `${subtotal.toFixed(2)} NPR` },
                { label: "Taxes", value: `${taxes.toFixed(2)} NPR` },
                {
                  label: "Total",
                  value: `${total.toFixed(2)} NPR`,
                  isTotal: true,
                },
              ]}
              actionLabel="Check Out"
              onAction={() => {}}
            />
          </aside>
        </div>
      </main>
    </div>
  );
};

export default Cart;
