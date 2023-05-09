const { Schema, Types } = require("mongoose");


const CategorySchema = new Schema({
    name: { type: String, required: true },
    description: { type: String },
    image: { type: String }
}, { timestamps: true });

const SubcategorySchema = new Schema({
    name: { type: String, required: true },
    description: { type: String },
    image: { type: String },
    category: { type: Types.ObjectId, ref: 'Category' },
    subcategory: { type: Types.ObjectId, ref: 'Category' }
}, { timestamps: true });


const Category = model('Category', CategorySchema);
const Subcategory = model('Subcategory', SubcategorySchema);

module.exports = {
    Category,
    Subcategory
}