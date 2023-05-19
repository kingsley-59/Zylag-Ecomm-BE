const { Schema, Types, model } = require("mongoose");



const messageSchema = new Schema({
    from: {
        type: Types.ObjectId,
        ref: 'User',
        required: true
    },
    to: {
        type: Types.ObjectId,
        ref: 'User',
        required: true
    },
    ad: {
        type: Types.ObjectId,
        ref: 'User',
        required: true
    },
}, {timestamps: true });


const Message = model('Message', messageSchema);
module.exports = Message;