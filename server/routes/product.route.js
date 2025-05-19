import { Router } from "express";
import { createProduct,updateProduct,deleteProduct, getAllProducts } from "../controllers/product.controller.js";
import { uploadProductImages } from "../middlewares/multer.middleware.js";

const productRouter = Router();

productRouter.route('/createProduct').post(uploadProductImages,createProduct);
productRouter.route('/updateProduct/:productId').patch(uploadProductImages,updateProduct);
productRouter.route('/deleteProduct/:productId').delete(deleteProduct);
productRouter.route('/getProducts').get(getAllProducts);

export default productRouter;