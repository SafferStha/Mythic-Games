import React, { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { PageLoader } from "./components/ui/Feedback";
import ProtectedRoute from "./components/ProtectedRoute";

/* ── Eager-loaded pages (critical path) ─────────────────── */
import Home     from "./pages/Home";
import Login    from "./pages/Login";
import SignUp   from "./pages/SignUp";
import Cart     from "./pages/Cart";
import Checkout from "./pages/Checkout";

/* ── Lazy-loaded pages (code splitting) ─────────────────── */
const Discover       = lazy(() => import("./pages/Discover"));
const Browse         = lazy(() => import("./pages/Browse"));
const News           = lazy(() => import("./pages/News"));
const GameDetails    = lazy(() => import("./pages/GameDetails"));
const Wishlist       = lazy(() => import("./pages/Wishlist"));
const Gifts          = lazy(() => import("./pages/Gifts"));
const Account        = lazy(() => import("./pages/Account"));
const Library        = lazy(() => import("./pages/Library"));
const Orders         = lazy(() => import("./pages/Orders"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const PaymentFailure = lazy(() => import("./pages/PaymentFailure"));
const ResetPassword  = lazy(() => import("./pages/ResetPassword"));
const OtpVerification= lazy(() => import("./pages/OtpVerification"));
const ManageGames    = lazy(() => import("./pages/ManageGames"));
const ManageNews     = lazy(() => import("./pages/ManageNews"));

const App = () => (
  <Suspense fallback={<PageLoader />}>
    <Routes>
      {/* Public */}
      <Route path="/"         element={<Home />} />
      <Route path="/store"    element={<Home />} />
      <Route path="/discover" element={<Discover />} />
      <Route path="/browse"   element={<Browse />} />
      <Route path="/news"     element={<News />} />
      <Route path="/gifts"    element={<Gifts />} />
      <Route path="/cart"     element={<Cart />} />
      <Route path="/game/:gameTitle" element={<GameDetails />} />

      {/* Auth */}
      <Route path="/login"            element={<Login />} />
      <Route path="/signup"           element={<SignUp />} />
      <Route path="/reset-password"   element={<ResetPassword />} />
      <Route path="/otp-verification" element={<OtpVerification />} />

      {/* Payment callbacks (no auth guard — eSewa redirects here) */}
      <Route path="/payment/success" element={<PaymentSuccess />} />
      <Route path="/payment/failure" element={<PaymentFailure />} />

      {/* Protected: user */}
      <Route path="/wishlist" element={<ProtectedRoute allowedRoles={['user']}><Wishlist /></ProtectedRoute>} />
      <Route path="/account"  element={<ProtectedRoute allowedRoles={['user']}><Account /></ProtectedRoute>} />
      <Route path="/library"  element={<ProtectedRoute allowedRoles={['user']}><Library /></ProtectedRoute>} />
      <Route path="/orders"   element={<ProtectedRoute allowedRoles={['user']}><Orders /></ProtectedRoute>} />
      <Route path="/checkout" element={<ProtectedRoute allowedRoles={['user']}><Checkout /></ProtectedRoute>} />

      {/* Protected: admin */}
      <Route path="/manage-games" element={<ProtectedRoute allowedRoles={['admin']}><ManageGames /></ProtectedRoute>} />
      <Route path="/manage-news"  element={<ProtectedRoute allowedRoles={['admin']}><ManageNews /></ProtectedRoute>} />
    </Routes>
  </Suspense>
);

export default App;
