const asyncHandler = require('express-async-handler');
const Cart = require('../models/Cart');

const getCart = asyncHandler(async (req, res) => {
    if (!req.user || !req.user._id) {
        return res.status(401).json({ message: 'User not found in request' });
    }
    
    console.log(`DEBUG: TESTING - BYPASSING DB FOR USER: ${req.user._id}`);
    res.json([]);
});

const saveCart = asyncHandler(async (req, res) => {
    const { items } = req.body;
    if (!req.user || !req.user._id) {
        return res.status(401).json({ message: 'User not found in request' });
    }
    if (!Array.isArray(items)) {
        return res.status(400).json({ message: 'Items must be an array' });
    }

    // Atomic findOneAndUpdate or similar would be better, but keeping it simple for now
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
    await Cart.findOneAndDelete({ user: req.user._id });
    res.json({ message: 'Cart cleared' });
});

module.exports = { getCart, saveCart, clearCart };
