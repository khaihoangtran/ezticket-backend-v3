const express = require('express');
const app = express();
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser');
const cookie = require('cookie-parser');
const flash = require('flash');
const cors = require('cors');
const morgan = require('morgan');

require('dotenv').config();

const init = () => {
    app.use(cors());
    app.use(morgan('dev'));
    app.use(express.static(path.join(__dirname, '../public')));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cookie('EZT'));
    app.use(session({
        secret: 'nkeyskuo', // Một chuỗi bí mật dùng để ký session ID cookie
        resave: false, // Buộc lưu lại session vào store, ngay cả khi không có thay đổi
        saveUninitialized: true, // Lưu session mới mà chưa được sửa đổi
        cookie: { secure: false, maxAge: 30000000 } // Cài đặt cookie (đặt 'secure' thành true chỉ khi sử dụng HTTPS)
      }));
      
    app.use(flash());
    app.use(bodyParser.urlencoded({ extended: false }));
    return app;

}

module.exports = { init };