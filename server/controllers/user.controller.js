import fs from 'fs';
import path from 'path';
import userSchema from '../models/user.model.js';
import cloudinary from '../constants/cloudinary.constant.js';
import asyncWrapper from '../utils/asyncWrapper.utils.js';
import {v4 as uuidv4} from 'uuid';

const updateUser = asyncWrapper(async (req, res) => {
    const { username, email, password, gender } = req.body;
    const userId = req.user._id;

    const user = await userSchema.findById(userId);

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    let profileImageUrl = user.profileImage;

    if (req.file) {
        const extension = path.extname(req.file.originalname);
        const baseName = path.basename(req.file.originalname, extension).replace(/\s+/g, '-').toLowerCase();
        const uniqueFilename = `${Date.now()}-${uuidv4()}-${baseName}${extension}`;

        try {
            const result = await cloudinary.uploader.upload(
                `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`,
                {
                    folder: 'user_images',
                    public_id: path.basename(uniqueFilename, extension), // filename without extension
                    resource_type: 'image'
                }
            );

            profileImageUrl = result.secure_url;
        } catch (err) {
            console.error('Cloudinary upload failed, saving locally:', err.message);

            const uploadsDir = path.join('uploads');
            if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

            const localPath = path.join(uploadsDir, uniqueFilename);
            fs.writeFileSync(localPath, req.file.buffer);

            profileImageUrl = `/uploads/${uniqueFilename}`;
        }
    }

    // Update user fields
    user.username = username || user.username;
    user.email = email || user.email;
    user.password = password || user.password;
    user.gender = gender || user.gender;
    user.profileImage = profileImageUrl;

    await user.save();

    res.status(200).json({ message: 'User updated successfully', user });
});

const deleteUser = asyncWrapper(async (req, res) => {
    const userId = req.user._id;
    
    const user = await userSchema.findById(userId);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    await userSchema.deleteOne({ _id: userId });
    res.clearCookie('token');
    res.status(200).json({ message: 'User deleted successfully' });
})

export {updateUser, deleteUser};