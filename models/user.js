// User model. Passport adds username, password-hash, and login helper methods.
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose').default;

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    
});


UserSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model('User', UserSchema);
