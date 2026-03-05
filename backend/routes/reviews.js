const router = require('express').Router();
const Review = require('../models/Review');
const Order = require('../models/Order');
const { protect, ownerOnly, customerOnly } = require('../middleware/auth');

// ── POST: Customer submits a review ───────────────────────────
// Only allowed for 'done' orders, one review per order
router.post('/', protect, customerOnly, async (req, res) => {
    try {
        const { orderId, rating, comment } = req.body;

        // Validate order belongs to this customer and is done
        const order = await Order.findOne({ _id: orderId, customer: req.user._id });
        if (!order) return res.status(404).json({ error: 'Order nahi mila' });
        if (order.status !== 'done') return res.status(400).json({ error: 'Sirf delivered orders ka review de sakte hain' });

        // Check if review already exists for this order
        const existing = await Review.findOne({ order: orderId });
        if (existing) return res.status(400).json({ error: 'Is order ka review pehle se exist karta hai' });

        const itemNames = order.items.map(i => `${i.emoji} ${i.name}`);

        const review = await Review.create({
            order: orderId,
            customer: req.user._id,
            customerName: req.user.name,
            rating,
            comment: comment || '',
            items: itemNames,
        });

        res.status(201).json(review);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

// ── GET: Owner sees all reviews ───────────────────────────────
router.get('/all', protect, ownerOnly, async (req, res) => {
    try {
        const reviews = await Review.find().sort({ createdAt: -1 });
        res.json(reviews);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── GET: Customer sees their own reviews (which orderIds reviewed) ─
router.get('/my', protect, customerOnly, async (req, res) => {
    try {
        const reviews = await Review.find({ customer: req.user._id }).select('order');
        const reviewedOrderIds = reviews.map(r => r.order.toString());
        res.json({ reviewedOrderIds });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
