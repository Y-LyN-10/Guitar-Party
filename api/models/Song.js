var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var songSchema = mongoose.Schema({
    company: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    lyrics: {type: String, require: '{PATH} is required'}
});

var Song = mongoose.model('Song', songSchema);