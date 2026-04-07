// backend/server.js (safe, non-crashing version)
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const app = express();
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// --- MongoDB Connection ---
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.log("MongoDB connection error:", err));

// Helper to require only if file exists
function tryUseRoute(relPath, mountPath) {
  const full = path.join(__dirname, relPath);
  if (fs.existsSync(full + ".js") || fs.existsSync(full) ) {
    try {
      const route = require(full);
      if (mountPath) app.use(mountPath, route);
      else app.use(route);
      console.log(`Mounted route: ${relPath} ${mountPath ? `on ${mountPath}` : ""}`);
    } catch (err) {
      console.error(`Error loading route ${relPath}:`, err);
    }
  } else {
    console.warn(`Route file not found (skipped): ${relPath}`);
  }
}

function tryRequireModel(relPath) {
  const full = path.join(__dirname, relPath);
  if (fs.existsSync(full + ".js") || fs.existsSync(full)) {
    try {
      return require(full);
    } catch (err) {
      console.error(`Error requiring model ${relPath}:`, err);
      return null;
    }
  } else {
    console.warn(`Model file not found (skipped): ${relPath}`);
    return null;
  }
}

// --- Try to mount your routes (only if files exist) ---
tryUseRoute("./routes/authRoutes", "/api/auth");
tryUseRoute("./routes/carRoutes", "/api");
tryUseRoute("./routes/sessionRoutes", "/api");
tryUseRoute("./routes/paymentRoutes", "/api");
tryUseRoute("./routes/notificationsRoutes", "/api");
tryUseRoute("./routes/adminRoutes", "/api");
tryUseRoute("./routes/messageRoutes", "/api/messages");

// --- Public scan endpoints depend on models; try to require them safely ---
const Car = tryRequireModel("./models/car");
const Message = tryRequireModel("./models/message");
const Parkingsession = tryRequireModel("./models/parking_session");

// Add public scan only if Car & Message models are available
if (Car && Message) {
  app.get("/public/scan/:qrId", async (req, res) => {
    try {
      const { qrId } = req.params;
      const car = await Car.findOne({ qr_id: qrId }).lean();
      if (!car) return res.status(404).json({ error: "Car not found" });
      const messages = await Message.find({ qr_id: qrId }).sort({ created_at: -1 }).limit(50).lean();
      return res.json({
        car: {
          ownerName: car.owner_name || car.name || car.ownerName || null,
          carType: car.car_type || car.type || null,
          plateNumber: car.plate_number || car.plate || null,
          qrId: car.qr_id || qrId,
        },
        messages,
      });
    } catch (err) {
      console.error("GET /public/scan/:qrId error:", err);
      return res.status(500).json({ error: "Server error" });
    }
  });

  app.post("/public/scan/:qrId/message", async (req, res) => {
    try {
      const { qrId } = req.params;
      const { sender = "public", content } = req.body;
      if (!content || !content.trim()) return res.status(400).json({ error: "Message content required" });

      const car = await Car.findOne({ qr_id: qrId }).lean();
      if (!car) return res.status(404).json({ error: "Car not found" });

      const newMsg = new Message({ qr_id: qrId, sender, content, created_at: new Date() });
      await newMsg.save();
      return res.status(201).json({ message: "Saved", data: newMsg });
    } catch (err) {
      console.error("POST /public/scan/:qrId/message error:", err);
      return res.status(500).json({ error: "Server error" });
    }
  });

  console.log("Public scan endpoints mounted.");
} else {
  console.warn("Public scan endpoints not mounted: Car and/or Message model missing.");
}

// If parking_session model exists, add debug session-by-id route
if (Parkingsession) {
  app.get("/api/sessions/id/:id", async (req, res) => {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid session id format" });
      const session = await Parkingsession.findById(id).lean();
      if (!session) return res.status(404).json({ error: "Session not found" });
      const fee = session.fee ?? (session.metadata && session.metadata.fee) ?? 0;
      session.fee = fee;
      return res.json(session);
    } catch (err) {
      console.error("GET /api/sessions/id/:id error:", err);
      return res.status(500).json({ error: "Server error" });
    }
  });
  console.log("Debug session route /api/sessions/id/:id mounted.");
} else {
  console.warn("Debug session route not mounted: parking_session model missing.");
}

// root test
app.get("/", (req, res) => res.json({ status: "success", message: "ParkLink backend is running (safe mode)" }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
