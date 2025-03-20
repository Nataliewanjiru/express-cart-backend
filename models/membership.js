const mongoose = require('mongoose');

const MembershipSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
  role: { type: String, enum: ['member', 'admin'], default: 'member' },
  joinedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['active', 'pending', 'inactive'], default: 'active' },
});


module.exports = mongoose.model('Membership', MembershipSchema);