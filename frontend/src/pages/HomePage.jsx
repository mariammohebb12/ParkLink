// src/pages/HomePage.jsx
/*import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="home">
      <section className="home-hero">
        <h1 className="home-title">ParkLine Driver Portal</h1>
        <p className="home-subtitle">
          A simple dashboard to manage your car, parking sessions, payments, and
          messages when someone scans your QR code.
        </p>

        <div className="home-actions">
          <button
            className="btn btn-primary"
            onClick={() => navigate("/signup")}
          >
            Create account
          </button>

          <button
            className="btn btn-primary btn-secondary"
            onClick={() => navigate("/login")}
          >
            Sign in
          </button>
        </div>

        <div className="home-tag">
          QR-based parking • Designed for real drivers
        </div>
      </section>
    </div>
  );
}
*/

// src/pages/HomePage.jsx
import { Link } from "react-router-dom";
import { useState } from "react";

function getUser() {
  try {
    const saved = localStorage.getItem("parklinkUser");
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

export default function HomePage() {
  const [user] = useState(getUser());

  // -------------------------
  // IF LOGGED IN → Personalized home
  // -------------------------
  if (user) {
    const name = user.user?.name || user.name;

    return (
      <div className="page-card" style={{ padding: "2rem" }}>
        <h1 className="page-title">Welcome back, {name}! 👋</h1>
        <p className="page-description">
          Here are quick shortcuts to help you manage your car and sessions.
        </p>

        <div className="list-cards" style={{ marginTop: "1.5rem" }}>
          <Link to="/dashboard" className="session-card">
            <div className="card-row">
              <span className="card-label">Dashboard</span>
              <span className="card-value">View car + activity</span>
            </div>
          </Link>

          <Link to="/sessions" className="session-card">
            <div className="card-row">
              <span className="card-label">Sessions</span>
              <span className="card-value">Entry/Exit history</span>
            </div>
          </Link>

          <Link to="/payments" className="session-card">
            <div className="card-row">
              <span className="card-label">Payments</span>
              <span className="card-value">Unpaid fees & history</span>
            </div>
          </Link>

          <Link to="/myqr" className="session-card">
            <div className="card-row">
              <span className="card-label">My QR Code</span>
              <span className="card-value">Share your QR</span>
            </div>
          </Link>
        </div>
      </div>
    );
  }

  // -------------------------
  // IF NOT LOGGED IN → Public landing page
  // -------------------------
  return (
    <div className="page-card hero-banner">
      <h1 className="page-title">ParkLine Driver Portal</h1>
      <p className="page-description">
        A simple dashboard to manage your car, parking sessions, payments, and
        messages when someone scans your QR code.
      </p>

      <div className="hero-buttons">
        <Link to="/signup" className="btn btn-primary">
          Create account
        </Link>
        <Link to="/login" className="btn btn-secondary">
          Sign in
        </Link>
      </div>

      <div className="hero-small-text">
        QR-based parking • Designed for real drivers
      </div>
    </div>
  );
}
