const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Event = new Schema(
    {
        event_name: { type: String, required: true },
        category: { type: Schema.Types.ObjectId, ref: 'Category' },
        author: { type: Schema.Types.ObjectId, ref: 'User' },
        occur_date: { type: Date, required: true },
        time: { type: String, require: true },
        location: { type: String, required: true },
        address: { type: String, required: true },
        introduce: { type: String },
        banner: { type: String, required: true },
        license: { type: String },
        status: { type: String, default: "published", enum: ['published', 'pending', 'ended'] }, // pending -> published -> ended 
        slug: { type: String, required: true },
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model('Event', Event);