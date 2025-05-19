import { Router } from 'express';
import {createCategory,
        createSubCategory,
        deleteCategory,
        updateCategory, 
        updateSubCategory,
        deleteSubCategory,
        getCategories} from '../controllers/category.controller.js'
import { uploadCategoryImage } from '../middlewares/multer.middleware.js';
const categoryRouter = Router();

categoryRouter.route('/category').get(getCategories);
categoryRouter.route('/createCategory').post(uploadCategoryImage,createCategory);
categoryRouter.route('/updateCategory/:categoryId').patch(uploadCategoryImage,updateCategory);
categoryRouter.route('/deleteCategory/:categoryId').delete(deleteCategory);
categoryRouter.route('/createSubCategory/:categoryId').patch(createSubCategory);
categoryRouter.route('/updateSubCategory/:categoryId').patch(updateSubCategory);
categoryRouter.route('/deleteSubCategory/:categoryId').delete(deleteSubCategory);

export default categoryRouter;