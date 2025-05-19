import mongoose from "mongoose";
const categorySchema = new mongoose.Schema({
    categoryName: {
        type: String,
        required: [true,"Please Provide CategoryName"],
        min: 3,
        max: 50,
    },
    subCategoriesName:{
        type: [String],
        required:true,
        min: 3,
        max: 50,
    },
    slug: {
        type: String,
        required: [true,"Please Provide Slug"],
        min: 3,
    },
    categoryDescription: {
        type: String,
        required: [true,"Please Provide Description"],
        min: 10,
        max: 255,
    },
    categoryImage:{
        type: String,
        // required: [true,"Please Provide Category Image"],
    },
    cloudinaryId:{
        type: String,
    }
});

const Category = mongoose.model('Category', categorySchema);

export default Category;