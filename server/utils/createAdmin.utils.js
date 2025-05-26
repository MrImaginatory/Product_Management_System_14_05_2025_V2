import userSchema from "../models/user.model.js";

const createAdminUser = async () => {
    const adminEmail = process.env.ADMIN_EMAIL;

    const existingAdmin = await userSchema.findOne({ email: adminEmail });
    if (existingAdmin) {
        console.log("Admin already exists.");
        return;
    }

    const admin = new userSchema({
        username: process.env.ADMIN_USERNAME,
        email: adminEmail,
        password: process.env.ADMIN_PASSWORD,
        role: process.env.ADMIN_ROLE,
        verified: true,
        gender: process.env.ADMIN_GENDER,
        profileImage: process.env.ADMIN_PROFILE_IMAGE,
    });

    await admin.save();
    console.log("Admin user created.");
};

export default createAdminUser;