import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import './Navbar.css';
import logo from '../assets/MythicLogo.png';
import { useTheme } from '../contexts/ThemeContext';
import { useGameLibrary } from '../contexts/GameLibraryContext.jsx';

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const { cartCount } = useGameLibrary();

  return (
    <header>
      <nav className="upper-nav">
        <div className="nav-div">
          <div className="logo"><Link to="/"><img src={logo} alt="MythicLogo" /></Link></div>

          <ul className="left-menu">
            <li>
              <NavLink
                to="/store"
                className={({ isActive }) => (isActive ? 'nav-link active-link' : 'nav-link')}
              >
                Mythic Games
              </NavLink>
            </li>
          </ul>

          <ul className="right-menu">
            <li
              className="theme-toggle"
              onClick={toggleTheme}
              role="button"
              aria-label="Toggle theme"
            >
              <i className={`bx ${theme === 'dark' ? 'bx-sun' : 'bx-moon'} theme-icon`} />
            </li>
            <li><Link className="btn" to="/login">Sign-In</Link></li>
          </ul>
        </div>
      </nav>

      <nav className="lower-nav">
        <div className="nav-div">
          <div className="wrapper">
            <input type="text" placeholder="Search store" className="search-bar" />
            <i className="bx bx-search search-icon" />
          </div>

          <ul className="lower-menu">
            <li>
              <NavLink
                to="/discover"
                className={({ isActive }) => (isActive ? 'nav-link active-link' : 'nav-link')}
              >
                Discover
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/browse"
                className={({ isActive }) => (isActive ? 'nav-link active-link' : 'nav-link')}
              >
                Browse
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/news"
                className={({ isActive }) => (isActive ? 'nav-link active-link' : 'nav-link')}
              >
                News
              </NavLink>
            </li>
          </ul>

          <ul className="lower-menu-right">
            <li>
              <NavLink
                to="/wishlist"
                className={({ isActive }) => (isActive ? 'nav-link active-link' : 'nav-link')}
              >
                Wishlist
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/gifts"
                className={({ isActive }) => (isActive ? 'nav-link active-link' : 'nav-link')}
              >
                Gifts
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/cart"
                className={({ isActive }) => (isActive ? 'nav-link active-link nav-cart-link' : 'nav-link nav-cart-link')}
              >
                <span>Cart</span>
                {cartCount > 0 && <span className="cart-count-badge">{cartCount}</span>}
              </NavLink>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
