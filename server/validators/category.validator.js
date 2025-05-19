import Joi from 'joi';

const categoryValidateSchema = Joi.object({
    categoryName: Joi.string()
        .min(3)
        .max(50)
        .required()
        .messages({
        'string.empty': 'Category name is required',
        'string.min': 'Category name must be at least 3 characters',
        'string.max': 'Category name must be less than 50 characters',
        }),

    slug: Joi.string()
        .min(3)
        .required()
        .messages({
        'string.empty': 'Slug is required',
        'string.min': 'Slug must be at least 3 characters',
        }),

    categoryDescription: Joi.string()
        .min(10)
        .max(1000)
        .required()
        .messages({
        'string.empty': 'Description is required',
        'string.min': 'Description must be at least 10 characters',
        'string.max': 'Description must be less than 1000 characters',
        }),
});

export default categoryValidateSchema;
