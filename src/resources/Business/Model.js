const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Business = new Schema(
    {
        business_name: { type: String },
        business_type: { type: String },
        tax_no: { type: String },
        contact: { type: String },
        hotline: { type: String },
        location: { type: String},   
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model('Business', Business);