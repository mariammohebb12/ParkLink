// src/App.jsx
import { Routes, Route, NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";

import HomePage from "./pages/HomePage.jsx";
import SignupPage from "./pages/SignupPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import SessionsPage from "./pages/Sessionspage.jsx";
import PaymentsPage from "./pages/PaymentsPage.jsx";
import MessagesPage from "./pages/MessagesPage.jsx";
import MyQRPage from "./pages/MyQRPage.jsx";
import PublicScanPage from "./pages/PublicScanPage.jsx";
import PayPage from './pages/PayPage';

// -------------------------
// Load user once safely
// -------------------------
const loadUser = () => {
  try {
    const saved = localStorage.getItem("parklinkUser");
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

const navItems = [
  { to: "/", label: "Home", exact: true },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/sessions", label: "Sessions" },
  { to: "/payments", label: "Payments" },
  { to: "/messages", label: "Messages" },
  { to: "/myqr", label: "My QR" },
];

function App() {
  const [user, setUser] = useState(loadUser); // ← FIXED, no warnings
  const navigate = useNavigate();

  // -------------------------
  // Logout
  // -------------------------
  const handleLogout = () => {
    localStorage.removeItem("parklinkUser");
    setUser(null);
    navigate("/login");
  };

  return (
    <div className="app-shell">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-logo">PL</div>
          <div className="sidebar-text">
            <div className="sidebar-title">ParkLine</div>
            <div className="sidebar-subtitle">Driver Portal</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className={({ isActive }) =>
                "sidebar-link" + (isActive ? " sidebar-link-active" : "")
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* FOOTER SECTION */}
        <div className="sidebar-footer">
          {!user ? (
            <>
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  "sidebar-link sidebar-link-ghost" +
                  (isActive ? " sidebar-link-active" : "")
                }
              >
                Sign in
              </NavLink>

              <NavLink
                to="/signup"
                className={({ isActive }) =>
                  "sidebar-link sidebar-link-primary" +
                  (isActive ? " sidebar-link-active" : "")
                }
              >
                Create account
              </NavLink>
            </>
          ) : (
            <>
              <div className="sidebar-user">
                Welcome, {user.user?.name || user.name}
              </div>

              <button
                className="sidebar-link sidebar-link-ghost"
                onClick={handleLogout}
                style={{
                  border: "none",
                  background: "transparent",
                  textAlign: "left",
                  padding: 0,
                  cursor: "pointer",
                }}
              >
                Logout
              </button>
            </>
          )}
        </div>
      </aside>

      {/* MAIN AREA */}
      <div className="main-area">
        <header className="topbar">
          <div>
            <div className="topbar-title">ParkLine Driver Dashboard</div>
            <div className="topbar-subtitle">
              Manage your car, parking sessions, payments, and QR messages.
            </div>
          </div>
        </header>

        <main className="content-area">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/sessions" element={<SessionsPage />} />
            <Route path="/payments" element={<PaymentsPage />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/myqr" element={<MyQRPage />} />
            <Route path="/scan/:qrId" element={<PublicScanPage />} />
            <Route path="/pay/:id" element={<PayPage />} />
          </Routes>
        </main>

        <footer className="app-footer">
          © {new Date().getFullYear()} ParkLine · QR-based smart parking
        </footer>
      </div>
    </div>
  );
}

export default App;
