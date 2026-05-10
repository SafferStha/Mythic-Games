import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import "./Navbar.css";
import logo from "../assets/MythicLogo.png";
import { useTheme } from "../contexts/ThemeContext";
import { useGameLibrary } from "../contexts/GameLibraryContext.jsx";

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const { cartCount } = useGameLibrary();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <>
      <aside className={sidebarOpen ? "sidebar sidebar-open" : "sidebar"}>
        <div className="sidebar-logo">
          <Link to="/" onClick={closeSidebar}>
            <img src={logo} alt="Mythic Games" />
          </Link>
        </div>

        <nav className="sidebar-nav">
          <span className="sidebar-section-label">Store</span>

          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              isActive ? "sidebar-link active" : "sidebar-link"
            }
            onClick={closeSidebar}
          >
            <i className="bx bx-store" />
            <span>Home</span>
          </NavLink>

          <NavLink
            to="/discover"
            className={({ isActive }) =>
              isActive ? "sidebar-link active" : "sidebar-link"
            }
            onClick={closeSidebar}
          >
            <i className="bx bx-compass" />
            <span>Discover</span>
          </NavLink>

          <NavLink
            to="/browse"
            className={({ isActive }) =>
              isActive ? "sidebar-link active" : "sidebar-link"
            }
            onClick={closeSidebar}
          >
            <i className="bx bx-grid-alt" />
            <span>Browse</span>
          </NavLink>

          <NavLink
            to="/news"
            className={({ isActive }) =>
              isActive ? "sidebar-link active" : "sidebar-link"
            }
            onClick={closeSidebar}
          >
            <i className="bx bx-news" />
            <span>News</span>
          </NavLink>

          <hr className="sidebar-divider" />

          <span className="sidebar-section-label">Library</span>

          <NavLink
            to="/wishlist"
            className={({ isActive }) =>
              isActive ? "sidebar-link active" : "sidebar-link"
            }
            onClick={closeSidebar}
          >
            <i className="bx bx-heart" />
            <span>Wishlist</span>
          </NavLink>

          <NavLink
            to="/gifts"
            className={({ isActive }) =>
              isActive ? "sidebar-link active" : "sidebar-link"
            }
            onClick={closeSidebar}
          >
            <i className="bx bx-gift" />
            <span>Gifts</span>
          </NavLink>

          <NavLink
            to="/cart"
            className={({ isActive }) =>
              isActive ? "sidebar-link active" : "sidebar-link"
            }
            onClick={closeSidebar}
          >
            <i className="bx bx-cart" />
            <span>Cart</span>
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <span>Mythic Games &copy; 2025</span>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={closeSidebar} />
      )}

      <header className="topbar">
        <button
          type="button"
          className="hamburger-btn"
          onClick={() => setSidebarOpen((prev) => !prev)}
          aria-label="Toggle navigation"
        >
          <i className="bx bx-menu" />
        </button>

        <div className="search-wrapper">
          <i className="bx bx-search search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search store..."
            aria-label="Search store"
          />
        </div>

        <div className="topbar-actions">
          <button
            type="button"
            className="topbar-icon-btn"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            <i className={`bx ${theme === "dark" ? "bx-sun" : "bx-moon"}`} />
          </button>

          <Link
            to="/account"
            className="topbar-icon-btn topbar-profile-btn"
            aria-label="Account"
          >
            <i className="bx bx-user-circle" />
          </Link>
        </div>
      </header>
    </>
  );
};

export default Navbar;
