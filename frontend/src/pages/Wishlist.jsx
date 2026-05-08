import Navbar from "../components/Navbar";
import CartItemCard from "../components/cart/CartItemCard";
import { useGameLibrary } from "../contexts/GameLibraryContext.jsx";
import "./Wishlist.css";

const Wishlist = () => {
  const { wishlistItems, moveWishlistItemToCart, removeFromWishlist } =
    useGameLibrary();

  return (
    <div className="wishlist-page">
      <Navbar />

      <main className="wishlist-main">
        <div className="wishlist-header">
          <h1>Wishlist</h1>
          <span>
            {wishlistItems.length} item{wishlistItems.length !== 1 ? "s" : ""}
          </span>
        </div>

        {wishlistItems.length > 0 ? (
          <div className="wishlist-list">
            {wishlistItems.map((item) => (
              <CartItemCard
                key={item.key}
                title={item.title}
                price={item.price}
                quantity={item.quantity}
                image={item.image}
                platform={item.platform}
                onRemove={() => removeFromWishlist(item.key)}
                onMoveToWishlist={() => moveWishlistItemToCart(item.key)}
                removeLabel="Remove"
                primaryActionLabel="Move to cart"
              />
            ))}
          </div>
        ) : (
          <div className="wishlist-empty">
            <div className="wishlist-empty-icon" aria-hidden="true">
              ♡
            </div>
            <h2>Your wishlist is empty</h2>
            <p>Open a game page and save it here to come back to it later.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Wishlist;
