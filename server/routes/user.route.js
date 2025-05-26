import { Router } from "express";
import {updateUser ,deleteUser} from "../controllers/user.controller.js";
import  {uploadProfileImage}  from "../middlewares/multer.middleware.js";
import checkToken from "../middlewares/token.middleware.js";

const userRouter = Router();

userRouter.use(checkToken);
userRouter.route('/update').put(uploadProfileImage, updateUser);
userRouter.route('/deleteUser').delete(deleteUser);

export default userRouter;