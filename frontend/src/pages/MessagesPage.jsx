// src/pages/MessagesPage.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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

export default function MessagesPage() {
  const [user] = useState(getStoredUser());
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user?.qrId) return;

    const loadMessages = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/messages/${user.qrId}`
        );

        // Backend returns: { success: true, messages: [...] }
        const list = res.data.messages || [];

        setMessages(list);
      } catch (err) {
        console.error(err);
        setError("Could not load messages.");
      }
    };

    loadMessages();
  }, [user]);

  if (!user) {
    return (
      <div className="app-content-block">
        <div className="page-card">
          <h1 className="page-title">My Messages</h1>
          <p className="page-description">
            You are not logged in. Please <Link to="/login">login</Link>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-layout-two-col">
      {/* LEFT SIDE */}
      <aside className="page-side">
        <div className="page-card side-card">
          <div className="side-card-title">QR ID</div>
          <div className="side-card-body">
            <div>{user.qrId || "Not assigned yet"}</div>
            <div className="side-meta">
              Messages appear when someone scans this QR and sends a note.
            </div>
          </div>
        </div>
      </aside>

      {/* RIGHT SIDE */}
      <section className="page-main">
        <div className="page-card">
          <h1 className="page-title">My Messages</h1>
          <p className="page-description">
            People can scan the QR on your car and send you a message.
          </p>

          {error && <p className="status-message error">❌ {error}</p>}

          {messages.length === 0 ? (
            <p className="page-description" style={{ marginTop: "0.8rem" }}>
              No messages received yet.
            </p>
          ) : (
            <div className="list-cards">
              {messages.map((m) => (
                <div className="message-card" key={m._id}>
                  <div className="card-row">
                    <span className="card-label">Message</span>
                    <span className="card-value">{m.message}</span>
                  </div>
                  <div className="card-row">
                    <span className="card-label">Received at</span>
                    <span className="card-value">
                      {m.time
                        ? new Date(m.time).toLocaleString()
                        : "—"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
