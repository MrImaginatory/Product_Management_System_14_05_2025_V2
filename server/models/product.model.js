import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    productName: {
        type: String,
        required: [true,"Please Provide ProductName"],
        min: 3,
        max: 50,
    },
    categoryName:{
        type:mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: [true,"Please Provide Category Name"],
    },
    subCategoriesName:{
        type:[String],
        required: [true,"Please Provide Sub-Category Name"],
    },
    productDescription: {
        type: String,
        required: [true,"Please Provide Description"],
        min: 10,
        max: 255,
    },
    productDisplayImage:{
        type: String,
        required: [true,"Please Provide Product-DisplayImage"],
    },
    productImages:{
        type: [String],
        required: [true,"Please Provide ProductImage"],
    },
    productPrice: {
        type: Number,
        min:1,
        required: [true,"Please Provide Product Price"],
    },
    productSalePrice: {
    type: Number,
    min: 1,
    required: [true, "Please Provide Product Sale Price"],
    validate: {
        validator: function (value) {
        return value <= this.productPrice;
        },
        message: "Product Sale Price must be less than Product Price"
    }
    },
    stock:{
        type: Number,
        min:0,
        required: [true,"Please Provide Stock"],
    },
    weight:{
        type:Number,
        min: 0.1,
        required: [true,"Please Provide Weight"],
    },
    availability:{
        type: String,
        enum:["Ready_To_Ship","On_Booking"],
        required: [true,"Please Provide Availability"],
        default: "Ready_To_Ship"
    },
    productType:{
        type: [String],
        enum:["Hot_product","Best_Seller","Today's_deal"],
        required: [true,"Please Provide Product Type"],
    }
});


const Product = mongoose.model('Product', productSchema);
export default Product;