const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  // userid: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'User',
  // },
  versions: [{  
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Version',
  }],
  activeversion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Version',
  },
});

const Application = mongoose.model('Application', applicationSchema);

module.exports = Application;
