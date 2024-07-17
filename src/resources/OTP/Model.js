const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OTP = new Schema({
    email: {
        type: String,
        required: true
    },
    code: {
        type: String,
        required: true,
        unique: true
    },
    created_at: {
        type: Date,
        expires: '120s',
        default: Date.now()
    }
})

module.exports =  mongoose.model('OTP', OTP);