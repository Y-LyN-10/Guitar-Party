var mongoose = require('mongoose'),
    encryptor = require('../helpers/encryptor'),
    Schema = mongoose.Schema;

var userSchema = mongoose.Schema({
    username: { type: String, require: '{PATH} is required', unique: true, minlength: 3, maxlength: 30 },
    email: { type: String, require: '{PATH} is required' },
    pictureUrl: { type: String, default: 'https://www.guitardudeproducts.com/GDP/includes/templates/CUSTOM/images/ProductImageGuitarPicks/MeatLoafGuitarPickWhiteBBorderZenCart.jpg' },
    salt: String,
    hashPass: String,
    roles: [String],
    songs: [{ type: Schema.Types.ObjectId, ref: 'Song' }],
    repertoire: { type: Schema.Types.ObjectId, ref: 'Repertoire' }
});

userSchema.method({
    authenticate: function(password) {
        if (encryptor.generateHash(this.salt, password) === this.hashPass) {
            return true;
        }
        else {
            return false;
        }
    }
});

var User = mongoose.model('User', userSchema);