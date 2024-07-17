const User = require('./Model');

module.exports.Validate_Register = async (req, res, next) => {
    const { email, fullname, phone, address } = req.body;

    if (!email.includes('@')) {
        return res.status(300).json({ success: false, msg: 'Email không hợp lệ' });
    }

    let user = await User.findOne({ email, phone });

    if (user) {
        return res.status(300).json({ success: false, msg: 'Email hoặc số diện thoại này đã được sử dụng' });
    }

    if (phone.length != 10) {
        return res.status(300).json({ success: false, msg: 'Số điện thoại phải có 10 chữ số' });
    }

    next();
};
