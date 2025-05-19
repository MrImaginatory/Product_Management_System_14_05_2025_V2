import CategoryValidateSchema from "../validators/Category.validator.js";
import Category from "../models/category.model.js";
import asyncWrapper from "../utils/asyncWrapper.utils.js";
import uploadToCloudinary from '../utils/cloudinary.utils.js';
import saveImageLocally from '../utils/saveLocally.utils.js';
import cloudinary from '../constants/cloudinary.constant.js';
import ApiError from "../utils/apiError.utils.js";

const createCategory = asyncWrapper(async (req, res) => {
  await CategoryValidateSchema.validate(req.body);

  const categoryExists = await Category.findOne({ categoryName: req.body.categoryName });
  if (categoryExists) {
    throw new ApiError(400, 'Category already exists');
  }
  
  if (!req.file) {
    throw new ApiError(400, 'Category image is required');
  }

  if(req.file.size > 1024 * 500){
    throw new ApiError(400, 'Category image size should be less than 500KB');
  }

  let imageUrl = '';
  let cloudinaryId = '';

  if (req.file) {
    try {
      const result = await uploadToCloudinary(req.file);
      imageUrl = result.secure_url;
      cloudinaryId = result.public_id;
      console.log(cloudinaryId, imageUrl);
    } catch (err) {
      console.error('Cloudinary failed:', err.message);
      imageUrl = saveImageLocally(req.file); 
    }
  }

  const createdCategory = await Category.create({
    categoryName: req.body.categoryName,
    slug: req.body.slug,
    categoryDescription: req.body.categoryDescription,
    categoryImage: imageUrl,
    cloudinaryId: cloudinaryId,
  });

  return res.status(201).json({
    message: `Created Successfully`,
    category: createdCategory,
  });

});

const updateCategory = asyncWrapper(async (req, res) => {
  const categoryId = req.params.categoryId;
  const category = await Category.findById(categoryId);
  if (!category) return res.status(404).json({ message: 'Category not found' });

  let updatedFields = req.body;

  if (req.file) {
    try {
      if (category.cloudinaryId) {
        await cloudinary.uploader.destroy(category.cloudinaryId); // delete old image
      }
      const result = await uploadToCloudinary(req.file);
      updatedFields.imageUrl = result.secure_url;
      updatedFields.cloudinaryId = result.public_id;
    } catch (err) {
      console.error('Cloudinary failed:', err.message);
      updatedFields.imageUrl = saveImageLocally(req.file); // fallback
    }
  }

  const updatedCategory = await Category.findByIdAndUpdate(categoryId, updatedFields, { new: true });

  return res.status(200).json({
    message: `Updated ${updatedCategory.categoryName} Successfully`,
    category: updatedCategory,
  });
});

const deleteCategory = asyncWrapper(async (req, res) => {
  const categoryId = req.params.categoryId;
  const category = await Category.findById(categoryId);
  if (!category) return res.status(404).json({ message: 'Category not found' });

  if (category.cloudinaryId) {
    try {
      await cloudinary.uploader.destroy(category.cloudinaryId);
    } catch (err) {
      console.error('Failed to delete Cloudinary image');
    }
  }

  await Category.findByIdAndDelete(categoryId);

  return res.status(200).json({
    message: `Deleted ${category.categoryName} Successfully`,
    category,
  });
});

const createSubCategory = asyncWrapper(async (req, res) => {
    const categoryId = req.params.categoryId;

    const categoryExists = await Category.findById(categoryId);
    if (!categoryExists) {
        return res.status(404).json({message: 'Category not found'});
    }

    if(categoryExists.subCategoriesName.includes(req.body.subCategoriesName)){
        return res.status(400).json({message: 'Subcategory already exists'});
    }
    const createdSubCategory = await Category.findByIdAndUpdate(categoryId, { $push: { subCategoriesName: req.body.subCategoriesName } }, { new: true });

    return res.status(200).json({message:`Updated ${createdSubCategory.categoryName} Successfully`, category: createdSubCategory});
});

const updateSubCategory = asyncWrapper(async (req, res) => {
    const { categoryId } = req.params;
    const { oldSubCategoryName, newSubCategoryName } = req.body;

    console.log(req.body);

    const categoryExists = await Category.findById(categoryId);
    if (!categoryExists) {
        return res.status(404).json({ message: 'Category not found' });
    }

    const subCategoryIndex = categoryExists.subCategoriesName.indexOf(oldSubCategoryName);
    console.log(subCategoryIndex);
    
    if (subCategoryIndex === '-1') {
        return res.status(400).json({ message: 'Subcategory name does not match existing data' });
    }
    
    categoryExists.subCategoriesName[subCategoryIndex] = newSubCategoryName;
    const updatedCategory = await categoryExists.save()
    
    return res.status(200).json({
        message: `Subcategory updated successfully`,
        category: updatedCategory
    });
});

const deleteSubCategory = asyncWrapper(async (req, res) => {
    const categoryId = req.params.categoryId;
    const subCategoriesName = req.body.subCategoriesName;

    const categoryExists = await Category.findById(categoryId);
    if (!categoryExists) {
        return res.status(404).json({ message: 'Category not found' });
    }
    const subCategoryIndex = categoryExists.subCategoriesName.indexOf(subCategoriesName);
    if (subCategoryIndex === '-1') {
        return res.status(400).json({ message: 'Subcategory name does not match existing data' });
    }
    categoryExists.subCategoriesName.splice(subCategoryIndex, 1);
    const updatedCategory = await categoryExists.save();
    return res.status(200).json({message:`Deleted ${subCategoriesName} Successfully`, category: updatedCategory});
});

const getCategories = asyncWrapper(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { searchCategory, searchSubCategory } = req.query;

    let filter = {};

    if (searchCategory) {
        filter.categoryName = { $regex: searchCategory, $options: 'i' };
    }

    if (searchSubCategory) {
        filter.subCategoriesName = { $regex: searchSubCategory, $options: 'i' };
    }
    const categories = await Category.find(filter).skip(skip).limit(limit);
    const totalMatching = await Category.countDocuments(filter);
    if (categories.length === 0) {
        return res.status(200).json({
        message: 'No categories found',
        page,
        limit,
        matchingCount: 0,
        categories: [],
        });
    }
    return res.status(200).json({
        message: (searchCategory || searchSubCategory)
        ? 'Filtered categories fetched successfully'
        : 'Categories fetched successfully',
        page,
        limit,
        matchingCount: totalMatching,
        categories,
    });
});

export {
    createCategory,
    updateCategory,
    deleteCategory,
    createSubCategory,
    updateSubCategory,
    deleteSubCategory,
    getCategories,
};