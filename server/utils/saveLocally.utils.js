import fs from 'fs';
import path from 'path';

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

export default saveImageLocally;