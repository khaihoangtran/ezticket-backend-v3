const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Booking = new Schema(
    {
        tickets: [
            {
                ticket_type: { type: Schema.Types.ObjectId, ref: 'TicketType', required: true },
                price: { type: Number, required: true },
                qty: { type: Number, required: true },
            },
        ],
        trade_code: { type: String , required: true },
        temporary_cost: { type: Number, required: true },
        status: { type: String, required: true, enum: ['pending', 'completed', 'canceled', 'refunded'] },
        payment_type: { type: String, required: true, enum: ['paypal', 'stripe', 'amazon'] },
        customer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    },
    {
        timestamps: true,
    },
);

module.exports = mongoose.model('Booking', Booking);
