const Booking = require('./Model');
const Ticket = require('../Ticket/Model');
const TicketType = require('../TicketType/Model');

// [POST] -> api/booking/create
module.exports.POST_CreateBooking = async (req, res, next) => {
    const { items, payment_type, temporary_cost, customer } = req.body;

    return await Booking.create({
        tickets: items.map((item) => {
            return {
                ticket_type: item._id,
                price: item.price,
                qty: item.qty,
            };
        }),
        trade_code: `EZ${Math.floor(Math.random() * 99999999)}`,
        payment_type,
        temporary_cost,
        customer,
        status: 'pending',
    })
        .then(async (booking) => {
            if (!booking) {
                return res.status(404).json({
                    success: false,
                    msg: `Không tìm thấy booking hoặc booking đã kết thúc`,
                });
            }

            for (const item of items) {
                let ticket_type = await TicketType.findById(item._id);
                ticket_type.n_stock -= item.qty;
                await ticket_type.save();
            }

            return res.status(200).json({
                success: true,
                booking_id: booking._id,
                msg: 'Tạo booking vé thành công',
            });
        })
        .catch((err) => {
            return res.status(500).json({
                success: false,
                msg: `Tạo booking vé thất bại: ` + err,
            });
        });
};

// [PUT] -> api/booking/complete/:booking_id
module.exports.PUT_CompleteBooking = async (req, res, next) => {
    const { booking_id } = req.params;

    return await Booking.findOneAndUpdate(
        { _id: booking_id, status: 'pending' },
        { $set: { status: 'completed' } },
        { returnOriginal: false },
    )
        .populate({
            path: 'tickets',
            select: '-status -__v -createdAt -updatedAt',
            populate: {
                path: 'event',
                select: '-introduce -__v -createdAt -updatedAt',
                populate: { path: 'categories', select: '-__v -createdAt -updatedAt' },
            },
        })
        .then(async (booking) => {
            if (!booking) {
                return res.status(404).json({
                    success: false,
                    msg: `Không tìm thấy booking hoặc booking đã kết thúc`,
                });
            }

            return await Ticket.updateMany(
                { _id: { $in: booking.tickets }, status: 'pending' },
                { status: 'sold' },
            ).then((result) => {
                return res.status(200).json({
                    success: true,
                    booking,
                    result,
                    msg: `Hoàn tất booking vé thành công`,
                });
            });
        })
        .catch((err) => {
            return res.status(500).json({
                success: false,
                msg: `Hoàn tất booking vé thất bại: ` + err,
            });
        });
};

// [PUT] -> api/booking/cancel/:booking_id
module.exports.PUT_CancelBooking = async (req, res, next) => {
    const { booking_id } = req.params;

    return await Booking.findOneAndUpdate(
        { _id: booking_id, status: 'pending' },
        { $set: { status: 'canceled' } },
        { returnOriginal: false },
    )
        .then(async (booking) => {
            if (!booking) {
                return res.status(404).json({
                    success: false,
                    msg: `Không tìm thấy booking hoặc booking đã kết thúc`,
                });
            }

            for (const ticket of booking.tickets) {
                let ticket_type = await TicketType.findById(ticket.ticket_type);
                ticket_type.n_stock += ticket.qty;
                await ticket_type.save();
            }

            return res.status(200).json({
                success: true,
                booking,
                msg: `Hủy booking vé thành công`,
            });
        })
        .catch((err) => {
            return res.status(500).json({
                success: false,
                msg: `Hủy booking vé thất bại: ` + err,
            });
        });
};

// [GET] -> api/booking/detail/:booking_id
module.exports.GET_BookingDetail = async (req, res, next) => {
    const { booking_id } = req.params;

    return await Booking.findById(booking_id)
        .populate({ path: 'tickets', populate: { path: 'ticket_type' } })
        .lean()
        .then((booking) => {
            if (!booking) {
                return res.status(404).json({
                    success: false,
                    msg: `Không tìm thấy booking vé`,
                });
            }
            return res.status(200).json({
                success: true,
                booking,
                msg: `Tìm booking vé thành công`,
            });
        })
        .catch((err) => {
            return res.status(500).json({
                success: false,
                msg: `Tìm booking vé thất bại: ` + err,
            });
        });
};

// [GET] -> api/booking/search?
module.exports.GET_SearchBookings = async (req, res, next) => {
    return await Booking.find({ ...req.query })
        .populate({ path: 'tickets.ticket_type', populate: { path: 'event', select: '_id banner event_name' } })
        .sort({ createdAt: -1 })
        .lean()
        .then((bookings) => {
            return res.status(200).json({
                success: true,
                bookings: bookings.map((booking) => {
                    return {
                        ...booking,
                        event: booking.tickets[0].ticket_type.event,
                    };
                }),
                msg: `Đã tìm thấy ${bookings.length} booking vé`,
            });
        })
        .catch((err) => {
            return res.status(500).json({
                success: false,
                msg: `Tìm booking vé thất bại: ` + err,
            });
        });
};
