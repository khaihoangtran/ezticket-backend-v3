const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TicketType = new Schema(
    {
        event: { type: Schema.Types.ObjectId, ref: 'Event' },
        ticket_name: { type: String, required: true },
        price: { type: Number, required: true },
        n_sold: { type: Number, default: 0 },
        n_stock: { type: Number, default: 0 },
        is_selling: { type: Boolean, default: false }
    },
    {
        timestamps: true,
    },
);

module.exports = mongoose.model('TicketType', TicketType);

