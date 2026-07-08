import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import "./Navbar.css";
import logo from "../assets/MythicLogo.png";
import { useTheme } from "../contexts/ThemeContext";
import { useGameLibrary } from "../contexts/GameLibraryContext.jsx";
import { clearStoredUser, getStoredUser } from "../utils/auth";
import { API_BASE_URL } from "../utils/api";
import {
  NEWS_UPDATED_EVENT,
  countUnreadNews,
  markNewsSeen,
} from "../utils/newsNotifications";

const NEWS_API_URL = `${API_BASE_URL}/api/news`;

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const { cartCount, wishlistCount } = useGameLibrary();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(() => getStoredUser());
  const [storeSearch, setStoreSearch] = useState("");
  const [unreadNewsCount, setUnreadNewsCount] = useState(0);

  useEffect(() => {
    const syncAuthState = () => setCurrentUser(getStoredUser());

    window.addEventListener("storage", syncAuthState);
    window.addEventListener("auth-changed", syncAuthState);
    window.addEventListener("focus", syncAuthState);

    return () => {
      window.removeEventListener("storage", syncAuthState);
      window.removeEventListener("auth-changed", syncAuthState);
      window.removeEventListener("focus", syncAuthState);
    };
  }, []);

  const menuLabel = useMemo(() => {
    if (!currentUser) {
      return "Sign-in";
    }

    return currentUser.role === "admin" ? "Manage games" : "My account";
  }, [currentUser]);

  const isAdmin = currentUser?.role === "admin";

  useEffect(() => {
    let cancelled = false;

    const loadUnreadNewsCount = async () => {
      try {
        const response = await fetch(NEWS_API_URL);
        const payload = await response.json();

        if (!response.ok) return;

        const articles = payload.data || [];

        if (location.pathname === "/news") {
          markNewsSeen(articles, false);
          if (!cancelled) setUnreadNewsCount(0);
          return;
        }

        if (!cancelled) {
          setUnreadNewsCount(countUnreadNews(articles));
        }
      } catch {
        if (!cancelled) setUnreadNewsCount(0);
      }
    };

    loadUnreadNewsCount();

    const intervalId = window.setInterval(loadUnreadNewsCount, 30000);

    window.addEventListener("focus", loadUnreadNewsCount);
    window.addEventListener(NEWS_UPDATED_EVENT, loadUnreadNewsCount);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      window.removeEventListener("focus", loadUnreadNewsCount);
      window.removeEventListener(NEWS_UPDATED_EVENT, loadUnreadNewsCount);
    };
  }, [location.pathname]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setStoreSearch(params.get("search") || "");
  }, [location.search]);

  const handleSignOut = () => {
    clearStoredUser();
    navigate("/discover");
  };

  const handleStoreSearch = (event) => {
    event.preventDefault();
    const query = storeSearch.trim();

    navigate(query ? `/browse?search=${encodeURIComponent(query)}` : "/browse");
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
              {currentUser?.profile_image ? (
                <img
                  src={
                    currentUser.profile_image.startsWith("http")
                      ? currentUser.profile_image
                      : `${API_BASE_URL}${currentUser.profile_image}`
                  }
                  alt="Profile"
                  className="nav-profile-avatar"
                />
              ) : (
                <i className="bx bx-user-circle" aria-hidden="true" />
              )}
            </button>
            <div
              className="nav-profile-menu"
              role="menu"
              aria-label="Account menu"
            >
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
                        <span>{menuLabel}</span>
                      </Link>
                      <Link
                        to="/manage-news"
                        className="nav-profile-menu-item"
                        role="menuitem"
                      >
                        <i className="bx bx-news" aria-hidden="true" />
                        <span>Manage news</span>
                      </Link>
                      <Link
                        to="/manage-payments"
                        className="nav-profile-menu-item"
                        role="menuitem"
                      >
                        <i className="bx bx-credit-card" aria-hidden="true" />
                        <span>Manage payments</span>
                      </Link>
                      <Link
                        to="/manage-users"
                        className="nav-profile-menu-item"
                        role="menuitem"
                      >
                        <i className="bx bx-user-x" aria-hidden="true" />
                        <span>Manage users</span>
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/account"
                        className="nav-profile-menu-item"
                        role="menuitem"
                      >
                        <i className="bx bx-user" aria-hidden="true" />
                        <span>{menuLabel}</span>
                      </Link>
                      <Link
                        to="/library"
                        className="nav-profile-menu-item"
                        role="menuitem"
                      >
                        <i className="bx bx-library" aria-hidden="true" />
                        <span>My library</span>
                      </Link>
                      <Link
                        to="/wishlist"
                        className="nav-profile-menu-item"
                        role="menuitem"
                      >
                        <i className="bx bx-heart" aria-hidden="true" />
                        <span>Wishlist</span>
                      </Link>
                      <Link
                        to="/purchase-history"
                        className="nav-profile-menu-item"
                        role="menuitem"
                      >
                        <i className="bx bx-receipt" aria-hidden="true" />
                        <span>Purchase history</span>
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
                <Link
                  to="/login"
                  className="nav-profile-menu-item"
                  role="menuitem"
                >
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
        <form className="nav-search-wrap" onSubmit={handleStoreSearch}>
          <input
            type="search"
            placeholder="Search store"
            className="nav-search"
            value={storeSearch}
            onChange={(event) => setStoreSearch(event.target.value)}
            aria-label="Search store"
          />
          <button
            type="submit"
            className="nav-search-icon"
            aria-label="Search store"
          >
            <i className="bx bx-search" aria-hidden="true" />
          </button>
        </form>

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
            {!isAdmin && unreadNewsCount > 0 && (
              <span className="nav-news-badge">{unreadNewsCount}</span>
            )}
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
