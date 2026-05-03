import React from 'react'
import { Link } from "react-router-dom";
import "./Navbar.css"
import "boxicons/css/boxicons.min.css";
import logo from "../assets/MythicLogo.png";
import ThemeToggle from "../contexts/ThemeContext";


const Navbar = () => {

  return (
   <header>
       {/* <!-- TOP NAV --> */}
    <nav className="upper-nav">
        <div className="nav-div">
            <div className="logo"><img src={logo} alt="MythicLogo"/></div>

            {/* <!-- LEFT SIDE Menu --> */}
            <ul className="left-menu">
                <li><Link to="/store">Mythic Games</Link></li>

            </ul>

            {/* <!-- RIGHT SIDE --> */}

            <ul className="right-menu">
                <ThemeToggle />
                <li><Link className="btn" to="/login">Sign-In</Link></li>
            </ul>
        </div>
    </nav>

    {/* <!-- LOWER NAV --> */}
    <nav className="lower-nav">
        <div className="nav-div">

            <div className="wrapper">
            <input type="text" placeholder="Search store" className="search-bar"/>
             <i className="bx bx-search search-icon" ></i>

             </div>
            
        <ul className="lower-menu">
            <li><Link to="/discover">Discover</Link></li>
            <li><Link to="/browse">Browse</Link></li>
            <li><Link to="/news">News</Link></li>
        </ul>

        {/* Right side of lower menu */}
        <ul className="lower-menu-right">
            <li><Link to="/wishlist">Wishlist</Link></li>
            <li><Link to="/gifts">Gifts</Link></li>
            <li><Link to="/cart">Cart</Link></li>
        </ul>

        </div>
    </nav>

    </header>

    
  )
}

export default Navbar
