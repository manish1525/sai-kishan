const router = require('express').Router();
const Order = require('../models/Order');
const { protect, ownerOnly, customerOnly } = require('../middleware/auth');

// ── GET all (Owner) ───────────────────────────────────────────
router.get('/all', protect, ownerOnly, async (req, res) => {
    try {
        const filter = {};
        if (req.query.status) filter.status = req.query.status;
        const orders = await Order.find(filter).sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── GET user orders (Customer) ────────────────────────────────
router.get('/myorders', protect, customerOnly, async (req, res) => {
    try {
        const orders = await Order.find({ customer: req.user._id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── GET single order by ID (Customer - only their own order) ──
router.get('/:id', protect, customerOnly, async (req, res) => {
    try {
        const order = await Order.findOne({ _id: req.params.id, customer: req.user._id });
        if (!order) return res.status(404).json({ error: 'Order not found' });
        res.json(order);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── POST new order (Customer) ─────────────────────────────────
router.post('/', protect, customerOnly, async (req, res) => {
    try {
        const orderData = {
            ...req.body,
            customer: req.user._id,
            customerName: req.user.name,
            customerPhone: req.user.phone,
        };
        const order = await Order.create(orderData);
        res.status(201).json(order);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

// ── PUT update status (Owner) ─────────────────────────────────
router.put('/:id/status', protect, ownerOnly, async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            { new: true }
        );
        if (!order) return res.status(404).json({ error: 'Order not found' });
        res.json(order);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

// ── GET stats (Owner) ─────────────────────────────────────────
router.get('/stats', protect, ownerOnly, async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const orders = await Order.find();

        const pending = orders.filter(o => o.status === 'pending');
        const doneToday = orders.filter(o =>
            o.status === 'done' && o.createdAt >= today
        );
        const revenueToday = doneToday.reduce((sum, o) => sum + o.total, 0);

        res.json({
            pending: pending.length,
            doneToday: doneToday.length,
            revenueToday
        });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
