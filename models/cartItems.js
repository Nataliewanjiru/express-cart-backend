const mongoose = require('mongoose');

const CartItemsSchema = new mongoose.Schema({
    product: { type: String, required: true },
    quantity: { type: Number, required: true, default: 1 },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    group:{type: mongoose.Schema.Types.ObjectId, ref: 'CartGroup', required: true},
    addedAt: { type: Date, default: Date.now }
  });
  
  module.exports = mongoose.model('CartItems', CartItemsSchema);
  