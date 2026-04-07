// backend/routes/sessionRoutes.js
const express = require("express");
const router = express.Router();
const Car = require("../models/car");
const ParkingSession = require("../models/parking_session");

/* ======================================================
   ✅ GET ALL SESSIONS FOR DASHBOARD + SESSIONS PAGE
   URL → /api/sessions/by-qr/:qrId
   Normalize DB fields to what frontend expects:
   entryTime, exitTime, durationMinutes, fee, status
====================================================== */
router.get("/sessions/by-qr/:qrId", async (req, res) => {
  try {
    const qrId = req.params.qrId;

    // support both qrId and qr_id
    const car = await Car.findOne({ $or: [{ qrId }, { qr_id: qrId }] });
    if (!car) return res.status(404).json({ error: "Car not found" });

    // fetch raw sessions and map to normalized shape
    const sessions = await ParkingSession.find({ car: car._id }).sort({ startTime: -1 }).lean();

    const normalized = sessions.map((s) => {
      // pick the DB fields (your DB uses startTime/endTime)
      const rawEntry = s.startTime ?? s.entryTime ?? s.entry ?? s.entry_at ?? null;
      const rawExit = s.endTime ?? s.exitTime ?? s.exit ?? s.exit_at ?? null;

      const entryTime = rawEntry ? (rawEntry instanceof Date ? rawEntry.toISOString() : new Date(rawEntry).toISOString()) : null;
      const exitTime = rawExit ? (rawExit instanceof Date ? rawExit.toISOString() : new Date(rawExit).toISOString()) : null;

      // duration: prefer stored durationMinutes else compute from entry/exit
      let durationMinutes = null;
      if (typeof s.durationMinutes === "number") {
        durationMinutes = s.durationMinutes;
      } else if (typeof s.duration === "number") {
        durationMinutes = s.duration;
      } else if (entryTime && exitTime) {
        const diffMs = new Date(exitTime) - new Date(entryTime);
        durationMinutes = diffMs > 0 ? Math.ceil(diffMs / (1000 * 60)) : 0;
      }

      // fee: prefer numeric fee, else metadata.fee, else amount
      const fee = (typeof s.fee === "number")
        ? s.fee
        : (s.metadata && typeof s.metadata.fee === "number"
          ? s.metadata.fee
          : (s.amount != null ? Number(s.amount) : null));

      // status: prefer explicit status, else use paid boolean
      let status = s.status || (s.paid ? "Paid" : null);
      if (!status) status = s.paid ? "Paid" : "Active";
      if (typeof status === "string") status = status.charAt(0).toUpperCase() + status.slice(1);

      return {
        ...s,
        entryTime,
        exitTime,
        durationMinutes,
        fee,
        status,
      };
    });

    return res.json(normalized);
  } catch (err) {
    console.error("GET /sessions/by-qr/:qrId error:", err);
    return res.status(500).json({ error: "Server error loading sessions" });
  }
});

/* ======================================================
   ⭐ START SESSION
   Writes both startTime and entryTime for consistency
====================================================== */
router.post("/start-session/:qrId", async (req, res) => {
  try {
    const qrId = req.params.qrId;
    const car = await Car.findOne({ $or: [{ qrId }, { qr_id: qrId }] });

    if (!car) {
      return res.status(404).json({
        status: "error",
        message: "Car not found",
      });
    }

    const now = new Date();
    const session = new ParkingSession({
      car: car._id,
      entryTime: now,
      startTime: now, // also save startTime to match existing docs
    });

    await session.save();

    res.json({
      status: "success",
      message: "Parking session started",
      data: session,
    });
  } catch (error) {
    console.error("POST /start-session error:", error);
    res.status(500).json({
      status: "error",
      message: "Error starting session",
      data: error.message,
    });
  }
});

/* ======================================================
   ⭐ END SESSION
   Writes both endTime and exitTime and stores durationMinutes/fee
====================================================== */
router.put("/end-session/:qrId", async (req, res) => {
  try {
    const qrId = req.params.qrId;
    const car = await Car.findOne({ $or: [{ qrId }, { qr_id: qrId }] });
    if (!car) {
      return res.status(404).json({
        status: "error",
        message: "Car not found",
      });
    }

    // find active session (support both exitTime and endTime naming)
    const session = await ParkingSession.findOne({
      car: car._id,
      $or: [{ exitTime: null }, { endTime: null }, { exitTime: { $exists: false } }, { endTime: { $exists: false } }],
    });

    if (!session) {
      return res.status(404).json({
        status: "error",
        message: "No active session found",
      });
    }

    const now = new Date();
    // set both names
    session.exitTime = now;
    session.endTime = now;

    // compute duration using whichever entry field exists
    const entry = session.entryTime ?? session.startTime ?? session.entry ?? null;
    const diffMs = entry ? (new Date(now) - new Date(entry)) : 0;
    const durationMinutes = diffMs > 0 ? Math.ceil(diffMs / (1000 * 60)) : 0;

    session.durationMinutes = durationMinutes;
    session.fee = Math.ceil(durationMinutes) * 10;

    await session.save();

    res.json({
      status: "success",
      message: "Parking session ended",
      data: session,
    });
  } catch (error) {
    console.error("PUT /end-session error:", error);
    res.status(500).json({
      status: "error",
      message: "Error ending session",
      data: error.message,
    });
  }
});

/* ======================================================
   ⭐ QR SCAN
   Returns entering/exiting depending on active session
====================================================== */
router.get("/scan/:qrId", async (req, res) => {
  try {
    const qrId = req.params.qrId;
    const car = await Car.findOne({ $or: [{ qrId }, { qr_id: qrId }] });

    if (!car) {
      return res.status(404).json({
        status: "error",
        message: "Car not found",
      });
    }

    // find a session that has not ended yet (support both field names)
    const session = await ParkingSession.findOne({
      car: car._id,
      $or: [{ exitTime: null }, { endTime: null }, { exitTime: { $exists: false } }, { endTime: { $exists: false } }],
    });

    if (!session) {
      return res.json({
        status: "entering",
        message: "Car is entering",
        data: car,
      });
    }

    return res.json({
      status: "exiting",
      message: "Car is exiting",
      data: session,
    });
  } catch (error) {
    console.error("GET /scan/:qrId error:", error);
    res.status(500).json({
      status: "error",
      message: "Error scanning QR",
      data: error.message,
    });
  }
});

module.exports = router;

