const mongoose = require('mongoose');

const developerSchema = new mongoose.Schema({
  email:{
    type: String,
    required: true,
    unique: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password:{
    type: String,
    required: true,
  },
  // applications: [{
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'Application',
  // }],
});

const Developer = mongoose.model('Developer', developerSchema);
module.exports = Developer;
