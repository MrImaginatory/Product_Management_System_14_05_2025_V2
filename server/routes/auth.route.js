import { Router } from 'express';
import { login, register, logout, verifyUser } from '../controllers/auth.controller.js';
import checkToken from '../middlewares/token.middleware.js';

const authRouter = Router();

// authRouter.use(checkToken);

authRouter.route('/login').post(login);
authRouter.route('/register').post(register);
authRouter.route('/logout').post(logout);
authRouter.route('/verify').get(verifyUser);

export default authRouter;