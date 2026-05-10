import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Discover from './pages/Discover';
import Browse from './pages/Browse';
import News from './pages/News';
import Wishlist from './pages/Wishlist';
import Gifts from './pages/Gifts';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Account from './pages/Account';
import Library from './pages/Library';
import GameDetails from './pages/GameDetails';


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
      <Route path="/login" element={<Login />} />
      <Route path="/account" element={<Account />} />
      <Route path="/library" element={<Library />} />
      <Route path="/game/:id" element={<GameDetails />} />
    </Routes>
  );
};

export default App;
