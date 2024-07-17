const Business = require('./Model');
const User = require('../User/Model');

// [POST] -> api/business/create/:user_id
module.exports.POST_CreateBusiness = async (req, res, next) => {
    const { user_id } = req.params
    return await Business.create({...req.body})
        .then(async business => {
            return await User.findByIdAndUpdate(user_id, { $set: { business }})
                .then(user => {
                    return res.status(200).json({
                        success: true,
                        user,
                        msg: `Tạo tổ chức thành công`
                    })
                })
        })
        .catch(err => {
            return res.status(500).json({
                success: false,
                msg: `Tạo tổ chức thất bại: ` + err
            })
        })
}

// [PUT] -> api/business/update/:business_id
module.exports.PUT_UpdateBusiness = async (req, res, next) => {
    const { business_id } = req.params;

    return await Business.findByIdAndUpdate(business_id, { $set: {...req.body} }, { returnOriginal: false })
        .then(business => {
            return res.status(200).json({
                success: true,
                business,
                msg: `Cập nhật tổ chức thành công`
            })
        })
        .catch(err => {
            return res.status(500).json({
                success: false,
                msg: `Cập nhật tổ chức thất bại: ` + err
            })
        })
}

// [GET] -> api/business/detail/:business_id
module.exports.GET_BusinessDetail = async (req, res, next) => {
    const { business_id } = req.params;

    return await Business.findById(business_id)
        .then(business => {
            return res.status(200).json({
                success: true,
                business,
                msg: 'Tìm kiếm thông tin tổ chức thành công'
            })
        })
        .catch(err => {
            return res.status(500).json({
                success: false,
                msg: 'Tìm kiếm thông tin tổ chức thất bại: ' + err
            })
        })
}
