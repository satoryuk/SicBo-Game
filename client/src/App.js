import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Layouts
import AdminLayout from "./components/AdminLayout";
import PlayerLayout from "./components/PlayerLayout";

// Public pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

// Player pages
import Game from "./pages/Game";
import Profile from "./pages/player/Profile";
import Wallet from "./pages/player/Wallet";

// Admin pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminUsers from "./pages/admin/Users";
import AdminUserDetail from "./pages/admin/UserDetail";
import AdminTransactions from "./pages/admin/Transactions";
import AdminLogs from "./pages/admin/Logs";
import AdminWithdrawals from "./pages/admin/Withdrawals";
import AdminRounds from "./pages/admin/Rounds";
import AdminSettings from "./pages/admin/Settings";
import AdminSuspicious from "./pages/admin/Suspicious";
import Leaderboard from "./pages/Leaderboard";

// ─── Helpers ─────────────────────────────────────────────────────────────────
const getToken = () => localStorage.getItem("token");
const getRole = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}").role;
  } catch {
    return null;
  }
};

// Require login — any role
function PrivateRoute({ children }) {
  return getToken() ? children : <Navigate to="/login" replace />;
}

// Require login AND admin role
function AdminRoute({ children }) {
  if (!getToken()) return <Navigate to="/login" replace />;
  if (getRole() !== "admin") return <Navigate to="/login" replace />;
  return children;
}

// Redirect logged-in users away from auth pages
function GuestRoute({ children }) {
  if (!getToken()) return children;
  return getRole() === "admin" ? (
    <Navigate to="/admin" replace />
  ) : (
    <Navigate to="/game" replace />
  );
}

// ─── App ─────────────────────────────────────────────────────────────────────
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Public ──────────────────────────────────────────────── */}
        <Route path="/" element={<Home />} />

        {/* ── Player Auth ─────────────────────────────────────────── */}
        <Route
          path="/login"
          element={
            <GuestRoute>
              <Login />
            </GuestRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <GuestRoute>
              <Signup />
            </GuestRoute>
          }
        />

        {/* ── Player Pages (login required) ───────────────────────── */}
        <Route
          element={
            <PrivateRoute>
              <PlayerLayout />
            </PrivateRoute>
          }
        >
          <Route path="/game" element={<Game />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* /admin/login → redirect to shared /login */}
        <Route path="/admin/login" element={<Navigate to="/login" replace />} />

        {/* ── Admin Pages ─────────────────────────────────────────── */}
        <Route
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/users/:id" element={<AdminUserDetail />} />
          <Route path="/admin/transactions" element={<AdminTransactions />} />
          <Route path="/admin/logs" element={<AdminLogs />} />
          <Route path="/admin/withdrawals" element={<AdminWithdrawals />} />
          <Route path="/admin/rounds" element={<AdminRounds />} />
          <Route path="/admin/leaderboard" element={<Leaderboard />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          <Route path="/admin/suspicious" element={<AdminSuspicious />} />
        </Route>

        {/* ── Fallback ─────────────────────────────────────────────── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
