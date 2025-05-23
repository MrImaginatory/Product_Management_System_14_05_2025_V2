import { Router } from "express";
import { createProduct,updateProduct,deleteProduct, getAllProducts,getProduct, getProducts } from "../controllers/product.controller.js";
import { uploadProductImages } from "../middlewares/multer.middleware.js";

const productRouter = Router();

productRouter.route('/createProduct').post(uploadProductImages,createProduct);
productRouter.route('/updateProduct/:productId').patch(uploadProductImages,updateProduct);
productRouter.route('/deleteProduct/:productId').delete(deleteProduct);
productRouter.route('/getProducts').get(getAllProducts);
productRouter.route('/getAllProducts').get(getProducts);
productRouter.route('/getProduct/:productId').get(getProduct);

export default productRouter;