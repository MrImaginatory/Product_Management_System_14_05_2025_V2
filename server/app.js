import express, { urlencoded } from 'express';
import cors from 'cors';
import categoryRouter from './routes/category.route.js';
import ApiError from './utils/apiError.utils.js';
import errorHandler from './middlewares/errorHandler.middleware.js';
import productRouter from './routes/product.route.js';
import authRouter from './routes/auth.route.js';
import userRouter from './routes/user.route.js';
import dotenv from 'dotenv/config';

const allowedOrigins = [
    "http://localhost:5173",
    "https://68359871ec9f7c0008817175--luxury-squirrel-4a086a.netlify.app"
];

const app = express();

app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error("Not allowed by CORS"));
            }
        },
        credentials: true, // If you're using cookies or Authorization headers
    })
);

console.log(process.env);


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
