const { Schema, Types, model } = require("mongoose");


const CategorySchema = new Schema({
    name: { type: String, required: true },
    description: { type: String },
    image: { type: String },
    parent: { type: Types.ObjectId, ref: 'Category' },
    level: { type: Number },
}, { timestamps: true });


const Category = model('Category', CategorySchema);
module.exports = Category;