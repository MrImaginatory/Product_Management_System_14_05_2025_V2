import CategoryValidateSchema from "../validators/category.validator.js";
import Category from "../models/category.model.js"
import Product from "../models/product.model.js";
import asyncWrapper from "../utils/asyncWrapper.utils.js";
import { uploadImage, deleteImage, extractPublicIdFromUrl, saveImageLocally } from '../services/cloudinary.service.js';
import cloudinary from "../constants/cloudinary.constant.js";
import ApiError from "../utils/apiError.utils.js";
import generateSlug from "../utils/slug.utils.js";

const createCategory = asyncWrapper(async (req, res) => {
  await CategoryValidateSchema.validate(req.body);

  const categoryExists = await Category.findOne({ categoryName: req.body.categoryName });
  if (categoryExists) {
    throw new ApiError(400, "Category already exists");
  }

  if (!req.file) {
    throw new ApiError(400, "Category image is required");
  }

  if (req.file.size > 1024 * 500) {
    throw new ApiError(400, "Category image size should be less than 500KB");
  }

  let slug = generateSlug(req.body.slug || req.body.categoryName || category.slug);
  let category;
  let cloudinaryResult;
  let imageUrl = "";
  let cloudinaryId = "";

  try {
    // Step 1: Save category first without image
    category = await Category.create({
      categoryName: req.body.categoryName,
      slug: slug,
      categoryDescription: req.body.categoryDescription,
      categoryImage: "",
      cloudinaryId: "",
    });

    // Step 2: Upload image to Cloudinary
    try {
      cloudinaryResult = await uploadImage(req.file, "category_images");
      imageUrl = cloudinaryResult.secure_url;
      cloudinaryId = cloudinaryResult.public_id;
    } catch (err) {
      console.error("Cloudinary upload failed:", err.message);
      imageUrl = saveImageLocally(req.file);
    }

    // Step 3: Update category with image info
    category.categoryImage = imageUrl;
    category.cloudinaryId = cloudinaryId;
    await category.save();

    return res.status(201).json({
      message: "Category created successfully",
      category,
    });
  } catch (err) {
    if (category?._id) {
      await Category.findByIdAndDelete(category._id);
    }

    if (cloudinaryResult?.public_id) {
      await deleteImage(cloudinaryResult.public_id);
    }

    console.error("Create Category Error:", err.message);
    throw new ApiError(500, "Failed to create category");
  }
});

const updateCategory = asyncWrapper(async (req, res) => {
  const categoryId = req.params.categoryId;
  const category = await Category.findById(categoryId);

  if (!category) {
    throw new ApiError(404, "Category not found");
  }
  let slug =  generateSlug(req.body.slug || req.body.categoryName || category.slug);
  let newImageUrl = category.categoryImage;
  let newCloudinaryId = category.cloudinaryId;
  let newUploadResult = null;

  try {
    if (req.file) {
      try {
        newUploadResult = await uploadImage(req.file, "category_images");
        newImageUrl = newUploadResult.secure_url;
        newCloudinaryId = newUploadResult.public_id;
      } catch (err) {
        console.error("Cloudinary upload failed:", err.message);
        newImageUrl = saveImageLocally(req.file);
        newCloudinaryId = "";
      }
    }

    

    // Step 2: Update DB
    const updatedCategory = await Category.findByIdAndUpdate(
      categoryId,
      {
        categoryName: req.body.categoryName|| category.categoryName,
        categoryDescription: req.body.categoryDescription || category.categoryDescription,
        slug: slug || category.slug,
        categoryImage: newImageUrl || category.categoryImage,
        cloudinaryId: newCloudinaryId || category.cloudinaryId,
      },
      { new: true }
    );

    // Step 3: Delete old Cloudinary image
    if (
      req.file &&
      category.cloudinaryId &&
      newUploadResult?.public_id &&
      category.cloudinaryId !== newCloudinaryId
    ) {
      await deleteImage(category.cloudinaryId);
    }

    return res.status(200).json({
      message: `Updated ${updatedCategory.categoryName} successfully`,
      category: updatedCategory,
    });
  } catch (err) {
    if (newUploadResult?.public_id) {
      await deleteImage(newUploadResult.public_id);
    }

    console.error("Update Category Error:", err.message);
    throw new ApiError(500, "Failed to update category");
  }
});

const deleteCategory = asyncWrapper(async (req, res) => {
  const categoryId = req.params.categoryId;
  const productExists = await Product.find({ categoryName: categoryId });
  if (productExists.length > 0) {
    const productNames = productExists.map(p => p.productName).join(", ");
    throw new ApiError(
      400,
      `Category has products associated with: ${productNames}. Delete them first.`
    );
  }

  const category = await Category.findById(categoryId);
  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  // Backup Cloudinary ID before deletion
  const cloudinaryId = category.cloudinaryId;
  const categoryName = category.categoryName;

  // Step 1: Delete the category from DB
  await Category.findByIdAndDelete(categoryId);

  // Step 2: Try to delete the Cloudinary image (non-blocking)
  if (cloudinaryId) {
    try {
      await cloudinary.uploader.destroy(cloudinaryId);
    } catch (err) {
      console.error(
        `Failed to delete Cloudinary image for category ${categoryName}:`,
        err.message
      );
    }
  }

  return res.status(200).json({
    message: `Deleted ${categoryName} successfully`,
    category,
  });
});

const createSubCategory = asyncWrapper(async (req, res) => {
  const categoryId = req.params.categoryId;

  const category = await Category.findById(categoryId);
  if (!category) {
    return res.status(404).json({ message: "Category not found" });
  }

  // Normalize input into an array
  const subCategoriesArray = Array.isArray(req.body.subCategoriesName)
    ? req.body.subCategoriesName
    : [req.body.subCategoriesName];

  // Sanitize the input
  const sanitizedSubCategories = subCategoriesArray.map((name) => name.trim());

  // Check for duplicates
  const existingSubcategories = category.subCategoriesName.map((name) =>
    name.toLowerCase()
  );

  const duplicates = sanitizedSubCategories.filter((name) =>
    existingSubcategories.includes(name.toLowerCase())
  );

  if (duplicates.length > 0) {
    return res.status(400).json({
      message: `Subcategory '${duplicates.join(", ")}' already exists`,
    });
  }

  // Add new subcategories
  const updatedCategory = await Category.findByIdAndUpdate(
    categoryId,
    { $push: { subCategoriesName: { $each: sanitizedSubCategories } } },
    { new: true }
  );

  return res.status(200).json({
    message: `Updated ${updatedCategory.categoryName} successfully`,
    category: updatedCategory,
  });
});


const updateSubCategory = asyncWrapper(async (req, res) => {
  const { categoryId } = req.params;
  const { oldSubCategoryName, newSubCategoryName } = req.body;

  const categoryExists = await Category.findById(categoryId);
  if (!categoryExists) {
    return res.status(404).json({ message: "Category not found" });
  }

  const sanitizedNewSubCategoryName = newSubCategoryName.trim();

  const subCategoryIndex = categoryExists.subCategoriesName.indexOf(oldSubCategoryName);
  if (subCategoryIndex === "-1") {
    return res
      .status(400)
      .json({ message: "Subcategory name does not match existing data" });
  }

  categoryExists.subCategoriesName[subCategoryIndex] = sanitizedNewSubCategoryName;
  const updatedCategory = await categoryExists.save();

  return res.status(200).json({
    message: `Subcategory updated successfully`,
    category: updatedCategory,
  });
});

const deleteSubCategory = asyncWrapper(async (req, res) => {
  const categoryId = req.params.categoryId;

  // Normalize the input into an array
  const subCategoriesToDelete = Array.isArray(req.body.subCategoriesName)
    ? req.body.subCategoriesName
    : [req.body.subCategoriesName];

  const category = await Category.findById(categoryId);
  if (!category) {
    return res.status(404).json({ message: "Category not found" });
  }

  // Sanitize input and convert to lowercase for case-insensitive match
  const sanitizedToDelete = subCategoriesToDelete.map((name) =>
    name.trim().toLowerCase()
  );

  const originalSubCategories = category.subCategoriesName;

  // Filter out the subcategories that should be kept
  const filteredSubCategories = originalSubCategories.filter(
    (existing) => !sanitizedToDelete.includes(existing.trim().toLowerCase())
  );

  if (filteredSubCategories.length === originalSubCategories.length) {
    return res.status(400).json({
      message: "No matching subcategories found to delete",
    });
  }

  // Update the category
  category.subCategoriesName = filteredSubCategories;
  const updatedCategory = await category.save();

  return res.status(200).json({
    message: `Deleted ${sanitizedToDelete.join(", ")} successfully`,
    category: updatedCategory,
  });
});


const getCategories = asyncWrapper(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const { search } = req.query;

  let filter = {};

  if (search) {
    filter = {
      $or: [
        { categoryName: { $regex: search, $options: "i" } },
        { subCategoriesName: { $regex: search, $options: "i" } }
      ]
    }
  }

  const categories = await Category.find(filter)
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });
  const totalMatching = await Category.countDocuments(filter);
  if (categories.length === 0) {
    return res.status(200).json({
      message: "No categories found",
      page,
      limit,
      matchingCount: 0,
      categories: [],
    });
  }
  return res.status(200).json({
    message: "Categories fetched successfully",
    page,
    limit,
    matchingCount: totalMatching,
    categories,
  });
});

const getSubCategories = asyncWrapper(async (req, res) => {
  const categories = await Category.find();
  if (categories.length === 0) {
    return res.status(200).json({
      message: "No categories found",
      page,
      limit,
      matchingCount: 0,
      categories: [],
    });
  }
  return res.status(200).json({
    message: "Categories fetched successfully",
    categories,
  });
})

const getCategory = asyncWrapper(async (req, res) => {
  const { categoryId } = req.params;
  const category = await Category.findById(categoryId);
  if (!category) {
    throw new ApiError(404, "Category not found");
  }
  return res.status(200).json({ message: "Category fetched successfully", category });
})

export {
  createCategory,
  updateCategory,
  deleteCategory,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
  getCategories,
  getCategory,
  getSubCategories
};
