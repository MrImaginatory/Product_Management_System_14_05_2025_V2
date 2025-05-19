import express, { urlencoded } from 'express';
import categoryRouter from './routes/category.route.js';
import ApiError from './utils/apiError.utils.js';
import errorHandler from './middlewares/errorHandler.middleware.js';
import productRouter from './routes/product.route.js';

const app = express();

app.use(express.json());
app.use(urlencoded({ extended: true }));

app.use('/api/v2',categoryRouter)
app.use('/api/v2',productRouter)

// utils/ApiError.js
app.use((req, res, next) => {
    next(new ApiError(404, 'Route not found'));
});
app.use(errorHandler);

export {app}
