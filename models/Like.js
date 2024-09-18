const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema({
  userid: {
    type: mongoose.Schema.Types.ObjectId, 
    required: true,
    
  },
  complaintid: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    
  }
});

const Like = mongoose.model('Like', likeSchema);
module.exports = Like;
