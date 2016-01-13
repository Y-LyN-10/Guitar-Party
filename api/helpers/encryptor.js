var utils = require('../config/utils');

module.exports = {
    generateSalt: function () {
        return utils.randomKey(64);
    },
    generateHash: function (salt, password) {
        return utils.encode(password) ^ salt;
    }
};