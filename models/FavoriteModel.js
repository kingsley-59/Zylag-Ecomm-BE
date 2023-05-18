const { Schema, Types, model } = require("mongoose");



const favoriteSchema = new Schema({
    user: {
        type: Types.ObjectId,
        ref: 'User',
        required: true
    },
    ad: {
        type: Types.ObjectId,
        ref: 'Ad',
        required: true
    },
}, {timestamps: true})


const Favorite = model('Favorite', favoriteSchema);
module.exports = Favorite;