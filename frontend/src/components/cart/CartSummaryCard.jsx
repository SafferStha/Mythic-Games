import { useNavigate } from "react-router-dom";
import "./CartSummaryCard.css";

const CartSummaryCard = ({
  title,
  rows,
  actionLabel,
  onAction,
  navigateTo = "/checkout",
}) => {
  const navigate = useNavigate();

  const handleAction = () => {
    if (onAction) onAction();
    if (navigateTo) navigate(navigateTo);
  };

  return (
    <section className="cart-summary">
      <h3 className="cart-summary-title">{title}</h3>

      <div className="cart-summary-rows">
        {rows.map((row) => (
          <div
            key={row.label}
            className={`cart-summary-row${row.isTotal ? " cart-summary-row-total" : ""}`}
          >
            <span>{row.label}</span>
            <strong>{row.value}</strong>
          </div>
        ))}
      </div>

      <button type="button" className="cart-summary-btn" onClick={handleAction}>
        {actionLabel}
      </button>
    </section>
  );
};

export default CartSummaryCard;
