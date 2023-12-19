const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
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

const Admin = mongoose.model('Admin', adminSchema);
module.exports = Admin;
