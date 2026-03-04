require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// ── Middleware ──────────────────────────────────────────────
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());

// ── Routes ──────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/menu', require('./routes/menu'));
app.use('/api/orders', require('./routes/orders'));

// ── Health Check ─────────────────────────────────────────────
app.get('/api/health', (_, res) => res.json({ ok: true, hotel: 'Hotel New Kishan', owner: 'Mr. Kuldip Khairnar' }));

// ── Global Error Handler ─────────────────────────────────────
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({ error: err.message || 'Server error' });
});

// ── DB + Start ───────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
const MONGO = process.env.MONGODB_URI || 'mongodb://localhost:27017/hotel_new_kishan';

mongoose.connect(MONGO)
    .then(() => {
        console.log('✅ MongoDB connected');
        app.listen(PORT, () => {
            console.log(`🏨 Hotel New Kishan API running on port ${PORT}`);
            console.log(`   Owner: Mr. Kuldip Khairnar`);
        });
    })
    .catch(err => { console.error('MongoDB connection failed:', err); process.exit(1); });
