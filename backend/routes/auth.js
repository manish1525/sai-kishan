const router = require('express').Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const sign = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// ── Customer Register ─────────────────────────────────────────
router.post('/customer/register', async (req, res) => {
    try {
        const { name, email, password, phone, address } = req.body;
        if (!name || !email || !password || !phone)
            return res.status(400).json({ error: 'All fields are required' });
        if (await User.findOne({ email }))
            return res.status(400).json({ error: 'Email already registered' });

        const user = await User.create({ name, email, password, phone, address, role: 'customer' });
        res.status(201).json({ token: sign(user._id), user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── Customer Login ────────────────────────────────────────────
router.post('/customer/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email, role: 'customer' });
        if (!user || !(await user.matchPassword(password)))
            return res.status(401).json({ error: 'Invalid email or password' });
        res.json({ token: sign(user._id), user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── Owner Register ────────────────────────────────────────────
router.post('/owner/register', async (req, res) => {
    try {
        const { name, email, password, phone, secretCode } = req.body;
        if (!name || !email || !password || !phone || !secretCode)
            return res.status(400).json({ error: 'All fields are required' });
        if (secretCode !== process.env.OWNER_SECRET_CODE)
            return res.status(403).json({ error: 'Invalid owner secret code' });
        if (await User.findOne({ email }))
            return res.status(400).json({ error: 'Email already registered' });

        const user = await User.create({ name, email, password, phone, role: 'owner', restaurantName: 'Hotel New Kishan' });
        res.status(201).json({ token: sign(user._id), user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── Owner Login ───────────────────────────────────────────────
router.post('/owner/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email, role: 'owner' });
        if (!user || !(await user.matchPassword(password)))
            return res.status(401).json({ error: 'Invalid email or password' });
        res.json({ token: sign(user._id), user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── Get Me ────────────────────────────────────────────────────
router.get('/me', protect, (req, res) => res.json({ user: req.user }));

module.exports = router;
