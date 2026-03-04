const router = require('express').Router();
const MenuItem = require('../models/MenuItem');
const { protect, ownerOnly } = require('../middleware/auth');

// ── GET all (public) ──────────────────────────────────────────
router.get('/', async (req, res) => {
    try {
        const filter = { available: true };
        if (req.query.type) filter.type = req.query.type;
        const items = await MenuItem.find(filter).sort({ category: 1 });
        res.json(items);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── GET categories (public) ───────────────────────────────────
router.get('/categories', async (req, res) => {
    try {
        const filter = {};
        if (req.query.type) filter.type = req.query.type;
        const cats = await MenuItem.distinct('category', filter);
        res.json(cats);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── GET all including unavailable (owner) ─────────────────────
router.get('/all', protect, ownerOnly, async (req, res) => {
    try {
        const items = await MenuItem.find({}).sort({ category: 1 });
        res.json(items);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── POST add item (owner) ─────────────────────────────────────
router.post('/', protect, ownerOnly, async (req, res) => {
    try {
        const item = await MenuItem.create(req.body);
        res.status(201).json(item);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

// ── PUT update item (owner) ───────────────────────────────────
router.put('/:id', protect, ownerOnly, async (req, res) => {
    try {
        const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!item) return res.status(404).json({ error: 'Item not found' });
        res.json(item);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

// ── DELETE item (owner) ───────────────────────────────────────
router.delete('/:id', protect, ownerOnly, async (req, res) => {
    try {
        await MenuItem.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) { res.status(400).json({ error: err.message }); }
});

module.exports = router;
