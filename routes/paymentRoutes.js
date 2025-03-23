const express = require('express');
const router = express.Router();
const { createOrder, getPaymentStatus } = require('../controllers/paymentController');
const authenticate= require("../middleware/auth")


router.post('/create-order', authenticate,createOrder);




router.get('/payment-status/:orderId', getPaymentStatus);  

module.exports = router;
