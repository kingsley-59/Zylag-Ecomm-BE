const { Schema, model } = require("mongoose");



const deliverySchema = new Schema({
    name: {
        type: String,
        unique: true
    },
}, { timestamps: true });


const Delivery = model('Delivery', deliverySchema);
module.exports = Delivery;