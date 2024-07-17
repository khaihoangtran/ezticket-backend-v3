const router = require('express').Router();
const { upload } = require('../../middlewares/multer');
const { POST_CreateRefund, GET_RefundList } = require('./Resolver');

router.post('/create', upload.single('file'), POST_CreateRefund);

router.get('/search', GET_RefundList);

module.exports = router;