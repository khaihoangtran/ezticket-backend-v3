const Event = require('./Model');
const User = require('../User/Model');
const { createSlug } = require('../../utils/crypto')


module.exports.Validate_CreateEvent = async (req, res, next) => {
    const { license, banner } = req.files;
    const { author } = req.body;
    
    if(!license || !banner) {
        return res.status(300).json({
            success: false,
            msg: 'Vui lòng điền đầy đủ thông tin'
        })
    }

    let user = await User.findOne({_id: author}).lean();
    if(!user || user.level !== 2) {
        return res.status(300).json({
            success: false,
            msg: 'Tài khoản không hợp lệ hoặc không đủ thẩm quyền'
        })
    }
    
    next();
}
