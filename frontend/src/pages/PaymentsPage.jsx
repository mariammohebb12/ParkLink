import React, { useEffect, useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';

function getStoredUser() {
  const raw = localStorage.getItem('parklinkUser');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export default function PaymentsPage() {
  const location = useLocation();
  const newPaymentId = location?.state?.newPaymentId || null;

  const user = getStoredUser();
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const listRef = useRef(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError('');
      try {
        const qrId = user?.qrId || user?.qr_id;
        const headers = { 'Content-Type': 'application/json', ...(user?.token ? { Authorization: `Bearer ${user.token}` } : {}) };

        let res;
        if (qrId) {
          try {
            res = await axios.get(`http://localhost:5000/api/payments/by-qr/${qrId}`, { headers });
          } catch (innerErr) {
            console.debug('by-qr failed, trying query param', innerErr);
            res = await axios.get(`http://localhost:5000/api/payments?qrId=${encodeURIComponent(qrId)}`, { headers });
          }
        } else {
          res = await axios.get(`http://localhost:5000/api/payments`, { headers });
        }

        const data = Array.isArray(res.data) ? res.data : res.data.payments || [];
        setPayments(data);
      } catch (err) {
        console.error('Failed to load payments', err);
        // show server returned message if available
        const serverMsg = err?.response?.data ? JSON.stringify(err.response.data) : err.message;
        setError(`Unable to load payments at the moment. ${serverMsg}`);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [user]);

  useEffect(() => {
    // after payments load, scroll to new payment if present
    if (!newPaymentId || !payments.length) return;

    const el = document.querySelector(`[data-payment-id="${newPaymentId}"]`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // add a temporary highlight class
      el.classList.add('flash-highlight');
      setTimeout(() => el.classList.remove('flash-highlight'), 2500);
    }
  }, [newPaymentId, payments]);

  const isHighlighted = (p) => {
    if (!newPaymentId) return false;
    return String(p._id || p.id) === String(newPaymentId);
  };

  const totalPaid = payments.reduce((s, p) => s + (Number(p.amount || 0)), 0);

  if (!user) {
    return (
      <div className="app-content-block">
        <div className="page-card">
          <h1 className="page-title">My Payments</h1>
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
            <div>{user.name || 'Driver'}</div>
            <div className="side-meta">{user.email}</div>
          </div>
        </div>

        <div className="page-card side-card">
          <div className="side-card-title">Total paid</div>
          <div className="side-card-body">
            <div>{totalPaid.toFixed(2)} EGP</div>
            <div className="side-meta">Sum of all payments recorded for this QR.</div>
          </div>
        </div>
      </aside>

      <section className="page-main">
        <div className="page-card">
          <h1 className="page-title">My Payments</h1>
          <p className="page-description">
            Every payment linked to your sessions. Use this as a simple record of what you've paid.
          </p>

          {loading && <p className="page-description">Loading payments...</p>}
          {!loading && error && <p className="status-message error">❌ {error}</p>}

          {!loading && payments.length === 0 && !error && (
            <p className="page-description">No payments recorded yet.</p>
          )}

          {!loading && payments.length > 0 && (
            <div className="list-cards" ref={listRef}>
              {payments.map((p) => (
                <div
                  className="session-card"
                  key={p._id || p.id}
                  data-payment-id={p._id || p.id}
                  style={{
                    border: isHighlighted(p) ? '2px solid #1f5fe0' : undefined,
                    boxShadow: isHighlighted(p) ? '0 8px 24px rgba(31,95,224,0.12)' : undefined,
                  }}
                >
                  <div className="card-row">
                    <span className="card-label">Session</span>
                    <span className="card-value">{String(p.sessionId || p.session || '—').slice(0, 12)}</span>
                  </div>

                  <div className="card-row">
                    <span className="card-label">Amount</span>
                    <span className="card-value">{Number(p.amount || 0).toFixed(2)} EGP</span>
                  </div>

                  <div className="card-row">
                    <span className="card-label">Method</span>
                    <span className="card-value">{p.method || p.paymentMethod || '—'}</span>
                  </div>

                  <div className="card-row">
                    <span className="card-label">Date</span>
                    <span className="card-value">{p.createdAt ? new Date(p.createdAt).toLocaleString() : (p.date || '—')}</span>
                  </div>

                  <div className="card-row">
                    <span className="card-label">Note</span>
                    <span className="card-value">{(p.metadata && p.metadata.cardLast4) ? `card •••• ${p.metadata.cardLast4}` : (p.note || '—')}</span>
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
