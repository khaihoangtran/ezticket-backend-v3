const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const User = new Schema(
    {
        email: { type: String, required: true },
        fullname: { type: String, required: true },
        phone: { type: String, required: true },
        address: { type: String },
        level: { type: Number, default: 1 }, // default là 1
        business: { type: Schema.Types.ObjectId, ref: 'Business'}
    },
    {
        timestamps: true,
    },
);

module.exports = mongoose.model('User', User);