var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var repertoireSchema = mongoose.Schema({
    company: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    songs: [{ type: Schema.Types.ObjectId, ref: 'Song' }],
    location: {type: String, require: '{PATH} is required'},
    description: {type: String}
});

var Repertoire = mongoose.model('Repertoire', repertoireSchema);