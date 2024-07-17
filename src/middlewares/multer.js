const multer = require('multer');
const fs = require('fs-extra');
require('dotenv').config();
const { createCode } = require('../utils/crypto');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let path = './src/public/uploads';
        if(!fs.existsSync(path)) {
            fs.mkdirSync(path, { recursive: true });
        }
        cb(null, path);
    },

    filename: (req, file, cb) => {
        let ext = file.originalname.substring(file.originalname.lastIndexOf('.'));
        cb(null, createCode(12) + ext);
    }
})


const upload = multer({
    storage: storage,
    limits: { fieldSize: 5 * 1024 * 1024 }
})


module.exports = { upload }