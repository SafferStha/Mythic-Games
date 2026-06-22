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
const Discover        = lazy(() => import("./pages/Discover"));
const Browse          = lazy(() => import("./pages/Browse"));
const News            = lazy(() => import("./pages/News"));
const GameDetails     = lazy(() => import("./pages/GameDetails"));
const Wishlist        = lazy(() => import("./pages/Wishlist"));
const Gifts           = lazy(() => import("./pages/Gifts"));
const Account         = lazy(() => import("./pages/Account"));
const Library         = lazy(() => import("./pages/Library"));
const Orders          = lazy(() => import("./pages/Orders"));
const PaymentSuccess  = lazy(() => import("./pages/PaymentSuccess"));
const PaymentFailure  = lazy(() => import("./pages/PaymentFailure"));
const ResetPassword   = lazy(() => import("./pages/ResetPassword"));
const OtpVerification = lazy(() => import("./pages/OtpVerification"));
const ManageGames     = lazy(() => import("./pages/ManageGames"));
const ManageNews      = lazy(() => import("./pages/ManageNews"));

/* ── Admin panel ─────────────────────────────────────────── */
const AdminLayout    = lazy(() => import("./components/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminGames     = lazy(() => import("./pages/admin/Games"));
const AdminCategories= lazy(() => import("./pages/admin/Categories"));
const AdminOrders    = lazy(() => import("./pages/admin/Orders"));
const AdminPayments  = lazy(() => import("./pages/admin/Payments"));
const AdminUsers     = lazy(() => import("./pages/admin/Users"));
const AdminInvoices  = lazy(() => import("./pages/admin/Invoices"));
const AdminReceipts  = lazy(() => import("./pages/admin/Receipts"));
const AdminAnalytics = lazy(() => import("./pages/admin/Analytics"));

const ADMIN_ROLES = ['admin', 'super_admin'];

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

      {/* Protected: legacy admin pages */}
      <Route path="/manage-games" element={<ProtectedRoute allowedRoles={ADMIN_ROLES}><ManageGames /></ProtectedRoute>} />
      <Route path="/manage-news"  element={<ProtectedRoute allowedRoles={ADMIN_ROLES}><ManageNews /></ProtectedRoute>} />

      {/* Protected: admin panel */}
      <Route
        path="/admin"
        element={<ProtectedRoute allowedRoles={ADMIN_ROLES}><AdminLayout /></ProtectedRoute>}
      >
        <Route index              element={<AdminDashboard />} />
        <Route path="games"       element={<AdminGames />} />
        <Route path="categories"  element={<AdminCategories />} />
        <Route path="orders"      element={<AdminOrders />} />
        <Route path="payments"    element={<AdminPayments />} />
        <Route path="users"       element={<AdminUsers />} />
        <Route path="invoices"    element={<AdminInvoices />} />
        <Route path="receipts"    element={<AdminReceipts />} />
        <Route path="analytics"   element={<AdminAnalytics />} />
      </Route>
    </Routes>
  </Suspense>
);

export default App;
