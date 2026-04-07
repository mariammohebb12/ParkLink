const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  qrId: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  time: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Message", MessageSchema);