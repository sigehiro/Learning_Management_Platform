const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    nickname: { type: String },
    gender: { type: String, enum: ['male', 'female', 'other'] },
    country: { type: String },
    language: { type: String },
    timeZone: { type: String },
    createdAt: { type: Date, default: Date.now },
    profileImage: {
        type: String,
        default: '/images/default-profile.png',
    },
})

module.exports = mongoose.model('User', UserSchema)
