import cloudinary from '../constants/cloudinary.constant.js';
// Upload images to Cloudinary
const uploadToCloudinary = async (file) => {
    try {
        const result = await cloudinary.uploader.upload(
            `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
            {
                folder: 'product_images',
                resource_type: 'image',
            }
        );
        // console.log(result);
        return result;  
        
    } catch (err) {
        throw new Error('Cloudinary upload failed');
    }
};


export default uploadToCloudinary;