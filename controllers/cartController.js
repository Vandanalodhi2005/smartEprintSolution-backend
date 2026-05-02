const asyncHandler = require('express-async-handler');
const Cart = require('../models/Cart');

const getCart = asyncHandler(async (req, res) => {
    if (!req.user || !req.user._id) {
        return res.status(401).json({ message: 'User not found in request' });
    }

    // Universal Admin Bypass - No persistent cart needed
    if (req.user._id === '000000000000000000000000') {
        return res.json([]);
    }
    
    const cart = await Cart.findOne({ user: req.user._id });
    res.json(cart ? cart.items : []);
});

const saveCart = asyncHandler(async (req, res) => {
    const { items } = req.body;
    if (!req.user || !req.user._id) {
        return res.status(401).json({ message: 'User not found in request' });
    }
    if (!Array.isArray(items)) {
        return res.status(400).json({ message: 'Items must be an array' });
    }

    // Universal Admin Bypass - No persistent cart needed
    if (req.user._id === '000000000000000000000000') {
        return res.json(items);
    }

    let cart = await Cart.findOne({ user: req.user._id });
    
    if (cart) {
        cart.items = items;
        await cart.save();
    } else {
        cart = await Cart.create({ user: req.user._id, items });
    }
    
    res.json(cart.items);
});

const clearCart = asyncHandler(async (req, res) => {
    if (!req.user || !req.user._id) {
        return res.status(401).json({ message: 'User not found in request' });
    }

    // Universal Admin Bypass - No persistent cart needed
    if (req.user._id === '000000000000000000000000') {
        return res.json({ message: 'Cart cleared' });
    }

    await Cart.findOneAndDelete({ user: req.user._id });
    res.json({ message: 'Cart cleared' });
});

module.exports = { getCart, saveCart, clearCart };
