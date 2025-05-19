import CategoryValidateSchema from "../validators/Category.validator.js";
import Category from "../models/category.model.js";
import asyncWrapper from "../utils/asyncWrapper.utils.js";
import uploadToCloudinary from "../utils/cloudinary.utils.js";
import saveImageLocally from "../utils/saveLocally.utils.js";
import cloudinary from "../constants/cloudinary.constant.js";
import ApiError from "../utils/apiError.utils.js";

const createCategory = asyncWrapper(async (req, res) => {
  await CategoryValidateSchema.validate(req.body);

  // Check if category already exists
  const categoryExists = await Category.findOne({
    categoryName: req.body.categoryName,
  });
  if (categoryExists) {
    throw new ApiError(400, "Category already exists");
  }

  if (!req.file) {
    throw new ApiError(400, "Category image is required");
  }

  if (req.file.size > 1024 * 500) {
    throw new ApiError(400, "Category image size should be less than 500KB");
  }

  let category;
  let cloudinaryResult;
  let imageUrl = "";
  let cloudinaryId = "";

  try {
    // Step 1: Save the category without image
    category = await Category.create({
      categoryName: req.body.categoryName,
      slug: req.body.slug,
      categoryDescription: req.body.categoryDescription,
      categoryImage: "", // temp
      cloudinaryId: "", // temp
    });

    // Step 2: Upload image to Cloudinary
    try {
      cloudinaryResult = await uploadToCloudinary(req.file);
      imageUrl = cloudinaryResult.secure_url;
      cloudinaryId = cloudinaryResult.public_id;
    } catch (cloudErr) {
      console.error("Cloudinary upload failed:", cloudErr.message);
      imageUrl = saveImageLocally(req.file); // fallback
    }

    // Step 3: Update the category with image info
    category.categoryImage = imageUrl;
    category.cloudinaryId = cloudinaryId;
    await category.save();

    return res.status(201).json({
      message: "Category created successfully",
      category,
    });
  } catch (err) {
    // Cleanup if error occurs after initial DB insert but before final update
    if (category && category._id) {
      await Category.findByIdAndDelete(category._id);
    }

    // Rollback Cloudinary image if already uploaded
    if (cloudinaryResult?.public_id) {
      try {
        await cloudinary.uploader.destroy(cloudinaryResult.public_id);
      } catch (destroyErr) {
        console.error(
          "Failed to rollback Cloudinary image:",
          destroyErr.message
        );
      }
    }

    throw new ApiError(500, "Failed to create category");
  }
});

const updateCategory = asyncWrapper(async (req, res) => {
  const categoryId = req.params.categoryId;
  const category = await Category.findById(categoryId);

  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  const updatedFields = { ...req.body };
  let newImageUrl = category.categoryImage;
  let newCloudinaryId = category.cloudinaryId;
  let newUploadResult = null;

  try {
    if (req.file) {
      // Step 1: Upload new image to Cloudinary
      try {
        newUploadResult = await uploadToCloudinary(req.file);
        newImageUrl = newUploadResult.secure_url;
        newCloudinaryId = newUploadResult.public_id;
      } catch (cloudErr) {
        console.error("Cloudinary upload failed:", cloudErr.message);
        newImageUrl = saveImageLocally(req.file); // fallback
        newCloudinaryId = ""; // skip cloudinary ID
      }
    }

    // Step 2: Update DB
    const updatedCategory = await Category.findByIdAndUpdate(
      categoryId,
      {
        ...updatedFields,
        categoryImage: newImageUrl,
        cloudinaryId: newCloudinaryId,
      },
      { new: true }
    );

    // Step 3: Delete old image from Cloudinary (only if new one succeeded)
    if (
      req.file &&
      category.cloudinaryId &&
      newUploadResult?.public_id &&
      category.cloudinaryId !== newCloudinaryId
    ) {
      try {
        await cloudinary.uploader.destroy(category.cloudinaryId);
      } catch (destroyErr) {
        console.error(
          "Failed to delete old Cloudinary image:",
          destroyErr.message
        );
      }
    }

    return res.status(200).json({
      message: `Updated ${updatedCategory.categoryName} successfully`,
      category: updatedCategory,
    });
  } catch (error) {
    // 🧹 Cleanup: If new Cloudinary image uploaded but DB update fails
    if (newUploadResult?.public_id) {
      try {
        await cloudinary.uploader.destroy(newUploadResult.public_id);
      } catch (cleanupErr) {
        console.error(
          "Rollback: Failed to delete new Cloudinary image:",
          cleanupErr.message
        );
      }
    }

    console.error("Update failed:", error.message);
    throw new ApiError(500, "Failed to update category");
  }
});

const deleteCategory = asyncWrapper(async (req, res) => {
  const categoryId = req.params.categoryId;

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

  const categoryExists = await Category.findById(categoryId);
  if (!categoryExists) {
    return res.status(404).json({ message: "Category not found" });
  }

  if (categoryExists.subCategoriesName.includes(req.body.subCategoriesName)) {
    return res.status(400).json({ message: "Subcategory already exists" });
  }
  const createdSubCategory = await Category.findByIdAndUpdate(
    categoryId,
    { $push: { subCategoriesName: req.body.subCategoriesName } },
    { new: true }
  );

  return res.status(200).json({
    message: `Updated ${createdSubCategory.categoryName} Successfully`,
    category: createdSubCategory,
  });
});

const updateSubCategory = asyncWrapper(async (req, res) => {
  const { categoryId } = req.params;
  const { oldSubCategoryName, newSubCategoryName } = req.body;

  console.log(req.body);

  const categoryExists = await Category.findById(categoryId);
  if (!categoryExists) {
    return res.status(404).json({ message: "Category not found" });
  }

  const subCategoryIndex =
    categoryExists.subCategoriesName.indexOf(oldSubCategoryName);
  console.log(subCategoryIndex);

  if (subCategoryIndex === "-1") {
    return res
      .status(400)
      .json({ message: "Subcategory name does not match existing data" });
  }

  categoryExists.subCategoriesName[subCategoryIndex] = newSubCategoryName;
  const updatedCategory = await categoryExists.save();

  return res.status(200).json({
    message: `Subcategory updated successfully`,
    category: updatedCategory,
  });
});

const deleteSubCategory = asyncWrapper(async (req, res) => {
  const categoryId = req.params.categoryId;
  const subCategoriesName = req.body.subCategoriesName;

  const categoryExists = await Category.findById(categoryId);
  if (!categoryExists) {
    return res.status(404).json({ message: "Category not found" });
  }
  const subCategoryIndex =
    categoryExists.subCategoriesName.indexOf(subCategoriesName);
  if (subCategoryIndex === "-1") {
    return res
      .status(400)
      .json({ message: "Subcategory name does not match existing data" });
  }
  categoryExists.subCategoriesName.splice(subCategoryIndex, 1);
  const updatedCategory = await categoryExists.save();
  return res.status(200).json({
    message: `Deleted ${subCategoriesName} Successfully`,
    category: updatedCategory,
  });
});

const getCategories = asyncWrapper(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const { searchCategory, searchSubCategory } = req.query;

  let filter = {};

  if (searchCategory) {
    filter.categoryName = { $regex: searchCategory, $options: "i" };
  }

  if (searchSubCategory) {
    filter.subCategoriesName = { $regex: searchSubCategory, $options: "i" };
  }
  const categories = await Category.find(filter).skip(skip).limit(limit);
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
    message:
      searchCategory || searchSubCategory
        ? "Filtered categories fetched successfully"
        : "Categories fetched successfully",
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
