// PayPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

export default function PayPage() {
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [exp, setExp] = useState('');
  const [cvc, setCvc] = useState('');
  const [error, setError] = useState(null);

  const BACKEND = 'http://localhost:5000';

  const paramId = params.sessionId || params.id || null;
  const stateId = location?.state?.sessionId || location?.state?.updatedSessionId || null;

  useEffect(() => {
    async function loadSession() {
      setLoading(true);
      setError(null);
      const candidate = paramId || stateId;
      if (!candidate) {
        setError('No session id found in URL or navigation state.');
        setLoading(false);
        return;
      }
      try {
        let res = await fetch(`${BACKEND}/api/sessions/${candidate}`, { headers: { 'Content-Type': 'application/json' } });
        if (!res.ok) {
          // try alternate
          res = await fetch(`${BACKEND}/api/sessions/id/${candidate}`, { headers: { 'Content-Type': 'application/json' } });
        }
        if (!res.ok) throw new Error(`Failed to load session (${res.status})`);
        const json = await res.json();
        setSession(json);
      } catch (err) {
        console.error('Failed to load session', err);
        setError('Failed to load session: ' + (err.message || err));
      } finally {
        setLoading(false);
      }
    }
    loadSession();
  }, [paramId, stateId]);

  function getAuthHeader() {
    try {
      const raw = localStorage.getItem('parklinkUser');
      if (!raw) return {};
      const u = JSON.parse(raw);
      return u?.token ? { Authorization: `Bearer ${u.token}` } : {};
    } catch {
      return {};
    }
  }

  async function handlePay(e) {
    e.preventDefault();
    setError(null);

    if (!cardName || !cardNumber || !exp || !cvc) {
      setError('Complete mock card details');
      return;
    }
    if (!session) {
      setError('Session not loaded');
      return;
    }

    const sId = session._id || session.id || paramId || stateId;
    if (!sId) {
      setError('Could not determine session id');
      return;
    }

    const amount = Number(session.fee || 0);
    const payload = {
      sessionId: sId,
      session_id: sId,
      session: sId,
      amount,
      method: 'card-mock',
      cardLast4: String(cardNumber).slice(-4),
      metadata: { cardName },
    };

    // LOG the outgoing payload - check DevTools -> Console
    console.log('PayPage outgoing payload:', payload);

    try {
      const headers = { 'Content-Type': 'application/json', ...getAuthHeader() };
      const resp = await fetch(`${BACKEND}/api/payments`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      const text = await resp.text().catch(() => '');
      let json;
      try { json = text ? JSON.parse(text) : {}; } catch { json = { raw: text }; }

      if (!resp.ok) {
        console.error('Payment failed response:', resp.status, json, text);
        setError(`Payment failed — Attempted ${BACKEND}/api/payments | Status: ${resp.status} | Server: ${JSON.stringify(json)}`);
        return;
      }

      const saved = json.payment || json;
      const newPaymentId = saved._id || saved.id || null;

      navigate('/sessions', { state: { updatedSessionId: sId, newPaymentId } });
    } catch (err) {
      console.error('Payment error', err);
      setError('Payment failed: ' + (err.message || err));
    }
  }

  if (loading) return <div className="page-card">Loading session...</div>;
  if (!session) return <div className="page-card" style={{ color: 'red' }}>{error || 'Session not found.'}</div>;

  return (
    <div className="page-layout-two-col">
      <aside className="page-side">
        <div className="page-card side-card">
          <div className="side-card-title">Driver</div>
          <div className="side-card-body">
            <div>{session.driverName || session.userName || 'Driver'}</div>
            <div className="side-meta">{session.userEmail || ''}</div>
          </div>
        </div>

        <div className="page-card side-card">
          <div className="side-card-title">Session</div>
          <div className="side-card-body">
            <div>Driver name: {session.driverName || '—'}</div>
            <div className="side-meta">QR ID: {session.qr_id || session.qrId || '—'}</div>
          </div>
        </div>
      </aside>

      <section className="page-main">
        <div className="page-card">
          <h1 className="page-title">Pay for your parking session</h1>
          <p className="page-description">Mock payment flow for testing.</p>

          <div className="pay-card">
            <div className="pay-row">
              <label className="pay-label">Amount</label>
              <div className="pay-value">{session.fee ?? 0} EGP</div>
            </div>

            <form onSubmit={handlePay}>
              <div className="form-group">
                <label>Name on card</label>
                <input className="input" value={cardName} onChange={(e) => setCardName(e.target.value)} />
              </div>

              <div className="form-group">
                <label>Card number</label>
                <input className="input" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} />
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Expiry (MM/YY)</label>
                  <input className="input" value={exp} onChange={(e) => setExp(e.target.value)} />
                </div>
                <div className="form-group" style={{ width: 120 }}>
                  <label>CVC</label>
                  <input className="input" value={cvc} onChange={(e) => setCvc(e.target.value)} />
                </div>
              </div>

              {error && <div className="status-message error" style={{ marginTop: 10 }}>{error}</div>}

              <div style={{ marginTop: 16 }}>
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Complete Payment</button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
