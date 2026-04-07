const express = require("express");
const router = express.Router();
const ParkingSession = require("../models/parking_session");
const Payment = require("../models/payment");

// All sessions
router.get("/sessions", async (req, res) => {
  try {
    const sessions = await ParkingSession.find()
      .populate("car")
      .sort({ entryTime: -1 });

    res.json({
      status: "success",
      message: "All sessions fetched",
      data: sessions
    });

  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error fetching sessions",
      data: error.message
    });
  }
});

// All payments
router.get("/payments", async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("car")
      .populate("sessionId")
      .sort({ date: -1 });

    res.json({
      status: "success",
      message: "All payments fetched",
      data: payments
    });

  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error fetching payments",
      data: error.message
    });
  }
});

module.exports = router;