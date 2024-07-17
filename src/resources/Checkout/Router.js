const { POST_CreatePaymentSession, POST_CreateCheckout } = require('./Resolver');

const router = require('express').Router();

router.post('/access_payment', POST_CreatePaymentSession);

router.post('/create', POST_CreateCheckout);

module.exports = router;