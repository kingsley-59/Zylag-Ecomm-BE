const { Schema } = require("mongoose");



const tagSchema = new Schema({
    name: {
        type: String,
        unique: true
    }
}, { timestamps: true });


const Tags = model('Tags', tagSchema);
module.exports = Tags;