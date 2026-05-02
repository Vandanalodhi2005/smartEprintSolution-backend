const express = require('express');
const router = express.Router();
const { getProducts, getProductById, createProduct, updateProduct, deleteProduct, upload, uploadImages } = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .get(getProducts)
    .post(protect, admin, upload.array('images', 50), createProduct);

router.post('/upload', protect, admin, upload.array('images', 50), uploadImages);

router.route('/:id')
    .get(getProductById)
    .put(protect, admin, upload.array('images', 50), updateProduct)
    .delete(protect, admin, deleteProduct);

module.exports = router;
