const { Schema, model, Types } = require("mongoose");



const PromoSchema = new Schema({
    category: {
        type: String,
        required: true,
    },
    duration: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        default: 0,
    },
    createdBy: {
        type: Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

const PromoOption = model('PromoOption', PromoSchema);
module.exports = PromoOption;