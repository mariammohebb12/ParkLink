// src/pages/PublicScanPage.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function PublicScanPage() {
  const { qrId } = useParams();
  const [car, setCar] = useState(null);
  const [loadingCar, setLoadingCar] = useState(true);
  const [carError, setCarError] = useState("");

  const [message, setMessage] = useState("");
  const [sendStatus, setSendStatus] = useState("");

  useEffect(() => {
    const loadCar = async () => {
      setLoadingCar(true);
      setCarError("");
      try {
        const res = await axios.get(
          `http://localhost:5000/api/cars/scan/${qrId}`
        );
        setCar(res.data || null);
      } catch (err) {
        console.error(err);
        setCarError("Could not load car details for this QR.");
      } finally {
        setLoadingCar(false);
      }
    };

    if (qrId) {
      loadCar();
    }
  }, [qrId]);

  const handleSend = async (e) => {
    e.preventDefault();
    setSendStatus("");

    if (!message.trim()) {
      setSendStatus("Please write a message first.");
      return;
    }

    try {
      await axios.post(
        `http://localhost:5000/api/messages/send/${qrId}`,
        { text: message }
      );
      setSendStatus("Message sent successfully ✅");
      setMessage("");
    } catch (err) {
      console.error(err);
      setSendStatus("Failed to send message. Please try again.");
    }
  };

  return (
    <div className="app-content-block">
      <div className="page-card">
        <h1 className="page-title">Contact the car owner</h1>
        <p className="page-description">
          You scanned a ParkLine QR. Use this form to send a message to the car
          owner — for example, if their car is blocking you or needs attention.
        </p>

        {loadingCar ? (
          <p className="page-description" style={{ marginTop: "0.8rem" }}>
            Loading car details...
          </p>
        ) : carError ? (
          <p className="status-message error">❌ {carError}</p>
        ) : car ? (
          <div
            className="session-card"
            style={{ marginTop: "0.9rem", marginBottom: "1rem" }}
          >
            <div className="card-row">
              <span className="card-label">Car</span>
              <span className="card-value">
                {(car.brand || car.carBrand || "") +
                  " " +
                  (car.model || car.carModel || "")}
              </span>
            </div>
            <div className="card-row">
              <span className="card-label">Color</span>
              <span className="card-value">
                {car.color || car.carColor || "—"}
              </span>
            </div>
            <div className="card-row">
              <span className="card-label">Plate</span>
              <span className="card-value">
                {car.plateNumber || car.plate || "—"}
              </span>
            </div>
          </div>
        ) : (
          <p className="page-description" style={{ marginTop: "0.8rem" }}>
            No car details found for this QR.
          </p>
        )}

        <form onSubmit={handleSend} className="form-group">
          <label className="form-label" htmlFor="message">
            Your message to the owner
          </label>
          <textarea
            id="message"
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Example: Your car is blocking mine, please contact me..."
          />
          <button
            type="submit"
            className="btn btn-primary"
            style={{ marginTop: "0.7rem", alignSelf: "flex-start" }}
          >
            Send message
          </button>
        </form>

        {sendStatus && (
          <p
            className={
              "status-message" +
              (sendStatus.includes("✅") ? " success" : " error")
            }
          >
            {sendStatus}
          </p>
        )}
      </div>
    </div>
  );
}
