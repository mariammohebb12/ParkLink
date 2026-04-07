import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

// Load user from localStorage
function getStoredUser() {
  try {
    const raw = localStorage.getItem("parklinkUser");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const user = getStoredUser();

  const [car, setCar] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [error, setError] = useState("");

  const qrId = user?.user?.qrId || user?.qrId;
  const username = user?.user?.name || user?.name;
  const email = user?.user?.email || user?.email;

  // ------------------------------
  // LOAD CAR + SESSIONS
  // ------------------------------
  useEffect(() => {
    if (!qrId) return;

    async function loadData() {
      try {
        setError("");

        // FIXED ORDER
        const [carRes, sessionRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/car-info/${qrId}`),
          axios.get(`http://localhost:5000/api/sessions/by-qr/${qrId}`)
        ]);

        setCar(carRes.data?.data || null);
        setSessions(Array.isArray(sessionRes.data) ? sessionRes.data : []);
      } catch (err) {
        console.error("Dashboard load error:", err);
        setError("");
      }
    }

    loadData();
  }, [qrId]);

  if (!user) {
    return (
      <div className="app-content-block">
        <div className="page-card">
          <h1 className="page-title">Dashboard</h1>
          <p className="page-description">
            You are not logged in. Please <Link to="/login">login</Link>.
          </p>
        </div>
      </div>
    );
  }

  const lastSession = sessions.length ? sessions[0] : null;
  const totalSessions = sessions.length;
  const unpaidSessions =
    sessions.filter((s) => s.status && s.status.toLowerCase() !== "paid").length;

  let currentStatusLabel = "No sessions yet";
  if (lastSession) {
    const hasExit = lastSession.exitTime;
    currentStatusLabel = hasExit ? "Not active" : "Active (currently parked)";
  }

  const lastSessionUnpaid =
    lastSession?.status && lastSession.status.toLowerCase() !== "paid";

  return (
    <div className="page-layout-two-col">
      {/* LEFT SIDE */}
      <aside className="page-side">
        {/* Driver */}
        <div className="page-card side-card">
          <div className="side-card-title">Driver</div>
          <div className="side-card-body">
            <div>{username}</div>
            <div className="side-meta">{email}</div>
          </div>
        </div>

        {/* Car */}
        <div className="page-card side-card">
          <div className="side-card-title">Car</div>
          <div className="side-card-body">
            {car ? (
              <>
                <div>
                  {car.carBrand} {car.carModel}
                </div>
                <div className="side-meta">Color: {car.carColor}</div>
                <div className="side-meta">Plate: {car.plateNumber}</div>
              </>
            ) : (
              <div className="side-meta">Car details not loaded yet.</div>
            )}
          </div>
        </div>

        {/* QR */}
        <div className="page-card side-card">
          <div className="side-card-title">QR ID</div>
          <div className="side-card-body">
            <div>{qrId}</div>
            <div className="side-meta">
              View your QR in the <Link to="/myqr">My QR</Link> page.
            </div>
          </div>
        </div>
      </aside>

      {/* RIGHT SIDE */}
      <section className="page-main">
        {error && <p className="status-message error">❌ {error}</p>}

        {/* Overview */}
        <div className="page-card">
          <h2 className="page-title">Overview</h2>
          <div className="list-cards">
            {/* Current status */}
            <div className="session-card">
              <div className="card-row">
                <span className="card-label">Current status</span>
                <span className="card-value">{currentStatusLabel}</span>
              </div>
              {lastSessionUnpaid && (
                <button
                  className="btn btn-primary"
                  onClick={() => navigate("/payments")}
                >
                  Pay Now
                </button>
              )}
            </div>

            {/* Total */}
            <div className="session-card">
              <div className="card-row">
                <span className="card-label">Total sessions</span>
                <span className="card-value">{totalSessions}</span>
              </div>
            </div>

            {/* Unpaid */}
            <div className="session-card">
              <div className="card-row">
                <span className="card-label">Unpaid sessions</span>
                <span className="card-value">{unpaidSessions}</span>
              </div>
            </div>

            {/* Last fee */}
            <div className="session-card">
              <div className="card-row">
                <span className="card-label">Last fee</span>
                <span className="card-value">
                  {lastSession?.fee ? `${lastSession.fee} EGP` : "—"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Session */}
        <div className="page-card">
          <h2 className="page-title">Recent session</h2>

          {!lastSession ? (
            <p className="page-description">No sessions recorded yet.</p>
          ) : (
            <div className="session-card">
              <div className="card-row">
                <span className="card-label">Entry</span>
                <span className="card-value">{lastSession.entryTime}</span>
              </div>
              <div className="card-row">
                <span className="card-label">Exit</span>
                <span className="card-value">{lastSession.exitTime || "—"}</span>
              </div>
              <div className="card-row">
                <span className="card-label">Fee</span>
                <span className="card-value">
                  {lastSession.fee ? `${lastSession.fee} EGP` : "—"}
                </span>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
