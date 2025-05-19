import Category from "../models/category.model.js";
import Product from "../models/product.model.js";
import asyncWrapper from "../utils/asyncWrapper.utils.js";
import saveImageLocally from "../utils/saveLocally.utils.js";
import uploadToCloudinary from "../utils/cloudinary.utils.js"; 
import deleteFromCloudinary from "../utils/deleteCloudinary.utils.js";
import productValidationSchema from "../validators/Product.validator.js";
import ApiError from "../utils/apiError.utils.js";

const createProduct = asyncWrapper(async (req, res) => {
    const cloudinaryPublicIds = [];

    try {
        if (
            !req.files ||
            !req.files.productDisplayImage ||
            !req.files.productImages ||
            req.files.productImages.length < 1
        ) {
            throw new ApiError(400, "Please provide product display image and product images.");
        }

        if (req.files.productImages.length > 50) {
            throw new ApiError(400, "Maximum 50 product images are allowed.");
        }

        await productValidationSchema.validate(req.body, { abortEarly: false });

        const categoryExists = await Category.findById(req.body.categoryName);
        if (!categoryExists) {
            throw new ApiError(400, "Category does not exist");
        }

        let pt;
        if (req.body.productType) {
            if (typeof req.body.productType === "string") {
                pt = req.body.productType.split(",").map((item) => item.trim());
            } else if (Array.isArray(req.body.productType)) {
                pt = req.body.productType.map((item) => item.trim());
            }
        }

        const uploadFilesWithFallback = async (files) => {
            const uploadedPaths = [];

            for (const file of files) {
                try {
                    const cloudinaryResult = await uploadToCloudinary(file);
                    uploadedPaths.push(cloudinaryResult.secure_url);
                    cloudinaryPublicIds.push(cloudinaryResult.public_id);
                } catch (err) {
                    const localPath = saveImageLocally(file);
                    uploadedPaths.push(localPath);
                }
            }
            return uploadedPaths;
        };

        let displayImagePath;
        try {
            const cloudinaryDisplay = await uploadToCloudinary(req.files.productDisplayImage[0]);
            displayImagePath = cloudinaryDisplay.secure_url;
            cloudinaryPublicIds.push(cloudinaryDisplay.public_id);
        } catch (error) {
            displayImagePath = saveImageLocally(req.files.productDisplayImage[0]);
        }

        const productImagesPaths = await uploadFilesWithFallback(req.files.productImages);

        const product = new Product({
            productName: req.body.productName,
            categoryName: req.body.categoryName,
            subCategoriesName: req.body.subCategoriesName || [],
            productDisplayImage: displayImagePath,
            productImages: productImagesPaths,
            availability: req.body.availability,
            productType: pt,
            stock: req.body.stock,
            weight: req.body.weight,
            productPrice: req.body.productPrice,
            productSalePrice: req.body.productSalePrice,
            productDescription: req.body.productDescription,
        });

        await product.save();

        return res.status(201).json({
            message: "Product created successfully",
            product,
        });

    } catch (error) {
        // 🧹 Clean up uploaded cloudinary images on error
        if (cloudinaryPublicIds.length > 0) {
            const cloudinary = await import("cloudinary");
            cloudinary.v2.api.delete_resources(cloudinaryPublicIds, (err, result) => {
                if (err) console.error("Failed to delete cloudinary images:", err);
            });
        }

        console.error("Error creating product:", error);
        throw new ApiError(500, "Internal Server Error");
    }
});

const updateProduct = asyncWrapper(async (req, res) => {
    const { productId } = req.params;
    const product = await Product.findById(productId);
    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    if (req.body.categoryName) {
        const categoryExists = await Category.findById(req.body.categoryName);
        if (!categoryExists) {
            throw new ApiError(400, "Category does not exist");
        }
    }

    let pt;
    if (req.body.productType) {
        if (typeof req.body.productType === "string") {
            pt = req.body.productType.split(",").map(item => item.trim());
        } else if (Array.isArray(req.body.productType)) {
            pt = req.body.productType.map(item => item.trim());
        } else {
            pt = [];
        }
    }

    const uploadFilesWithFallback = async (files) => {
        const uploadedPaths = [];
        for (const file of files) {
            try {
                const cloudinaryResult = await uploadToCloudinary(file);
                uploadedPaths.push(cloudinaryResult.secure_url);
            } catch (err) {
                const localPath = saveImageLocally(file);
                uploadedPaths.push(localPath);
            }
        }
        return uploadedPaths;
    };

    // Store old public_ids for deletion if needed
    let oldDisplayImagePublicId = null;
    let oldProductImagesPublicIds = [];

    // Extract public_id from existing product display image
    if (typeof product.productDisplayImage === 'string') {
        const match = product.productDisplayImage.match(/\/([^/]+)\.\w+$/);
        if (match) {
            oldDisplayImagePublicId = `your-folder/${match[1]}`; // Adjust folder if needed
        }
    }

    if (Array.isArray(product.productImages)) {
        oldProductImagesPublicIds = product.productImages.map((imgUrl) => {
            if (typeof imgUrl === 'string') {
                const match = imgUrl.match(/\/([^/]+)\.\w+$/);
                return match ? `your-folder/${match[1]}` : null;
            }
            return null;
        }).filter(Boolean);
    }

    let displayImagePath = product.productDisplayImage;
    let otherImagePaths = product.productImages;

    try {
        // Upload new display image if provided
        if (req.files?.productDisplayImage) {
            const cloudinaryDisplay = await uploadToCloudinary(req.files.productDisplayImage[0]);
            displayImagePath = cloudinaryDisplay.secure_url;
        }

        // Upload new product images if provided
        if (req.files?.productImages) {
            if (req.files.productImages.length < 1) {
                throw new ApiError(400, "At least one product image is required.");
            }
            if (req.files.productImages.length > 50) {
                throw new ApiError(400, "Maximum 50 product images are allowed.");
            }

            otherImagePaths = await uploadFilesWithFallback(req.files.productImages);
        }

        // Update product fields
        product.productName = req.body.productName || product.productName;
        product.categoryName = req.body.categoryName || product.categoryName;
        product.subCategoriesName = req.body.subCategoriesName || product.subCategoriesName;
        product.productDisplayImage = displayImagePath;
        product.productImages = otherImagePaths;
        product.availability = req.body.availability || product.availability;
        product.productType = pt || product.productType;
        product.stock = req.body.stock || product.stock;
        product.weight = req.body.weight || product.weight;
        product.productPrice = req.body.productPrice || product.productPrice;
        product.productSalePrice = req.body.productSalePrice || product.productSalePrice;
        product.productDescription = req.body.productDescription || product.productDescription;

        const updatedProduct = await product.save();

        // If update was successful, delete old images
        if (displayImagePath !== product.productDisplayImage && oldDisplayImagePublicId) {
            await deleteFromCloudinary(oldDisplayImagePublicId);
        }

        if (
            otherImagePaths !== product.productImages &&
            oldProductImagesPublicIds.length > 0
        ) {
            for (const publicId of oldProductImagesPublicIds) {
                await deleteFromCloudinary(publicId);
            }
        }

        return res.status(200).json({
            message: "Product updated successfully",
            product: updatedProduct,
        });

    } catch (error) {
        // Cleanup newly uploaded Cloudinary images if update fails
        if (displayImagePath && displayImagePath.includes('res.cloudinary.com')) {
            const match = displayImagePath.match(/\/([^/]+)\.\w+$/);
            if (match) {
                await deleteFromCloudinary(`your-folder/${match[1]}`);
            }
        }

        if (Array.isArray(otherImagePaths)) {
            for (const url of otherImagePaths) {
                if (typeof url === 'string' && url.includes('res.cloudinary.com')) {
                    const match = url.match(/\/([^/]+)\.\w+$/);
                    if (match) {
                        await deleteFromCloudinary(`your-folder/${match[1]}`);
                    }
                }
            }
        }

        console.error("Error updating product:", error);
        throw new ApiError(500, "Internal Server Error");
    }
});

const deleteProduct = asyncWrapper(async (req, res) => {
    const { productId } = req.params;
    const product = await Product.findById(productId);
    if (!product) {
        throw new ApiError(404, "Product not found");
    }
    const deleteProducts = await Product.findByIdAndDelete({ _id: productId });

    return res.status(200).json({
        message: "Product deleted successfully",
        product: deleteProducts,
    });
})

const getAllProducts = asyncWrapper(async (req, res) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const {searchProduct} = req.query;

    let filter ={};

    if(searchProduct){
        filter = {productName: { $regex: searchProduct, $options: 'i' } }
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

})

export { createProduct, updateProduct,deleteProduct,getAllProducts };