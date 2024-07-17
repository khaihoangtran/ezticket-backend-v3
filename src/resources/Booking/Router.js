const {
    POST_CreateBooking,
    GET_BookingDetail,
    GET_SearchBookings,
    PUT_CancelBooking,
    PUT_CompleteBooking,
} = require('./Resolver');
const { Validate_CreateBooking } = require('./Validator');
const router = require('express').Router();

router.post('/create', Validate_CreateBooking, POST_CreateBooking);

router.put('/cancel/:booking_id', PUT_CancelBooking);

router.put('/complete/:booking_id', PUT_CompleteBooking);

router.get('/detail/:booking_id', GET_BookingDetail);

router.get('/search', GET_SearchBookings);

module.exports = router;
