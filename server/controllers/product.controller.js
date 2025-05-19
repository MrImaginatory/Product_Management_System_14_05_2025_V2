import Category from "../models/category.model.js";
import Product from "../models/product.model.js";
import asyncWrapper from "../utils/asyncWrapper.utils.js";
import saveImageLocally from "../utils/saveLocally.utils.js";
import uploadToCloudinary from "../utils/cloudinary.utils.js";
import cloudinary from "../constants/cloudinary.constant.js";
import productValidationSchema from "../validators/Product.validator.js";
import ApiError from "../utils/apiError.utils.js";
import extractCloudinaryPublicId from "../utils/extractCloudinaryPublic.util.js";

const createProduct = asyncWrapper(async (req, res) => {
    await productValidationSchema.validate(req.body, { abortEarly: false });

    const cloudinaryPublicIds = [];
    let product;

    try {
        if (
            !req.files ||
            !req.files.productDisplayImage ||
            !req.files.productImages ||
            req.files.productImages.length < 1
        ) {
            throw new ApiError(
                400,
                "Please provide product display image and at least one product image."
            );
        }

        if (req.files.productImages.length > 50) {
            throw new ApiError(400, "Maximum 50 product images are allowed.");
        }

        const categoryExists = await Category.findById(req.body.categoryName);
        if (!categoryExists) {
            throw new ApiError(400, "Category does not exist.");
        }

        const pt =
            typeof req.body.productType === "string"
                ? req.body.productType.split(",").map((t) => t.trim())
                : req.body.productType;

        // Step 1: Save product without images
        product = await Product.create({
            productName: req.body.productName,
            categoryName: req.body.categoryName,
            subCategoryName: req.body.categoryName,
            productDescription: req.body.productDescription,
            productDisplayImage: "",
            productImages: [],
            productPrice: req.body.productPrice,
            productSalePrice: req.body.productSalePrice,
            stock: req.body.stock,
            weight: req.body.weight,
            availability: req.body.availability,
            productType: pt,
        });

        // Step 2: Upload display image
        let displayImageUrl = "";
        try {
            const displayResult = await uploadToCloudinary(
                req.files.productDisplayImage[0]
            );
            displayImageUrl = displayResult.secure_url;
            cloudinaryPublicIds.push(displayResult.public_id);
        } catch (err) {
            displayImageUrl = saveImageLocally(req.files.productDisplayImage[0]);
        }

        // Step 3: Upload product images
        const productImageUrls = [];
        for (const file of req.files.productImages) {
            try {
                const result = await uploadToCloudinary(file);
                productImageUrls.push(result.secure_url);
                cloudinaryPublicIds.push(result.public_id);
            } catch (err) {
                productImageUrls.push(saveImageLocally(file));
            }
        }

        // Step 4: Update product with image URLs
        product.productDisplayImage = displayImageUrl;
        product.productImages = productImageUrls;
        await product.save();

        return res.status(201).json({
            message: "Product created successfully",
            product,
        });
    } catch (error) {
        // Rollback if something fails after DB insert
        if (product?._id) {
            await Product.findByIdAndDelete(product._id);
        }

        // Delete any uploaded Cloudinary images
        if (cloudinaryPublicIds.length) {
            try {
                await cloudinary.api.delete_resources(cloudinaryPublicIds);
            } catch (err) {
                console.error(
                    "Rollback: Failed to delete Cloudinary images:",
                    err.message
                );
            }
        }

        console.error("Create product failed:", error.message);
        throw new ApiError(500, "Failed to create product");
    }
});

const updateProduct = asyncWrapper(async (req, res) => {
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    const cloudinaryPublicIdsToDelete = [];
    const newCloudinaryPublicIds = [];

    try {
        if (req.body.categoryName) {
            const categoryExists = await Category.findById(req.body.categoryName);
            if (!categoryExists) {
                throw new ApiError(400, "Category does not exist");
            }
        }

        const pt =
            typeof req.body.productType === "string"
                ? req.body.productType.split(",").map((t) => t.trim())
                : req.body.productType;

        let newDisplayImage = product.productDisplayImage;
        let newProductImages = product.productImages;

        // STEP 1: Upload display image if provided
        if (req.files?.productDisplayImage) {
            try {
                const displayUpload = await uploadToCloudinary(
                    req.files.productDisplayImage[0]
                );
                newDisplayImage = displayUpload.secure_url;
                newCloudinaryPublicIds.push(displayUpload.public_id);

                // mark old display image for deletion
                if (product.productDisplayImage.includes("res.cloudinary.com")) {
                    const match = product.productDisplayImage.match(/\/([^/]+)\.\w+$/);
                    if (match)
                        cloudinaryPublicIdsToDelete.push(`product_images/${match[1]}`);
                }
            } catch (err) {
                newDisplayImage = saveImageLocally(req.files.productDisplayImage[0]);
            }
        }

        // STEP 2: Upload product images if provided
        if (req.files?.productImages) {
            if (req.files.productImages.length > 50) {
                throw new ApiError(400, "Maximum 50 product images are allowed");
            }

            const uploadedImageUrls = [];
            for (const file of req.files.productImages) {
                try {
                    const result = await uploadToCloudinary(file);
                    uploadedImageUrls.push(result.secure_url);
                    newCloudinaryPublicIds.push(result.public_id);
                } catch (err) {
                    uploadedImageUrls.push(saveImageLocally(file));
                }
            }

            newProductImages = uploadedImageUrls;

            // mark old product images for deletion
            for (const url of product.productImages) {
                if (url.includes("res.cloudinary.com")) {
                    const match = url.match(/\/([^/]+)\.\w+$/);
                    if (match)
                        cloudinaryPublicIdsToDelete.push(`product_images/${match[1]}`);
                }
            }
        }

        // STEP 3: Update product in DB
        product.productName = req.body.productName || product.productName;
        product.categoryName = req.body.categoryName || product.categoryName;
        product.subCategoryName = req.body.categoryName || product.categoryName;
        product.productDescription =
            req.body.productDescription || product.productDescription;
        product.productDisplayImage = newDisplayImage;
        product.productImages = newProductImages;
        product.productPrice = req.body.productPrice || product.productPrice;
        product.productSalePrice =
            req.body.productSalePrice || product.productSalePrice;
        product.stock = req.body.stock || product.stock;
        product.weight = req.body.weight || product.weight;
        product.availability = req.body.availability || product.availability;
        product.productType = pt || product.productType;

        const updatedProduct = await product.save();

        // STEP 4: Delete old cloudinary images
        if (cloudinaryPublicIdsToDelete.length) {
            await cloudinary.api.delete_resources(cloudinaryPublicIdsToDelete);
        }

        return res.status(200).json({
            message: "Product updated successfully",
            product: updatedProduct,
        });
    } catch (err) {
        // Rollback any newly uploaded Cloudinary images
        if (newCloudinaryPublicIds.length) {
            try {
                await cloudinary.api.delete_resources(newCloudinaryPublicIds);
            } catch (cleanupErr) {
                console.error(
                    "Rollback: Failed to delete new Cloudinary images:",
                    cleanupErr.message
                );
            }
        }

        console.error("Product update failed:", err.message);
        throw new ApiError(500, "Failed to update product");
    }
});

const deleteProduct = asyncWrapper(async (req, res) => {
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    const displayImagePublicId = product.productDisplayImage.includes(
        "res.cloudinary.com"
    )
        ? extractCloudinaryPublicId(product.productDisplayImage)
        : null;

    const productImagesPublicIds = product.productImages
        .filter((url) => url.includes("res.cloudinary.com"))
        .map((url) => extractCloudinaryPublicId(url));

    // Step 1: Delete product from DB
    await Product.findByIdAndDelete(productId);

    // Step 2: Delete images from Cloudinary (non-blocking)
    const allPublicIds = [displayImagePublicId, ...productImagesPublicIds].filter(
        Boolean
    );
    if (allPublicIds.length > 0) {
        try {
            await cloudinary.api.delete_resources(allPublicIds);
        } catch (err) {
            console.error("Failed to delete Cloudinary images:", err.message);
        }
    }

    return res.status(200).json({
        message: "Product deleted successfully",
        product,
    });
});

const getAllProducts = asyncWrapper(async (req, res) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const { searchProduct } = req.query;

    let filter = {};

    if (searchProduct) {
        filter = { productName: { $regex: searchProduct, $options: "i" } };
    }

    const products = await Product.find(filter)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

    return res.status(200).json({
        message: "Products fetched successfully",
        totalProducts: await Product.countDocuments(),
        page,
        limit,
        products,
    });
});

export { createProduct, updateProduct, deleteProduct, getAllProducts };
