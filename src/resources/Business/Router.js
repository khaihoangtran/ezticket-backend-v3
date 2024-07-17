const { POST_CreateBusiness, PUT_UpdateBusiness, GET_BusinessDetail } = require('./Resolver');
const { Validate_CreateBusiness } = require('./Validator');

const router = require('express').Router();

router.post('/create/:user_id', Validate_CreateBusiness, POST_CreateBusiness);

router.put('/update/:business_id', PUT_UpdateBusiness);

router.get('/detail/:business_id', GET_BusinessDetail);

module.exports = router;