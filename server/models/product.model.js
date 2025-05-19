import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    productName: {
        type: String,
        required: [true, "Please Provide Product Name"],
        minLength: 3,
        maxLength: 50,
        trim: true,
    },
    categoryName: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: [true, "Please Provide Category Reference"],
    },
    subCategoryName: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SubCategory",
        required: [true, "Please Provide Subcategory Reference"],
    },
    productDescription: {
        type: String,
        required: [true, "Please Provide Description"],
        minLength: 10,
        maxLength: 255,
        trim: true,
    },
    productDisplayImage: {
        type: String,
        // required: [true, "Please Provide Product Display Image"],
    },
    productImages: {
        type: [String],
        required: [true, "Please Provide Product Images"],
    },
    productPrice: {
        type: Number,
        required: [true, "Please Provide Product Price"],
        min: 1,
    },
    productSalePrice: {
        type: Number,
        required: [true, "Please Provide Sale Price"],
        min: 1,
        validate: {
            validator: function (value) {
                return value <= this.productPrice;
            },
            message: "Sale price must be less than original price",
        },
    },
    stock: {
        type: Number,
        required: [true, "Please Provide Stock"],
        min: 0,
    },
    weight: {
        type: Number,
        required: [true, "Please Provide Weight"],
        min: 1,
    },
    availability: {
        type: String,
        enum: ["Ready_To_Ship", "On_Booking"],
        required: [true, "Please Provide Availability Status"],
    },
    productType: {
        type: [String],
        enum: ["Hot_product", "Best_Seller", "Today's_deal"],
        required: [true, "Please Provide Product Type"],
    }
}, {
    timestamps: true // Adds createdAt and updatedAt
});

const Product = mongoose.model('Product', productSchema);
export default Product;
