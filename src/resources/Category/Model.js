const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Category = new Schema(
    {
        category_name: { type: String, required: true },
        category_code: { type: Number, default: 1},
        slug: { type: String, required: true }
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model('Category', Category);