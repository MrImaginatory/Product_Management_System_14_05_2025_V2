import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI;
const DATABASE = process.env.MONGO_DB;

const connectDB = async() =>{
    try {
        const connectionInstance = await mongoose.connect(`${MONGO_URI}/${DATABASE}`);

        console.log("Database Connected Successfully");
        
        // console.log(connectionInstance);
    } catch (error) {
        console.error("Error Connecting Database: ",error.message);        
    }
}

export {connectDB}
