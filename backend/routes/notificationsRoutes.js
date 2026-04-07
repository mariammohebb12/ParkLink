const express = require("express");
const router = express.Router();
const Notification = require("../models/notification");
const Car = require("../models/car");

// Send notification
router.post("/notify", async (req, res) => {
  try {
    const { targetCarId, message } = req.body;

    if (!targetCarId || !message) {
      return res.status(400).json({
        status: "error",
        message: "targetCarId and message are required"
      });
    }

    const targetCar = await Car.findById(targetCarId);

    if (!targetCar) {
      return res.status(404).json({
        status: "error",
        message: "Target car not found"
      });
    }

    const notification = await Notification.create({
      car: targetCarId,
      message,
      date: new Date()
    });

    res.json({
      status: "success",
      message: "Notification sent",
      data: notification
    });

  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error sending notification",
      data: error.message
    });
  }
});

// Get notifications for a car
router.get("/notifications", async (req, res) => {
  try {
    const carId = req.query.carId;

    if (!carId) {
      return res.status(400).json({
        status: "error",
        message: "carId is required"
      });
    }

    const notifications = await Notification.find({ car: carId }).sort({ date: -1 });

    res.json({
      status: "success",
      message: "Notifications fetched",
      data: notifications
    });

  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error fetching notifications",
      data: error.message
    });
  }
});

module.exports = router;