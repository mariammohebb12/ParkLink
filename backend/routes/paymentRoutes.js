// backend/routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Adjust these require paths if your models are elsewhere
const Payment = require('../models/payment');
const Parkingsession = require('../models/parking_session');

function extractSessionId(req) {
  const body = req.body || {};
  const candidates = [
    body.sessionId,
    body.session_id,
    body.session,
    (body.session && (body.session.id || body.session._id)),
    body.payment && body.payment.sessionId,
    body.payment && body.payment.session_id,
    body.data && body.data.sessionId,
    body.data && body.data.session_id,
    req.query.sessionId,
    req.query.session_id,
    req.headers['x-session-id'],
    req.params && req.params.id,
  ];

  for (const c of candidates) {
    if (!c) continue;
    if (typeof c === 'string' && c.trim()) return c.trim();
    if (typeof c === 'object' && (c._id || c.id)) return (c._id || c.id).toString();
  }
  return null;
}

// GET session details (used by pay page)
router.get('/sessions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'Missing id' });

    let session = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      session = await Parkingsession.findById(id).lean();
    }
    if (!session) {
      // try by qr id or custom fields
      session = await Parkingsession.findOne({ $or: [{ qr_id: id }, { qrId: id }, { customId: id }] }).lean();
    }
    if (!session) return res.status(404).json({ error: 'Session not found' });

    // ensure fee exists
    session.fee = session.fee ?? (session.metadata && session.metadata.fee) ?? 0;
    return res.json(session);
  } catch (err) {
    console.error('GET /sessions/:id error', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// POST create payment
router.post('/payments', async (req, res) => {
  try {
    // Log incoming body so you can inspect on the server console
    try {
      console.log('POST /api/payments body:', JSON.stringify(req.body).slice(0, 20000));
    } catch (e) {
      console.log('POST /api/payments body (non-serializable)', req.body);
    }

    const body = req.body || {};
    const rawSessionId = extractSessionId(req);
    const amount = (typeof body.amount !== 'undefined') ? Number(body.amount) : null;

    if (!rawSessionId) {
      return res.status(400).json({
        error: 'session_id (or sessionId) is required but was not provided. Checked body, query, headers.',
        checkedExample: ['sessionId','session_id','session','payment.sessionId','x-session-id','query.sessionId']
      });
    }

    if (amount === null || Number.isNaN(amount)) {
      return res.status(400).json({ error: 'amount is required and must be a number' });
    }

    // find the session by id or fallback to matching qr_id / custom ids
    let session = null;
    if (mongoose.Types.ObjectId.isValid(rawSessionId)) {
      session = await Parkingsession.findById(rawSessionId);
    }
    if (!session) {
      session = await Parkingsession.findOne({
        $or: [
          { qr_id: rawSessionId },
          { qrId: rawSessionId },
          { customId: rawSessionId },
          { id: rawSessionId }
        ]
      });
    }

    if (!session) {
      return res.status(404).json({ error: 'Session not found for provided id', provided: rawSessionId });
    }

    if (session.paid) {
      return res.status(409).json({ error: 'Session already paid' });
    }

    // create payment. accept multiple field names to be safe.
    const paymentDoc = new Payment({
      sessionId: session._id.toString(),
      session_id: session._id.toString(),
      qrId: session.qr_id || session.qrId || null,
      amount: Number(amount),
      method: body.method || 'card-mock',
      cardLast4: body.cardLast4 || (body.metadata && body.metadata.cardLast4) || null,
      metadata: body.metadata || {},
      createdAt: new Date()
    });

    const saved = await paymentDoc.save();

    // mark session as paid
    try {
      session.paid = true;
      session.status = 'Paid';
      session.paidAt = new Date();
      session.paymentId = saved._id;
      await session.save();
    } catch (sessErr) {
      console.warn('Payment saved but failed to update session:', sessErr);
    }

    return res.status(201).json({ payment: saved });
  } catch (err) {
    console.error('POST /payments error', err);
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// GET payments (by qrId optional)
router.get('/payments', async (req, res) => {
  try {
    const qrId = req.query.qrId;
    if (qrId) {
      const sessions = await Parkingsession.find({ qr_id: qrId }).select('_id').lean();
      const sessionIds = sessions.map(s => s._id.toString());
      const payments = await Payment.find({ sessionId: { $in: sessionIds } }).sort({ createdAt: -1 }).lean();
      return res.json({ payments });
    }
    const payments = await Payment.find().sort({ createdAt: -1 }).limit(200).lean();
    return res.json({ payments });
  } catch (err) {
    console.error('GET /payments', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;