const User_Router = require('./User/Router');
const Event_Router = require('./Event/Router');
const Category_Router = require('./Category/Router');
const Ticket_Router = require('./Ticket/Router');
const Booking_Router = require('./Booking/Router');
const Business_Router = require('./Business/Router');
const TicketType_Router = require('./TicketType/Router');
const Checkout_Router = require('./Checkout/Router');
const Admin_Router = require('./Admin/Router');
const Refund_Router = require('./Refund/Router');


const router = require('express').Router();

router.use('/user', User_Router);

router.use('/event', Event_Router);

router.use('/category', Category_Router);

router.use('/ticket', Ticket_Router);

router.use('/booking', Booking_Router);

router.use('/business', Business_Router);

router.use('/ticket_type', TicketType_Router);

router.use('/checkout', Checkout_Router);

router.use('/admin', Admin_Router);

router.use('/refund', Refund_Router);

module.exports = router;