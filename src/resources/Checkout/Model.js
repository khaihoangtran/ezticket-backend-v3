const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Checkout = new Schema(
    {
        event: { type: mongoose.Types.ObjectId, ref: 'Event'},
        booking: { type: mongoose.Types.ObjectId, ref: 'Booking'},
        tax: { type: Number , default: 0.06 },
        total: { type: Number , required: true }
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model('Checkout', Checkout);