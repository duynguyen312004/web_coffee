const { getHomePage, handleLogin, handleRegister, handleUpdate, getProduct } = require('../controllers/homeControllers');


const express = require('express');
const router = express.Router();

router.get('/api/products', getHomePage);
router.post('/api/login', handleLogin);
router.post('/api/register', handleRegister);
router.post('/api/update', handleUpdate);
router.get('/api/products/:id', getProduct);
module.exports = router;    