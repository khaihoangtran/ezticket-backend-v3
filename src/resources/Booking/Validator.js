const Booking = require('./Model');
const Ticket = require('../Ticket/Model');
const TicketType = require('../TicketType/Model');

module.exports.Validate_CreateBooking = async (req, res, next) => {
    const { items } = req.body;

    let counter = 0;

    for (const item of items) {
        let count = await TicketType.countDocuments({ _id: item._id, n_stock: { $gte: item.qty } });
        counter += count;
    }

    if (counter === items.length) {
        next();
    } else {
        return res.status(400).json({
            success: false,
            msg: 'Một vài loại vé bạn chọn đã hết',
        });
    }
};
