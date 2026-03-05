const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, unique: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    customerName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: '', maxlength: 500 },
    items: [{ type: String }], // names of items ordered (for display)
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);
