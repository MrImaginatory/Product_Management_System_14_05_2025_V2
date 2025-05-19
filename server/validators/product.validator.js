import Joi from 'joi';
import mongoose from 'mongoose';

const objectId = Joi.string().custom((value, helpers) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.message('Invalid ObjectId');
    }
    return value;
}, 'ObjectId Validation');

const productValidationSchema = Joi.object({
    productName: Joi.string()
    .min(3)
    .max(50)
    .required()
    .messages({
        'string.empty': 'Product name is required',
        'string.min': 'Product name should be at least 3 characters',
        'string.max': 'Product name should not exceed 50 characters',
        }),

    categoryName: objectId.required().messages({
        'any.required': 'Category is required'
    }),

    subCategoryName: objectId.required().messages({
        'any.required': 'Subcategory is required'
    }),

    productDescription: Joi.string()
        .min(10)
        .max(255)
        .required()
        .messages({
        'string.empty': 'Description is required',
        'string.min': 'Description should be at least 10 characters',
        'string.max': 'Description should not exceed 255 characters',
        }),

    productPrice: Joi.number()
        .positive()
        .required()
        .messages({ 'number.base': 'Product price must be a number' }),

    productSalePrice: Joi.number()
        .positive()
        .required()
        .custom((value, helpers) => {
        const { productPrice } = helpers.state.ancestors[0];
        if (productPrice !== undefined && value >= productPrice) {
            return helpers.message('Sale price must be less than product price');
        }
        return value;
        }),

    stock: Joi.number()
        .integer()
        .min(0)
        .required()
        .messages({ 'number.base': 'Stock must be a number' }),

    weight: Joi.number()
        .positive()
        .required()
        .messages({ 'number.base': 'Weight must be a number' }),

    availability: Joi.string()
        .valid('Ready_To_Ship', 'On_Booking')
        .required()
        .messages({ 'any.only': 'Invalid availability option' }),

    productType: Joi.array()
        .items(Joi.string().valid('Hot_product', 'Best_Seller', "Today's_deal"))
        .min(1)
        .required()
        .messages({
        'array.includes': 'Invalid product type',
        'array.min': 'At least one product type is required'
        }),
});

export default productValidationSchema;
