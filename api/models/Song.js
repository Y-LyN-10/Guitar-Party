var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var songSchema = mongoose.Schema({
    name: {type: String, require: '{PATH} is required'},
    company: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    lyrics: {type: String, require: '{PATH} is required'}
});

var Song = mongoose.model('Song', songSchema);