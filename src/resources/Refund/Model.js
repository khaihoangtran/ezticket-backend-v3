const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Refund = new Schema(
    {
        booking: { type: mongoose.Types.ObjectId, ref: 'Booking' },
        reason: { type: String, required: true },
        attach: { type: String },
        status: { type: String, enum: ['pending', 'disapproved', 'approved']},
    },
    {
        timestamps: true,
    },
);

module.exports = mongoose.model('Refund', Refund);

