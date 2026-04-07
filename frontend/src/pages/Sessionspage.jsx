import { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

function getStoredUser() {
  const raw = localStorage.getItem("parklinkUser");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export default function SessionsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user] = useState(getStoredUser());
  const [sessions, setSessions] = useState([]);
  const [error, setError] = useState("");
  const listRef = useRef(null);

  // allow highlight of a session returned in navigation state after payment
  const updatedSessionId = location?.state?.updatedSessionId || null;
  const newPaymentId = location?.state?.newPaymentId || null;

  useEffect(() => {
    if (!user?.qrId) return;

    const loadSessions = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/sessions/by-qr/${user.qrId}`
        );

        // backend might return { sessions: [...] } or array directly
        const data = Array.isArray(res.data) ? res.data : res.data.sessions || [];
        setSessions(data);
      } catch (err) {
        console.error("SESSION ERROR:", err);
        setError("Unable to load sessions right now.");
      }
    };

    loadSessions();
  }, [user]);

  useEffect(() => {
    if (!updatedSessionId || !sessions.length) return;

    const el = document.querySelector(`[data-session-id="${updatedSessionId}"]`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('flash-highlight');
      setTimeout(() => el.classList.remove('flash-highlight'), 2500);
    }
  }, [updatedSessionId, sessions]);

  if (!user) {
    return (
      <div className="app-content-block">
        <div className="page-card">
          <h1 className="page-title">My Sessions</h1>
          <p className="page-description">
            You are not logged in. Please <Link to="/login">login</Link>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-layout-two-col">
      <aside className="page-side">
        <div className="page-card side-card">
          <div className="side-card-title">Driver</div>
          <div className="side-card-body">
            <div>{user.name || "Unnamed driver"}</div>
            <div className="side-meta">{user.email}</div>
          </div>
        </div>

        <div className="page-card side-card">
          <div className="side-card-title">QR ID</div>
          <div className="side-card-body">
            <div>{user.qrId || "Not assigned yet"}</div>
            <div className="side-meta">
              Sessions listed here are linked to this QR.
            </div>
          </div>
        </div>
      </aside>

      <section className="page-main">
        <div className="page-card">
          <h1 className="page-title">My Sessions</h1>
          <p className="page-description">
            All parking sessions registered for your car. Each card shows entry,
            exit, duration, fee, and payment status.
          </p>

          {error && <p className="status-message error">❌ {error}</p>}

          {sessions.length === 0 ? (
            <p className="page-description" style={{ marginTop: "0.8rem" }}>
              No sessions recorded yet.
            </p>
          ) : (
            <div className="list-cards" ref={listRef}>
              {sessions.map((s) => {
                // some backends use different field names; support multiple common ones
                const entry = s.entryTime || s.started_at || s.startedAt || s.startedAtISO || "—";
                const exit = s.exitTime || s.ended_at || s.endedAt || "—";
                const duration = s.durationMinutes ?? s.duration ?? s.duration_min ?? "—";
                const fee = (typeof s.fee !== "undefined" && s.fee !== null)
                  ? s.fee
                  : (s.metadata && s.metadata.fee) || 0;
                const status = s.status || (s.paid ? "Paid" : (s.ended_at || s.exitTime ? "Unpaid" : "Active"));
                const isPaid = String(status).toLowerCase() === "paid" || !!s.paid;

                const sessionKey = s._id || s.id;

                return (
                  <div
                    className="session-card"
                    key={sessionKey}
                    data-session-id={sessionKey}
                    style={{
                      border: (String(sessionKey) === String(updatedSessionId)) ? '2px solid #1f5fe0' : undefined
                    }}
                  >
                    <div className="card-row">
                      <span className="card-label">Entry</span>
                      <span className="card-value">{entry}</span>
                    </div>

                    <div className="card-row">
                      <span className="card-label">Exit</span>
                      <span className="card-value">{exit}</span>
                    </div>

                    <div className="card-row">
                      <span className="card-label">Duration</span>
                      <span className="card-value">{duration}</span>
                    </div>

                    <div className="card-row">
                      <span className="card-label">Fee</span>
                      <span className="card-value">{fee != null ? `${fee} EGP` : "—"}</span>
                    </div>

                    <div className="card-row">
                      <span className="card-label">Status</span>
                      <span className={"badge " + (isPaid ? "badge-paid" : "badge-unpaid")}>
                        {status}
                      </span>
                    </div>

                    {!isPaid && (
                      <div style={{ marginTop: "0.6rem" }}>
                        {/* navigate to the pay page for this session */}
                        <button
                          className="btn btn-primary"
                          onClick={() => navigate(`/pay/${sessionKey}`)}
                        >
                          Pay Now
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
