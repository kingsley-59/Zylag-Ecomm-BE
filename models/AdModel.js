const { Schema, Types, model } = require("mongoose");


const adSchema = new Schema({
    // product details
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    category: {
        type: Types.ObjectId,
        ref: 'Category',
        required: true,
    },
    subCategory: {
        type: Types.ObjectId,
        ref: 'Category',
        required: true,
    },
    condition: {
        type: String,
        enum: ['new', 'used'],
        required: true,
    },
    photos: [
        {
            type: String,
        },
    ],
    video: {
        type: String,
    },
    tags: [{
        type: String,
    }],

    // ad details
    adType: {
        type: String,
        enum: ['forsale', 'tobuy'],
        default: 'forsale'
    },
    price: {
        type: Number,
        required: true,
    },
    quantity: {
        type: Number,
        default: 1,
    },
    status: {
        type: String,
        enum: ['active', 'pending', 'sold'],
        default: 'active',
    },

    // delivery details
    location: {
        type: Types.ObjectId,
        required: true,
    },
    deliveryType: [{
        type: Types.ObjectId,
        ref: 'Delivery'
    }],

    // person details
    phoneNumber: {
        type: String
    },
    entity: {
        type: String,
        enum: ['owner', 'business'],
        default: 'owner'
    },
    createdBy: {
        type: Types.ObjectId,
        ref: 'User',
        required: true,
    },
    views: {
        type: Number,
        default: 0,
    },
    // Add more properties based on your specific requirements
}, { timestamps: true });


const Ad = model('Ad', adSchema);
module.exports = Ad;