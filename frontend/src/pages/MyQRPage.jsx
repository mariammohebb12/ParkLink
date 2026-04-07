// src/pages/MyQRPage.jsx
import { useState } from "react";
import { Link } from "react-router-dom";

function getStoredUser() {
  const raw = localStorage.getItem("parklinkUser");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export default function MyQRPage() {
  const [user] = useState(getStoredUser());

  if (!user) {
    return (
      <div className="app-content-block">
        <div className="page-card">
          <h1 className="page-title">My QR</h1>
          <p className="page-description">
            You are not logged in. Please <Link to="/login">login</Link>.
          </p>
        </div>
      </div>
    );
  }

  const handleDownload = () => {
    if (!user.qrImage) return;
    const a = document.createElement("a");
    a.href = user.qrImage;
    a.download = `parkline-qr-${user.qrId || "car"}.png`;
    a.click();
  };

  return (
    <div className="page-layout-two-col">
      <aside className="page-side">
        <div className="page-card side-card">
          <div className="side-card-title">QR ID</div>
          <div className="side-card-body">
            <div>{user.qrId || "Not assigned yet"}</div>
            <div className="side-meta">
              Stick this QR on your car. People can scan it to send you
              messages.
            </div>
          </div>
        </div>
      </aside>

      <section className="page-main">
        <div className="page-card">
          <h1 className="page-title">My QR Code</h1>
          <p className="page-description">
            This QR code is unique to your car. You can download it and print it
            as a sticker.
          </p>

          <div className="qr-wrapper">
            {user.qrImage ? (
              <img
                src={user.qrImage}
                alt="QR code for this car"
                style={{
                  width: "180px",
                  height: "180px",
                  borderRadius: "0.75rem",
                  border: "1px solid #e5e7eb",
                  background: "#ffffff",
                  padding: "0.4rem",
                }}
              />
            ) : (
              <div className="card-subtext">
                QR image not available yet. It will be generated at signup.
              </div>
            )}

            <button className="btn btn-primary" onClick={handleDownload}>
              Download QR
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
