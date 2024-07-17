const { POST_CreateUser, POST_Login, POST_ConfirmOTP, ANY_AuthenticateToken, GET_UserList } = require('./Resolver');
const { Validate_Register } = require('./Validator');
const router = require('express').Router();

// [POST] -> api/user/register
router.post('/register', Validate_Register, POST_CreateUser);

// [POST] -> api/user/login
router.post('/login', POST_Login);

// [POST] -> api/user/confirm_otp
router.post('/confirm_otp', POST_ConfirmOTP);

// [GET] -> api/user/test_authentication (need token on Headers)
router.get('/test_authentication', ANY_AuthenticateToken, (req, res, next) => {
    return res.json('Authenticated');
})

router.get('/search', GET_UserList);

module.exports = router;