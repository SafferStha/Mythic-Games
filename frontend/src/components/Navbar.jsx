import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import "./Navbar.css";
import logo from "../assets/MythicLogo.png";
import { useTheme } from '../contexts/ThemeContext';

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  
    return (
   <header>
       {/* TOP NAV */}
    <nav className="upper-nav">
        <div className="nav-div">
            <div className="logo"><Link to="/"><img src={logo} alt="MythicLogo"/></Link></div>

            {/* LEFT SIDE Menu */}
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

            {/* RIGHT SIDE */}

            <ul className="right-menu">
                                <li
                                    className="theme-toggle"
                                    onClick={toggleTheme}
                                    role="button"
                                    aria-label="Toggle theme"
                                >
                                    <i className={`bx ${theme === 'dark' ? 'bx-sun' : 'bx-moon'} theme-icon`}></i>
                                </li>
                <li><Link className="btn" to="/login">Sign-In</Link></li>
            </ul>
        </div>
    </nav>

    {/* LOWER NAV */}
    <nav className="lower-nav">
        <div className="nav-div">

            <div className="wrapper">
            <input type="text" placeholder="Search store" className="search-bar"/>
             <i className="bx bx-search search-icon" ></i>

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

        {/* Right side of lower menu */}
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
                    className={({ isActive }) => (isActive ? 'nav-link active-link' : 'nav-link')}
                >
                    Cart
                </NavLink>
            </li>
        </ul>

        </div>
    </nav>

    </header>

    
  )
}

export default Navbar

