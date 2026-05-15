import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Discover from "./pages/Discover";
import Browse from "./pages/Browse";
import News from "./pages/News";
import Wishlist from "./pages/Wishlist";
import Gifts from "./pages/Gifts";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import ResetPassword from "./pages/ResetPassword";
import OtpVerification from "./pages/OtpVerification";
import Account from "./pages/Account";
import Library from "./pages/Library";
import GameDetails from "./pages/GameDetails";
import Checkout from "./pages/Checkout";
import ManageNews from "./pages/ManageNews";
import ManageGames from "./pages/ManageGames";

const App = () => {

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/store" element={<Home />} />
      <Route path="/discover" element={<Discover />} />
      <Route path="/browse" element={<Browse />} />
      <Route path="/news" element={<News />} />
      <Route path="/wishlist" element={<Wishlist />} />
      <Route path="/gifts" element={<Gifts />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/game/:gameTitle" element={<GameDetails />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/otp-verification" element={<OtpVerification />} />
      <Route path="/account" element={<Account />} />

      <Route path="/library" element={<Library />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/manage-news" element={<ManageNews />} />
      <Route path="/manage-games" element={<ManageGames />} />
    </Routes>
  );
};

export default App;
