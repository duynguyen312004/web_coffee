const { getHomePage, handleLogin, handleRegister, handleUpdate,
    getProduct, getProductCoffee, getProductTea,
    getProductOther, handleDeleteProduct, createOrder,
    getProductCoffeeSorted, searchProductsByName,
    getProductTeaSorted, getProductOtherSorted,
    handleUpdateProduct, handleAddProduct, getOrder } = require('../controllers/homeControllers');

const multerConfig = require('../config/multer');
const express = require('express');
const router = express.Router();

router.get('/api/products', getHomePage);
router.post('/api/login', handleLogin);
router.post('/api/register', handleRegister);
router.post('/api/update', handleUpdate);
router.get('/api/products/:id', getProduct);
router.get('/api/getProductCoffee', getProductCoffee);
router.get('/api/getProductCoffeeSorted', getProductCoffeeSorted);
router.get('/api/searchProducts', searchProductsByName);
router.get('/api/getProductTeaSorted', getProductTeaSorted);
router.get('/api/getProductOtherSorted', getProductOtherSorted);
router.get('/api/getProductTea', getProductTea);
router.get('/api/getProductOther', getProductOther);
router.delete('/api/deleteProduct/:id', handleDeleteProduct);
router.post('/api/createOrder', createOrder);
router.put('/api/updateProduct/:id', handleUpdateProduct)
router.post('/api/addProduct', multerConfig.single('image'), handleAddProduct)
router.get('/api/orders', getOrder)
module.exports = router;    