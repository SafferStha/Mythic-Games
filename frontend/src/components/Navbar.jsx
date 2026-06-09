import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import "./Navbar.css";
import logo from "../assets/MythicLogo.png";
import { useTheme } from "../contexts/ThemeContext";
import { useGameLibrary } from "../contexts/GameLibraryContext.jsx";
import { clearStoredUser, getStoredUser } from "../utils/auth";

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const { cartCount, wishlistCount } = useGameLibrary();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(() => getStoredUser());

  useEffect(() => {
    const syncAuthState = () => setCurrentUser(getStoredUser());

    window.addEventListener('storage', syncAuthState);
    window.addEventListener('auth-changed', syncAuthState);
    window.addEventListener('focus', syncAuthState);

    return () => {
      window.removeEventListener('storage', syncAuthState);
      window.removeEventListener('auth-changed', syncAuthState);
      window.removeEventListener('focus', syncAuthState);
    };
  }, []);

  const menuLabel = useMemo(
    () => {
      if (!currentUser) {
        return 'Sign-in';
      }

      return currentUser.role === 'admin' ? 'Admin panel' : 'My account';
    },
    [currentUser]
  );

  const isAdmin = currentUser?.role === 'admin';

  const handleSignOut = () => {
    clearStoredUser();
    navigate('/discover');
  };

  return (
    <header className="navbar">
      {/* ── Row 1: Logo + right actions ── */}
      <div className="nav-top">
        <div className="nav-brand-wrap">
          <Link to="/" className="nav-logo">
            <img src={logo} alt="Mythic Games" />
          </Link>
          <span className="nav-brand-name">Mythic Games</span>
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
          <div className="nav-profile-wrap">
            <button
              type="button"
              className="nav-profile-btn"
              aria-label="Open account menu"
            >
              <i className="bx bx-user-circle" aria-hidden="true" />
            </button>
            <div className="nav-profile-menu" role="menu" aria-label="Account menu">
              {currentUser ? (
                <>
                 {isAdmin ? (
  <>
    <Link
      to="/manage-games"
      className="nav-profile-menu-item"
      role="menuitem"
    >
      <i className="bx bx-game" aria-hidden="true" />
      <span>Manage Games</span>
    </Link>

    <Link
      to="/manage-news"
      className="nav-profile-menu-item"
      role="menuitem"
    >
      <i className="bx bx-news" aria-hidden="true" />
      <span>Manage News</span>
    </Link>

    <Link
      to="/manage-users"
      className="nav-profile-menu-item"
      role="menuitem"
    >
      <i className="bx bx-group" aria-hidden="true" />
      <span>Manage Users</span>
    </Link>
  </>
) : (
                    <>
                      <Link to="/account" className="nav-profile-menu-item" role="menuitem">
                        <i className="bx bx-user" aria-hidden="true" />
                        <span>{menuLabel}</span>
                      </Link>
                      <Link to="/library" className="nav-profile-menu-item" role="menuitem">
                        <i className="bx bx-library" aria-hidden="true" />
                        <span>My library</span>
                      </Link>
                      <Link to="/wishlist" className="nav-profile-menu-item" role="menuitem">
                        <i className="bx bx-heart" aria-hidden="true" />
                        <span>Wishlist</span>
                      </Link>
                    </>
                  )}
                  <button
                    type="button"
                    className="nav-profile-menu-item nav-profile-menu-button"
                    role="menuitem"
                    onClick={handleSignOut}
                  >
                    <i className="bx bx-log-out" aria-hidden="true" />
                    <span>Sign-out</span>
                  </button>
                </>
              ) : (
                <Link to="/login" className="nav-profile-menu-item" role="menuitem">
                  <i className="bx bx-log-in" aria-hidden="true" />
                  <span>{menuLabel}</span>
                </Link>
              )}
            </div>
          </div>
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
            <span className="nav-link-text">Wishlist</span>
            <i className="bx bx-heart nav-link-icon" aria-hidden="true" />
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
            <span className="nav-link-text">Gifts</span>
            <i className="bx bx-gift nav-link-icon" aria-hidden="true" />
          </NavLink>
          <NavLink
            to="/cart"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            <span className="nav-link-text">Cart</span>
            <i className="bx bx-cart nav-link-icon" aria-hidden="true" />
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
