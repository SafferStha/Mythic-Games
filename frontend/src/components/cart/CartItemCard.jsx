import "./CartItemCard.css";

const CartItemCard = ({
  title,
  price,
  image,
  platform,
  quantity = 1,
  onRemove,
  onMoveToWishlist,
  removeLabel = "Remove",
  primaryActionLabel = "Move to wishlist",
}) => {
  const formattedPrice = Number(price).toFixed(2);

  return (
    <article className="cart-item">
      <div className="cart-item-thumb">
        {image ? (
          <img src={image} alt={title} />
        ) : (
          <div className="cart-item-placeholder" aria-hidden="true" />
        )}
      </div>

      <div className="cart-item-body">
        <p className="cart-item-title">{title}</p>
        {platform && <p className="cart-item-platform">{platform}</p>}
        <p className="cart-item-meta">Qty: {quantity}</p>
      </div>

      <div className="cart-item-right">
        <p className="cart-item-price">{formattedPrice} NPR</p>
        <div className="cart-item-actions">
          <button type="button" className="cart-item-link" onClick={onRemove}>
            {removeLabel}
          </button>
          <button
            type="button"
            className="cart-item-primary"
            onClick={onMoveToWishlist}
          >
            {primaryActionLabel}
          </button>
        </div>
      </div>
    </article>
  );
};

export default CartItemCard;
