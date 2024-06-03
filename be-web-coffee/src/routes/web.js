const { getHomePage, handleLogin, handleRegister, handleUpdate, getProduct, getProductCoffee, getProductTea, getProductOther } = require('../controllers/homeControllers');


const express = require('express');
const router = express.Router();

router.get('/api/products', getHomePage);
router.post('/api/login', handleLogin);
router.post('/api/register', handleRegister);
router.post('/api/update', handleUpdate);
router.get('/api/products/:id', getProduct);
router.get('/api/getProductCoffee', getProductCoffee);
router.get('/api/getProductTea', getProductTea);
router.get('/api/getProductOther', getProductOther);
module.exports = router;    