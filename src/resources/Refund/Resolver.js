const fs = require('fs-extra');
const cloudinary = require('cloudinary').v2;
const Refund = require('./Model');

// [POST] -> api/refund/create
module.exports.POST_CreateRefund = async (req , res, next) => {
    const file = req.file;
    var attach = null;

    if (file) {
        // Upload banner mới len cloudinary
        let file_upload = await cloudinary.uploader.upload(file.path);
        if (!file_upload) {
            return res.status(500).json({
                success: false,
                msg: 'Cloudinary error',
            });
        }

        // Gắn banner mới khi có file mới
        attach = file_upload.url;
        // Xóa file multer upload lên
        fs.unlinkSync(file.path);
    }

    return await Refund.create({ ...req.body, attach})
        .then(refund => {
            return res.status(200).json({
                success: true,
                refund,
                msg: 'Tạo yêu cầu hoàn tiền thành công'
            })
        })
        .catch(err => {
            return res.status(500).json({
                success: false,
                msg: 'Tạo yêu cầu hoàn tiền thất bại: ' + err
            })
        })
}

// [GET] -> /api/refund/search?
module.exports.GET_RefundList = async (req, res, next) => {
    return await Refund.find({ ...req.query })
        .populate({ path: 'booking', populate: { path: 'customer', select: '_id fullname phone email'}})
        .sort({ createdAt: -1 })
        .lean()
        .then(refunds => {
            return res.status(200).json({
                success: true,
                refunds: refunds.map(refund => {
                    return {
                        ...refund, customer: {
                            fullname: refund.booking.customer.fullname,
                            phone: refund.booking.customer.phone,
                            email: refund.booking.customer.email
                        }
                    }
                }),
                msg: `Tìm thấy ${refunds.length} yêu cầu hoàn tiền` 
            })
        })
        .catch(err => {
            return res.status(500).json({
                success: false,
                msg: 'Tìm kiếm yêu cầu hoàn tiền thất bại: ' + err
            })
        })
}

