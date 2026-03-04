const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify any logged-in user
exports.protect = async (req, res, next) => {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer '))
        return res.status(401).json({ error: 'Not authenticated' });

    try {
        const decoded = jwt.verify(auth.split(' ')[1], process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');
        if (!req.user) return res.status(401).json({ error: 'User not found' });
        next();
    } catch {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
};

// Owner only
exports.ownerOnly = (req, res, next) => {
    if (req.user?.role !== 'owner')
        return res.status(403).json({ error: 'Owner access required' });
    next();
};

// Customer only
exports.customerOnly = (req, res, next) => {
    if (req.user?.role !== 'customer')
        return res.status(403).json({ error: 'Customer access required' });
    next();
};
