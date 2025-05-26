import multer from 'multer';
import path from 'path';
import fs from 'fs';

if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

const storage = multer.memoryStorage(); // Buffer used for Cloudinary

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.test(ext)) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 1 * 1024 * 1024 },
});

export const uploadCategoryImage = upload.single('categoryImage');

export const uploadProfileImage = upload.single('profileImage');

export const uploadProductImages = upload.fields([
    { name: 'productDisplayImage', maxCount: 1 },
    { name: 'productImages', maxCount: 50 }
]);