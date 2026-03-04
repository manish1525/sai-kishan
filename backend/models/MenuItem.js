const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    nameHi: { type: String, default: '' },
    category: { type: String, required: true },
    type: { type: String, enum: ['veg', 'nonveg'], required: true },
    price: { type: Number, required: true, min: 0 },
    desc: { type: String, default: '' },
    emoji: { type: String, default: '🍽️' },
    available: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('MenuItem', menuItemSchema);
