const mongoose = require('mongoose');

const CartItemsSchema = new mongoose.Schema({
    product: { type: String, required: true },
    image: { type: String,default:"https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar…"},
    quantity: { type: Number, required: true, default: 1 },
    size: { type: String,default:"none" },
    color: { type: String ,default:"none"},
    price: { type: Number, required: true },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    group:{type: mongoose.Schema.Types.ObjectId, ref: 'CartGroup', required: true},
    addedAt: { type: Date, default: Date.now }
  });
  
  module.exports = mongoose.model('CartItems', CartItemsSchema);
  