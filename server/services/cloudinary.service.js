// services/cloudinary.service.js
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv/config';
import path from 'path';
import fs from 'fs';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadImage = async (file, folder = 'product_images') => {
  try {
    const base64 = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
    const result = await cloudinary.uploader.upload(base64, {
      folder,
      resource_type: 'image',
    });
    return {
      secure_url: result.secure_url,
      public_id: result.public_id,
    };
  } catch (err) {
    throw new Error(`Cloudinary upload failed: ${err.message}`);
  }
};

const deleteImage = async (publicId) => {
  try {
    if (!publicId) return;
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error(`Failed to delete Cloudinary image: ${publicId}`, err.message);
  }
};

const deleteMultipleImages = async (publicIds = []) => {
  try {
    if (!publicIds.length) return;
    await cloudinary.api.delete_resources(publicIds);
  } catch (err) {
    console.error('Failed to delete multiple Cloudinary images:', err.message);
  }
};

const extractPublicIdFromUrl = (url, folder = 'product_images') => {
  const match = url.match(/\/([^/]+)\.\w+$/);
  return match ? `${folder}/${match[1]}` : null;
};

const saveImageLocally = (file) => {
  try {
    const uploadsDir = path.join('uploads');
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

    const uniqueFilename = `${Date.now()}_${file.originalname}`;
    const localPath = path.join(uploadsDir, uniqueFilename);

    fs.writeFileSync(localPath, file.buffer);
    return `/uploads/${uniqueFilename}`;
  } catch (err) {
    throw new Error('Failed to save image locally');
  }
};

export {
  uploadImage,
  deleteImage,
  deleteMultipleImages,
  extractPublicIdFromUrl,
  saveImageLocally,
};
