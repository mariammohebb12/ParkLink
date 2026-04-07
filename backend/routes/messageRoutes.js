const express = require("express");
const router = express.Router();
const Message = require("../models/message");

// 🟢 SEND A MESSAGE USING QR ID
router.post("/send", async (req, res) => {
  try {
    const { qrId, message } = req.body;

    if (!qrId || !message) {
      return res.status(400).json({
        success: false,
        message: "Missing fields: qrId and message are required",
      });
    }

    const newMessage = await Message.create({
      qrId,
      message,
    });

    res.json({
      success: true,
      message: "Message sent successfully",
      data: newMessage,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// 🟡 GET ALL MESSAGES FOR A CAR USING QR ID
router.get("/:qrId", async (req, res) => {
  try {
    const { qrId } = req.params;

    const messages = await Message.find({ qrId }).sort({ time: -1 });

    res.json({
      success: true,
      messages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;
