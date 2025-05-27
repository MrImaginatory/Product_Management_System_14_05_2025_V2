import express, { urlencoded } from 'express';
import cors from 'cors';
import categoryRouter from './routes/category.route.js';
import ApiError from './utils/apiError.utils.js';
import errorHandler from './middlewares/errorHandler.middleware.js';
import productRouter from './routes/product.route.js';
import authRouter from './routes/auth.route.js';
import userRouter from './routes/user.route.js';
import dotenv from 'dotenv/config';

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN || 'https://product-management-system-14-05-2025-v2-1.onrender.com',
    credentials: true,
}));

app.use(express.json());
app.use(urlencoded({ extended: true }));

app.use('/api/v2/category', categoryRouter)
app.use('/api/v2/product', productRouter)
app.use('/api/v2/auth', authRouter)
app.use('/api/v2/user', userRouter)

// utils/ApiError.js
app.use((req, res, next) => {
    next(new ApiError(404, 'Route not found'));
});
app.use(errorHandler);

export { app }
