import cloudinary from '../constants/cloudinary.constant.js';

const deleteFromCloudinary = async (publicId) => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.destroy(publicId, (error, result) => {
            if (error) {
                console.error("Cloudinary delete error:", error);
                reject(error);
            } else {
                resolve(result);
            }
        });
    });
};

export default deleteFromCloudinary;