const { POST_SearchBooking, GET_RefundList, POST_AdminLogin, ANY_CheckAdminToken, PUT_ProveEvent, PUT_ProveRefund } = require('./Resolver');
const router = require('express').Router();


router.post('/search_booking', POST_SearchBooking);

router.get('/refund_list', GET_RefundList);

router.post('/login', POST_AdminLogin);

router.get('/test_authentication', ANY_CheckAdminToken);

router.put('/prove_event/:event_id/:is_approved', PUT_ProveEvent);

router.put('/prove_refund/:refund_id/:is_approved', PUT_ProveRefund);

module.exports = router;