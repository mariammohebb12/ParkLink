const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  qrId: String,
  carType: String,
  plateNumber: String,
  qrImage: String  // URL or local file path to QR image
});

module.exports = mongoose.models.User || mongoose.model("User", UserSchema);
