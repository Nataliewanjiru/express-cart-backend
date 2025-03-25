const mongoose = require('mongoose');

const MembershipSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'cartGroup', required: true },
    role: { type: String, enum: ['member', 'admin'], default: 'member' },
    status: { type: String, enum: ['active', 'pending', 'inactive', 'banned', 'removed'], default: 'active' },
  },
  { timestamps: true } //  Adds createdAt & updatedAt automatically
);

//Ensure a user can't join the same group multiple times
MembershipSchema.index({ user: 1, group: 1 }, { unique: true });

module.exports = mongoose.model('Membership', MembershipSchema);
