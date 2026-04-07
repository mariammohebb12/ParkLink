const express = require("express");
const router = express.Router();

const User = require("../models/user");
const Car = require("../models/car");

const QRCode = require("qrcode");

// Generate random QR ID
function generateQrId() {
  return "QR" + Math.floor(100000 + Math.random() * 900000);
}

/* ======================================================
   ⭐ SIGNUP ROUTE — Matches your frontend exactly
====================================================== */
router.post("/signup", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      carBrand,
      carModel,
      carColor,
      plateNumber
    } = req.body;

    // Validate required fields
    if (
      !name ||
      !email ||
      !password ||
      !carBrand ||
      !carModel ||
      !carColor ||
      !plateNumber
    ) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Generate QR Code
    const qrId = generateQrId();
    const qrImage = await QRCode.toDataURL(qrId);

    // Create User
    const newUser = await User.create({
      name,
      email,
      password
    });

    // Create Car linked to user
    await Car.create({
      user: newUser._id,
      carBrand,
      carModel,
      carColor,
      plateNumber,
      qrId,
      qrImage
    });

    // Respond with user + car data
    res.json({
      success: true,
      message: "User & Car registered successfully",
      user: {
        name,
        email,
        qrId,
        carBrand,
        carModel,
        carColor,
        plateNumber,
        qrImage
      }
    });

  } catch (error) {
    console.error("SIGNUP ERROR:", error);

    // Duplicate email
    if (error.code === 11000) {
      return res.status(400).json({ error: "Email already exists" });
    }

    res.status(500).json({ error: error.message });
  }
});


/* ======================================================
   ⭐ LOGIN ROUTE
====================================================== */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find user
    const user = await User.findOne({ email, password });
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // 2. Find user's car
    const car = await Car.findOne({ user: user._id });
    if (!car) {
      return res.status(404).json({ error: "Car not found for this user" });
    }

    // 3. Return combined user + car data
    res.json({
      success: true,
      user: {
        name: user.name,
        email: user.email,

        qrId: car.qrId,
        plateNumber: car.plateNumber,
        carBrand: car.carBrand,
        carModel: car.carModel,
        carColor: car.carColor,
        qrImage: car.qrImage
      }
    });

  } catch (error) {
    res.status(500).json({ error: "Login error" });
  }
});



module.exports = router;
