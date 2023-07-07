const { Schema, Types, model } = require("mongoose");


const CategorySchema = new Schema({
    name: { type: String, required: true, unique: true },
    image: { type: String },
    parent: { type: Types.ObjectId, ref: 'Category' },
    level: { type: Number, default: 1 },
}, { timestamps: true });


const Category = model('Category', CategorySchema);
module.exports = Category;