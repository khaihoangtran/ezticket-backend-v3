const { POST_CreateCategory, DELETE_RemoveCategory, GET_AllCategories } = require('./Resoilver');

const router = require('express').Router();


router.post('/create', POST_CreateCategory);

router.delete('/delete/:category_id', DELETE_RemoveCategory);

router.get('/all', GET_AllCategories)

module.exports = router;