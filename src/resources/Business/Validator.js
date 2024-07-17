const Business = require('./Model');
const User = require('../User/Model');

module.exports.Validate_CreateBusiness = async (req, res, next) => {
    const { user_id } = req.params;

    return await User.findById(user_id)
        .then(user => {
            if(user.business) {
                return res.status(300).json({
                    success: false,
                    business: user.business,
                    msg: `Người dùng đã cập nhật tổ chức từ trước`
                })
            }

            next();
        })
        .catch(err => {
            return res.status(500).json({
                success: false,
                msg: `Lỗi tìm người dùng: ` + err
            })
        })
}