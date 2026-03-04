const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
    name: { type: String, required: true },
    emoji: { type: String, default: '🍽️' },
    price: { type: Number, required: true },
    qty: { type: Number, required: true, min: 1 },
}, { _id: false });

const orderSchema = new mongoose.Schema({
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    customerName: { type: String, required: true },
    customerPhone: { type: String },
    type: { type: String, enum: ['dinein', 'delivery'], required: true },
    // Dine-in
    table: { type: String },
    // Delivery
    address: { type: String },
    // Items
    items: [orderItemSchema],
    total: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'preparing', 'ready', 'done', 'cancelled'], default: 'pending' },
    note: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
