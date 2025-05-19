import ApiError from "../utils/apiError.utils.js";

const errorHandler = (err, req, res, next) => {
    // console.error('[ErrorHandler]', err);

    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';

    // Handle Multer errors
    if (err.name === 'MulterError') {
        statusCode = 400;
        message = err.code === 'LIMIT_FILE_SIZE'
        ? 'File too large. Max allowed size is 500KB.'
        : 'File upload error';
    }

    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = err.message;
    }
    if (err.name === 'ValidationError') {
        statusCode = 400;
        const errors = Object.values(err.errors).map(e => e.message);
        message = errors.join(', ');
    }
    if (err.name === 'CastError') {
        statusCode = 400;
        message = `Invalid ${err.path}: ${err.value}`;
    } 
    if (err.code && err.code === 11000) {
        statusCode = 400;
        const field = Object.keys(err.keyValue)[0];
        message = `Duplicate value for field '${field}': ${err.keyValue[field]}`;
    }

    if (err instanceof ApiError) {
        statusCode = err.statusCode;
        message = err.message;
    }

    res.status(statusCode).json({
        success: false,
        statusCode,
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};

export default errorHandler;
