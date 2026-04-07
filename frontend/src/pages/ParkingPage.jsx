import { useEffect, useState } from "react";
import axios from "axios";

export default function ParkingPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchSessions = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/sessions");
      setSessions(res.data.data || []);
    } catch (err) {
      console.error(err);
      const backendError =
        err.response?.data?.message ||
        "Error fetching sessions.";
      setError(backendError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  return (
    <div>
      <h2>Parking Sessions</h2>

      {loading && <p>Loading sessions...</p>}
      {error && <p style={{ color: "red" }}>❌ {error}</p>}

      {!loading && sessions.length === 0 && !error && (
        <p>No sessions available.</p>
      )}

      <ul>
        {sessions.map((session) => (
          <li key={session._id} style={{ marginBottom: "10px" }}>
            <strong>Car:</strong> {session.car?.plateNumber || "Unknown"} <br />
            <strong>Started:</strong> {new Date(session.startTime).toLocaleString()} <br />
            <strong>Fee:</strong> {session.fee} EGP <br />
            <strong>Paid:</strong> {session.paid ? "Yes" : "No"}
          </li>
        ))}
      </ul>
    </div>
  );
}
