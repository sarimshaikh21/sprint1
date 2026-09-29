const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  ticketId: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  description: { type: String, required: true },
  category: { 
  type: String, 
  required: true,
  enum: [
    'Technical Support',
    'Software Issue', // Match exactly what the frontend sends
    'Hardware Issue', 
    'Network Issue', 
    'Access Request', 
    'Other'
  ]
},
  status: { type: String, enum: ['Open', 'Resolved', 'Reopened'], default: 'Open' },
    priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  imagePath: { type: String }, // Added to store the uploaded file path
  feedback: {
    rating: { type: Number, min: 1, max: 5 },
    comment: { type: String, trim: true },
    submittedAt: { type: Date }
  }
}, { timestamps: true, collection: 'tickets' });



module.exports = mongoose.model('Ticket', ticketSchema);
