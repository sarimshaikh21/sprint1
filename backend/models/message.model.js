const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  room: { type: String, required: true },
  author: { type: String, required: true },
  text: { type: String, required: true },
  time: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

// Just export the schema, not the model
module.exports = messageSchema;
