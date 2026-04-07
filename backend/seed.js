require("dotenv").config();
const mongoose = require("mongoose");

const Car = require("./models/car");
const ParkingSession = require("./models/parking_session");
const Payment = require("./models/payment");
const Message = require("./models/message");

async function seed() {
  console.log("🌱 Seeding database...");

  await mongoose.connect(process.env.MONGO_URL);

  // CLEAR ONLY these (keep users + cars)
  await ParkingSession.deleteMany({});
  await Payment.deleteMany({});
  await Message.deleteMany({});

  // Get first car
  const car = await Car.findOne({});
  if (!car) {
    console.log("❌ No car found. Create a user first.");
    return process.exit();
  }

  console.log("✔ Car found:", car.qrId);

  // 1️⃣ CREATE SESSIONS (CORRECT FIELD NAMES)
  const now = Date.now();

  const session1 = await ParkingSession.create({
    car: car._id,
    startTime: new Date(now - 3 * 60 * 60 * 1000),  // 3 hours ago
    endTime: new Date(now - 2 * 60 * 60 * 1000),    // 2 hours ago
    fee: 20,
    paid: true
  });

  const session2 = await ParkingSession.create({
    car: car._id,
    startTime: new Date(now - 1 * 60 * 60 * 1000),  // 1 hour ago
    endTime: null,
    fee: 0,
    paid: false
  });

  console.log("✔ Sessions created");

  // 2️⃣ CREATE PAYMENT (only for paid session)
  await Payment.create({
    car: car._id,
    sessionId: session1._id,
    amount: 20,
    date: new Date(),
    visaNumber: "4242424242424242",
    cardholder: "Test User"
  });

  console.log("✔ Payments created");

  // 3️⃣ CREATE MESSAGES
  await Message.create({
    qrId: car.qrId,
    message: "Your car is blocking my exit."
  });

  await Message.create({
    qrId: car.qrId,
    message: "Please move your vehicle ASAP."
  });

  console.log("✔ Messages created");

  console.log("🎉 Seeding Completed Successfully!");
  process.exit();
}

seed();
