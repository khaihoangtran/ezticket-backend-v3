const router = require('express').Router();
const {
    POST_CreateEvent,
    PUT_UpdateEvent,
    DELETE_RemoveEvent,
    GET_EventDetail,
    GET_SearchEvents,
    POST_UploadCK,
    GET_EventView,
    PUT_UpdateTicketTypesOfEvent,
    GET_SearchEventsByCategory,
} = require('./Resolver');
const { upload } = require('../../middlewares/multer');
const { Validate_CreateEvent } = require('./Validator');
const { ANY_AuthenticateToken } = require('../User/Resolver');

router.post(
    '/create',
    upload.fields([
        { name: 'banner', maxCount: 1 }, 
        { name: 'license', maxCount: 1 },
    ]),
    Validate_CreateEvent,
    POST_CreateEvent,
);

router.put('/update/:event_id', upload.single('banner'), PUT_UpdateTicketTypesOfEvent, PUT_UpdateEvent);

router.delete('/delete/:event_id', DELETE_RemoveEvent);

router.get('/detail/:event_id', GET_EventDetail);

router.get('/view/:event_slug', GET_EventView);

router.get('/search', GET_SearchEvents);

router.get('/search_by_category', GET_SearchEventsByCategory);

router.post('/uploadCK', upload.single('uploadImg'), POST_UploadCK);

module.exports = router;
