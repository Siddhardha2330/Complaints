const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  branch: {
    type: String,
    required: true,
  },
  regno: {
    type: String,
    required: true,
  },
  complaint: {
    type: String,
    required: true,
  },
  likes: {
    type: Number,
    default: 0,
  }
});

const Complaint = mongoose.model('Complaint', complaintSchema);
module.exports = Complaint;
