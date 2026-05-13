import { Link, NavLink } from "react-router-dom";
import "./Navbar.css";
import logo from "../assets/MythicLogo.png";
import { useTheme } from "../contexts/ThemeContext";
import { useGameLibrary } from "../contexts/GameLibraryContext.jsx";

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const { cartCount, wishlistCount } = useGameLibrary();

  return (
    <header className="navbar">
      {/* ── Row 1: Logo + right actions ── */}
      <div className="nav-top">
        <div className="nav-brand-wrap">
          <Link to="/" className="nav-logo">
            <img src={logo} alt="Mythic Games" />
          </Link>
          <span className="nav-brand-name">Mythic Games Store</span>
        </div>

        <div className="nav-top-right">
          <button
            type="button"
            className="nav-icon-btn"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            <i className={`bx ${theme === "dark" ? "bx-sun" : "bx-moon"}`} />
          </button>
          <Link to="/login" className="nav-signin-btn">
            Sign-in
          </Link>
        </div>
      </div>

      {/* ── Row 2: Search + links (indented to align with brand name) ── */}
      <div className="nav-bottom">
        <span className="nav-bottom-spacer" aria-hidden="true" />
        <div className="nav-search-wrap">
          <input
            type="text"
            placeholder="Search store"
            className="nav-search"
          />
          <i className="bx bx-search nav-search-icon" />
        </div>

        <nav className="nav-links">
          <NavLink
            to="/discover"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            Discover
          </NavLink>
          <NavLink
            to="/browse"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            Browse
          </NavLink>
          <NavLink
            to="/news"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            News
          </NavLink>
        </nav>

        <div className="nav-right-links">
          <NavLink
            to="/wishlist"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            Wishlist{" "}
            {wishlistCount > 0 && (
              <span className="nav-cart-badge">{wishlistCount}</span>
            )}
          </NavLink>
          <NavLink
            to="/gifts"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            Gifts
          </NavLink>
          <NavLink
            to="/cart"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            Cart{" "}
            {cartCount > 0 && (
              <span className="nav-cart-badge">{cartCount}</span>
            )}
          </NavLink>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
