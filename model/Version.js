const mongoose = require('mongoose');
const versionSchema = new mongoose.Schema({
  versionname: {
    type: String,
    required: true,
  },
  registry: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  link: {
    type: String,
    required: true,
  },
});
const Version = mongoose.model('Version', versionSchema);
module.exports = Version;
