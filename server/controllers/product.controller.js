import Product from "../models/product.model.js";
import Category from "../models/category.model.js";
import asyncWrapper from "../utils/asyncWrapper.utils.js";
import ApiError from "../utils/apiError.utils.js";
import productValidationSchema from "../validators/product.validator.js";
import {
    uploadImage,
    deleteMultipleImages,
    saveImageLocally,
    extractPublicIdFromUrl
} from "../services/cloudinary.service.js";

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

        const subCategoriesArray = Array.isArray(req.body.subCategoryName)
        ? req.body.subCategoryName
        : [req.body.subCategoryName];

        const sanitizedSubCategories = subCategoriesArray.map((name) =>
            name.trim().replace(/\s+/g, "_")
        );

        if(categoryExists.subCategoriesName.includes(sanitizedSubCategories) === '-1') {
            throw new ApiError(400, "Subcategory does not exist.");
        }


        const pt =
            typeof req.body.productType === "string"
                ? req.body.productType.split(",").map((t) => t.trim())
                : req.body.productType;

        // Step 1: Save product initially
        product = await Product.create({
            productName: req.body.productName,
            categoryName: req.body.categoryName,
            subCategoryName:sanitizedSubCategories,
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
            const result = await uploadImage(
                req.files.productDisplayImage[0],
                "product_images"
            );
            displayImageUrl = result.secure_url;
            cloudinaryPublicIds.push(result.public_id);
        } catch (err) {
            displayImageUrl = saveImageLocally(req.files.productDisplayImage[0]);
        }

        // Step 3: Upload other product images
        const productImageUrls = [];
        for (const file of req.files.productImages) {
            try {
                const result = await uploadImage(file, "product_images");
                productImageUrls.push(result.secure_url);
                cloudinaryPublicIds.push(result.public_id);
            } catch (err) {
                productImageUrls.push(saveImageLocally(file));
            }
        }

        // Step 4: Final update
        product.productDisplayImage = displayImageUrl;
        product.productImages = productImageUrls;
        await product.save();

        return res.status(201).json({
            message: "Product created successfully",
            product,
        });
    } catch (err) {
        if (product?._id) {
            await Product.findByIdAndDelete(product._id);
        }

        if (cloudinaryPublicIds.length) {
            await deleteMultipleImages(cloudinaryPublicIds);
        }

        console.error("Create Product Error:", err.message);
        throw new ApiError(500, "Failed to create product");
    }
});

const updateProduct = asyncWrapper(async (req, res) => {
    const { productId } = req.params;
    const product = await Product.findById(productId);
    if (!product) throw new ApiError(404, "Product not found");

    if (req.body.categoryName) {
        const categoryExists = await Category.findById(req.body.categoryName);
        if (!categoryExists) throw new ApiError(400, "Category does not exist");
    }

    let subCategoriesArray;
    let sanitizedSubCategories;
    if(req.body.subCategoryName){    
        subCategoriesArray = Array.isArray(req.body.subCategoryName)
        ? req.body.subCategoryName
        : [req.body.subCategoryName];
    
        sanitizedSubCategories = subCategoriesArray.map((name) =>
            name.trim().replace(/\s+/g, "_")
        );
    }


    const pt =
        typeof req.body.productType === "string"
            ? req.body.productType.split(",").map((t) => t.trim())
            : req.body.productType;

    const oldPublicIds = [];

    // Capture old image IDs for deletion
    if (product.productDisplayImage.includes("res.cloudinary.com")) {
        oldPublicIds.push(extractPublicIdFromUrl(product.productDisplayImage));
    }
    for (const url of product.productImages) {
        if (url.includes("res.cloudinary.com")) {
            oldPublicIds.push(extractPublicIdFromUrl(url));
        }
    }

    const newPublicIds = [];
    let newDisplayImage = product.productDisplayImage;
    let newProductImages = product.productImages;

    try {
        // Upload new display image
        if (req.files?.productDisplayImage) {
            try {
                const result = await uploadImage(
                    req.files.productDisplayImage[0],
                    "product_images"
                );
                newDisplayImage = result.secure_url;
                newPublicIds.push(result.public_id);
            } catch (err) {
                newDisplayImage = saveImageLocally(req.files.productDisplayImage[0]);
            }
        }

        // Upload new product images
        if (req.files?.productImages) {
            if (req.files.productImages.length > 50) {
                throw new ApiError(400, "Maximum 50 product images are allowed.");
            }

            const uploadedUrls = [];
            for (const file of req.files.productImages) {
                try {
                    const result = await uploadImage(file, "product_images");
                    uploadedUrls.push(result.secure_url);
                    newPublicIds.push(result.public_id);
                } catch (err) {
                    uploadedUrls.push(saveImageLocally(file));
                }
            }

            newProductImages = uploadedUrls;
        }

        // Update product fields
        product.productName = req.body.productName || product.productName;
        product.categoryName = req.body.categoryName || product.categoryName;
        product.subCategoryName = sanitizedSubCategories || product.subCategoryName;
        product.productDescription = req.body.productDescription || product.productDescription;
        product.productDisplayImage = newDisplayImage || product.productDisplayImage;
        product.productImages = newProductImages || product.productImages;
        product.productPrice = req.body.productPrice || product.productPrice;
        product.productSalePrice =
            req.body.productSalePrice || product.productSalePrice;
        product.stock = req.body.stock || product.stock;
        product.weight = req.body.weight || product.weight;
        product.availability = req.body.availability || product.availability;
        product.productType = pt || product.productType;

        const updatedProduct = await product.save();

        // Delete old images if replaced
        if (
            (req.files?.productDisplayImage || req.files?.productImages) &&
            oldPublicIds.length > 0
        ) {
            await deleteMultipleImages(oldPublicIds);
        }

        return res.status(200).json({
            message: "Product updated successfully",
            product: updatedProduct,
        });
    } catch (err) {
        if (newPublicIds.length > 0) {
            await deleteMultipleImages(newPublicIds);
        }

        console.error("Update Product Error:", err.message);
        throw new ApiError(500, "Failed to update product");
    }
});

const deleteProduct = asyncWrapper(async (req, res) => {
    const { productId } = req.params;
    const product = await Product.findById(productId);
    if (!product) throw new ApiError(404, "Product not found");

    // Collect all Cloudinary public IDs
    const publicIds = [];
    if (product.productDisplayImage.includes("res.cloudinary.com")) {
        publicIds.push(extractPublicIdFromUrl(product.productDisplayImage));
    }
    for (const img of product.productImages) {
        if (img.includes("res.cloudinary.com")) {
            publicIds.push(extractPublicIdFromUrl(img));
        }
    }

    await Product.findByIdAndDelete(productId);

    if (publicIds.length > 0) {
        await deleteMultipleImages(publicIds);
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

    const matchingCategories = await Category.find({
    categoryName: { $regex: searchProduct, $options: "i" }
    }).select("_id");

    const matchingCategoryIds = matchingCategories.map(cat => cat._id);

    if (searchProduct) {
        filter = { $or: [
                { productName: { $regex: searchProduct, $options: "i" } },
                { categoryName: { $in: matchingCategoryIds } },
            ]
        }
    }

    const products = await Product.find(filter)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .populate("categoryName", "categoryName"); 

        if(products.length === 0){
            throw new ApiError(404, "No products found");
        }

    return res.status(200).json({
        message: "Products fetched successfully",
        totalProducts: await Product.countDocuments(),
        page,
        limit,
        products,
    });
});

const getProducts = asyncWrapper(async (req,res)=>{
    const products = await Product.find()
                                .sort({ createdAt: -1 })
                                .populate("categoryName", "categoryName");
    if(products.length === 0){
        throw new ApiError(404, "No products found");
    }

                                return res.status(200).json({
        message: "Products fetched successfully",
        totalProducts: await Product.countDocuments(),
        page,
        limit,
        products,
    });
})

const getProduct = asyncWrapper(async (req, res) => {
    const { productId } = req.params;

    const product = await Product.findById({_id:productId}).populate("categoryName", "categoryName"); ;
    
    if (!product) throw new ApiError(404, "Product not found");

    return res.status(200).json({
        message: "Product fetched successfully",
        product,
    });
})

export { createProduct, updateProduct, deleteProduct, getAllProducts, getProduct, getProducts };
