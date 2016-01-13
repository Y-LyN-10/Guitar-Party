var encryptor = require('../helpers/encryptor');

module.exports = {
    generateSalt: function () {
        return encryptor.randomKey(64);
    },
    generateHash: function (salt, password) {
        return encryptor.encode(password) ^ salt;
    }
};