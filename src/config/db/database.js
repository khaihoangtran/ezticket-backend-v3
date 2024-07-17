const mongoose = require('mongoose');
require('dotenv').config();

const DB_URL = process.env.ATLAS_URL || 'mongodb://127.0.0.1:27017/Ezticket';
async function connect() {
    try {
        await mongoose.connect(DB_URL);
        console.log('Connected to database');
    } catch (error) {
        console.log('Error connecting to database');
    }
}

module.exports = { connect };
