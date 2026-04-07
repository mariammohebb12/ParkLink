const express = require("express");
const router = express.Router();
const Car = require("../models/car");

// ---------------------------------------------
// 1️⃣ car-info route (Dashboard + frontend)
// GET /api/car-info/:qrId
// ---------------------------------------------
router.get("/car-info/:qrId", async (req, res) => {
  try {
    const car = await Car.findOne({ qrId: req.params.qrId });

    if (!car) {
      return res.status(404).json({
        status: "error",
        message: "Car not found"
      });
    }

    res.json({
      status: "success",
      message: "Car found",
      data: car
    });

  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error fetching car info",
      data: error.message
    });
  }
});

// ---------------------------------------------
// 2️⃣ Scan QR route
// GET /api/scan/:qrId
// ---------------------------------------------
router.get("/scan/:qrId", async (req, res) => {
  try {
    const { qrId } = req.params;
    const car = await Car.findOne({ qrId });

    if (!car) {
      return res.status(404).json({ error: "Car not found" });
    }

    res.json({
      ownerName: car.ownerName,
      carBrand: car.carBrand,
      carModel: car.carModel,
      carColor: car.carColor,
      plateNumber: car.plateNumber,
      qrId: car.qrId,
      msg: "QR scan successful"
    });
  } catch (error) {
    res.status(500).json({ error: "Error scanning QR" });
  }
});

// ---------------------------------------------
// 3️⃣ Test route (optional)
// POST /api/add-car
// ---------------------------------------------
router.post("/add-car", async (req, res) => {
  try {
    const car = await Car.create({
      plateNumber: "EGY1234",
      carBrand: "TestBrand",
      carModel: "TestModel",
      carColor: "Black",
      qrId: "QR001",
      user: "67470aa5a640ccde06f5ad81", // change if needed
      qrImage: "TEST"
    });

    res.json({
      status: "success",
      message: "Test car created",
      data: car
    });

  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error creating test car",
      data: error.message
    });
  }
});

// ---------------------------------------------
// 4️⃣ MUST BE LAST → GET CAR BY QR ID
// GET /api/:qrId
// ---------------------------------------------
router.get("/:qrId", async (req, res) => {
  try {
    const car = await Car.findOne({ qrId: req.params.qrId });
    if (!car) return res.status(404).json({ error: "Car not found" });

    return res.json(car);
  } catch (err) {
    res.status(500).json({ error: "Error loading car" });
  }
});

module.exports = router;
