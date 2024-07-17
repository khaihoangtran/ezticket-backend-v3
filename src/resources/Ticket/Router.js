const { POST_CreateTicket, PUT_UpdateTicket, DELETE_RemoveTicket, GET_TicketDetail, GET_SearchTickets, GET_ResendTicket, } = require('./Resolver');

const router = require('express').Router();

router.post('/create', POST_CreateTicket);

router.put('/update/:ticket_id', PUT_UpdateTicket);

router.delete('/delete/:ticket_id', DELETE_RemoveTicket);

router.get('/detail/:ticket_code', GET_TicketDetail);

router.get('/search', GET_SearchTickets);

router.get('/resend/:trade_code/:owner', GET_ResendTicket);
// router.get('/group_by_event/:event_id', GET_GroupByEvent);

module.exports = router;