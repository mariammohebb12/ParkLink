const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Adjust this require path to your actual model file if different
const Parkingsession = require('../models/parking_session'); // check filename

// GET session by Mongo _id (safe, new non-conflicting route)
router.get('/api/sessions/id/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid session id format' });
    }
    const session = await Parkingsession.findById(id).lean();
    if (!session) return res.status(404).json({ error: 'Session not found' });

    // Normalize fee if stored in metadata
    const fee = session.fee ?? (session.metadata && session.metadata.fee) ?? 0;
    session.fee = fee;

    return res.json(session);
  } catch (err) {
    console.error('GET /api/sessions/id/:id error', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
