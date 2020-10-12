const mongoose = require('mongoose');

//Create Schema
const UserSchema = new mongoose.Schema({
    id: {type: String, required: false},
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    subscriptions : {type: Array, required: true},
    date: {type: Date, default: Date.now},
});

module.exports = User = mongoose.model('users', UserSchema);