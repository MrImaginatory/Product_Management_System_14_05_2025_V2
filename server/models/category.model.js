import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
    categoryName: {
        type: String,
        required: [true, "Please Provide Category Name"],
        minLength: 3,
        maxLength: 50,
        trim: true,
    },
    slug: {
        type: String,
        required: [true, "Please Provide Slug"],
        minLength: 3,
        trim: true,
        lowercase: true,
    },
    categoryDescription: {
        type: String,
        required: [true, "Please Provide Description"],
        minLength: 10,
        maxLength: 1000,
        trim: true,
    },
    subCategoriesName: {
        type: [String],
        required: true,
        validate: {
            validator: arr => arr.every(str => typeof str === 'string' && str.length >= 3),
            message: "Each subcategory must be a string with at least 3 characters"
        }
    },
    categoryImage: {
        type: String,
    },
    cloudinaryId: {
        type: String,
    }
}, {
    timestamps: true // Adds createdAt and updatedAt
});

const Category = mongoose.model('Category', categorySchema);
export default Category;
