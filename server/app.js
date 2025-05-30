import express, { urlencoded } from 'express';
import cors from 'cors';
import categoryRouter from './routes/category.route.js';
import ApiError from './utils/apiError.utils.js';
import errorHandler from './middlewares/errorHandler.middleware.js';
import productRouter from './routes/product.route.js';
import authRouter from './routes/auth.route.js';
import userRouter from './routes/user.route.js';
import dotenv from 'dotenv/config';

import path from 'path';
import { fileURLToPath } from 'url';

const app = express();

const allowedOrigins = [
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:5173',
    'http://46.250.237.182:8080'
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
}));

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(urlencoded({ extended: true }));

app.use('/api/v2/category', categoryRouter)
app.use('/api/v2/product', productRouter)
app.use('/api/v2/auth', authRouter)
app.use('/api/v2/user', userRouter)

// const buildPath = path.join(__dirname, '../client/dist');

// app.use('/', express.static(path.join(__dirname, '../client/dist')));

// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
// });

// app.get('/',(req,res)=>{
//     res.redirect('/project');
// })
app.use((req, res, next) => {
    next(new ApiError(404, 'Route not found'));
});

app.use(errorHandler);

export { app }