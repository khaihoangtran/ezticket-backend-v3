const { POST_CreateTicketType, PUT_UpdateTicketType, DELETE_RemoveTicketType, GET_TicketTypeDetail, GET_SearchTicketTypes, POST_CheckStorage } = require('./Resolver');

const router = require('express').Router();


router.post('/create', POST_CreateTicketType);

router.put('/update/:type_id', PUT_UpdateTicketType);

router.delete('/delete/:type_id', DELETE_RemoveTicketType);

router.get('/detail/:type_id', GET_TicketTypeDetail);

router.get('/search', GET_SearchTicketTypes);

module.exports = router;