const { getHomePage, handleLogin, handleRegister, handleUpdate } = require('../controllers/homeControllers');


const express = require('express');
const router = express.Router();

router.get('/api/products', getHomePage);
router.post('/api/login', handleLogin)
router.post('/api/register', handleRegister)
router.post('/api/update', handleUpdate)

module.exports = router;