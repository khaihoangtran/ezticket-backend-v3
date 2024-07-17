const Checkout = require('./Model');
const Booking = require('../Booking/Model');
const TicketType = require('../TicketType/Model');
const Ticket = require('../Ticket/Model');
const PAYMENTS = require('../../utils/payments');
const CRYPTO = require('../../utils/crypto');
require('dotenv').config();
const DOMAIN_URL = process.env.DOMAIN_URL || 'http://localhost:3000'
const secretKey = process.env.ACCESS_TOKEN_SECRET;

// [POST] -> api/checkout/access_payment
module.exports.POST_CreatePaymentSession = async (req, res, next) => {
    const { event_id, booking_id, total, owner } = req.body;

    const booking = await Booking.findById(booking_id).populate({
        path: 'tickets',
        populate: { path: 'ticket_type', populate: { path: 'event', select: 'slug' } },
    });
    const event_slug = booking.tickets[0].ticket_type.event.slug;

    if (booking.status === 'completed') {
        return res.status(200).json({
            success: false,
            is_paid: true,
            msg: 'Đơn hàng đã thanh toán',
        });
    }

    const token = CRYPTO.encryptAES(
        {
            owner: owner,
            event_id: event_id,
            booking_id: booking_id,
            total: total,
        },
        secretKey,
    );

    let session_url = '';

    switch (booking.payment_type) {
        case 'stripe': {
            const rate = await PAYMENTS.exchangeRate('vnd', 'usd');
            session_url = await PAYMENTS.createStripeSession({
                items: booking.tickets.map((item) => {
                    return {
                        name: item.ticket_type.ticket_name,
                        price: item.price * 1.06 * rate,
                        quantity: item.qty,
                        image: `https://static.vecteezy.com/system/resources/previews/012/027/723/non_2x/admit-one-ticket-icon-black-and-white-isolated-wite-free-vector.jpg`,
                    };
                }),
                success_url: `${DOMAIN_URL}/checkout/success?token=${token}`,
                cancel_url: `${DOMAIN_URL}/event/${event_slug}/booking/${booking_id}/checkout`,
            });
            break;
        }
        case 'paypal': {
            const rate = await PAYMENTS.exchangeRate('vnd', 'usd');
            session_url = await PAYMENTS.createPaypalSession({
                items: booking.tickets.map((item) => {
                    return {
                        name: item.ticket_type.ticket_name,
                        price: item.price * 1.06 * rate,
                        quantity: item.qty,
                    };
                }),
                total: total * rate,
                success_url: `${DOMAIN_URL}/checkout/success?token=${token}`,
                cancel_url: `${DOMAIN_URL}/event/${event_slug}/booking/${booking_id}/checkout`,
            });
            break;
        }
        default: {
            break;
        }
    }

    if (!session_url) {
        return res.status(500).json({
            success: false,
            msg: 'Tạo cổng thanh toán thất bại',
        });
    }

    return res.status(200).json({
        success: true,
        session_url,
        msg: 'Tạo cổng thanh toán thành công',
    });
};

// [POST] -> api/checkout/create
module.exports.POST_CreateCheckout = async (req, res, next) => {
    const { token } = req.body;
    const { event_id, booking_id, total, owner } = CRYPTO.decryptAES(token, secretKey);

    return await Checkout.create({
        event: event_id,
        booking: booking_id,
        total: total,
    })
        .then(async (checkout) => {
            await Booking.findByIdAndUpdate(checkout.booking, { $set: { status: 'completed' } }).then(
                async (booking) => {
                    for (const ticket of booking.tickets) {
                        // Update TicketType Stock
                        let ticket_type = await TicketType.findById(ticket.ticket_type);
                        ticket_type.n_sold += ticket.qty;
                        ticket_type.save();

                        // Insert Tickets for Booking
                        let payloads = [];
                        let oneMonthLater = new Date();
                        oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);

                        for (let i = 0; i < ticket.qty; i++) {
                            payloads.push({
                                owner: owner,
                                trade_code: booking.trade_code,
                                ticket_type: ticket.ticket_type,
                                ticket_code: CRYPTO.createCode(8).toUpperCase(),
                                expiry: oneMonthLater,
                                status: 'sold',
                            });
                        }

                        Ticket.insertMany(payloads);
                    }
                },
            );

            return res.status(200).json({
                success: true,
                checkout,
                msg: 'Tạo checkout thành công',
            });
        })
        .catch((err) => {
            return res.status(500).json({
                success: false,
                msg: 'Tạo checkout thất bại: ' + err,
            });
        });
};
