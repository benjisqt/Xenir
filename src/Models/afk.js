const { model, Schema } = require('mongoose');

module.exports = model('afk', new Schema({
    Guild: String,
    User: String,
    Message: String,
    AFKSinceMS: String,
}))