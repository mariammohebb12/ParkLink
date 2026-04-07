const mongoose = require("mongoose");

const carSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  // The QR ID assigned automatically
  qrId: {
    type: String,
    required: true,
    unique: true
  },

  // Plate number from signup form
  plateNumber: {
    type: String,
    required: true
  },

  // NEW FIELDS to match your frontend
  carBrand: {
    type: String,
    required: true
  },

  carModel: {
    type: String,
    required: true
  },

  carColor: {
    type: String,
    required: true
  },

  // QR code image stored as data URL
  qrImage: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model("Car", carSchema);
