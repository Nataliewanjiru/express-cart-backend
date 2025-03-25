const mongoose = require('mongoose');

const CartGroupSchema = new mongoose.Schema({
  groupName: { type: String, required: true, unique: true },
  description: { type: String },
  groupImage: { type: String, default: "https://images.pexels.com/photos/5233032/pexels-photo-5233032.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"}, // URL or path to the group's image
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Array of user IDs
  cartItems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'CartItems' }], // Array of cart item IDs
  createdAt: { type: Date, default: Date.now } // Auto-generated timestamp
});

module.exports = mongoose.model('cartGroup', CartGroupSchema);
