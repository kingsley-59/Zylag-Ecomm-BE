const { Schema, model } = require("mongoose");


const UserSchema = new Schema({
    fullname: { type: String },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String },
    address: { type: String },
    passwordHash: { type: String, required: true },
    emailIsVerified: { type: Boolean, default: false },
    photo: { type: String },
    isActive: { type: Boolean, default: true },
    role: { type: String, enum: ['user', 'admin', 'superadmin'], default: 'user' },

    emailVerificationToken: { type: String },
}, { timestamps: true });

const User = model('User', UserSchema);
module.exports = User;