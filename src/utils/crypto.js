const slugify = require('slugify');
const { uuid } = require('uuidv4');
const crypto = require('crypto-js')

module.exports.createSlug = (str) => {
    return slugify(str + '', {
        replacement: '-',
        remove: undefined,
        lower: true,
        strict: false,
        locale: 'vi',
        trim: true,
    }) + "-" + uuid().substring(0,5)
}

module.exports.createCode = (length) => {
    return uuid().substring(0, length);
}

module.exports.catchAsync = (fn) => (req, res, next) => {
    return Promise.resolve(fn(req, res, next)).catch((error) => res.status(404).render('error', { layout: false, error }));
}

module.exports.encryptAES = (data, secretKey) => {
    return crypto.AES.encrypt(JSON.stringify(data), secretKey).toString();
}

module.exports.decryptAES = (encode, secretKey) => {
    let bytes = crypto.AES.decrypt(encode, secretKey);
    return JSON.parse(bytes.toString(crypto.enc.Utf8));
}