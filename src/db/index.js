import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try {
        const connectionInstance =  await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`, /*{
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify: false
        }*/);
        console.log(`\n Database connected successfully !! DB HOST: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("Error connecting to database", error);
        throw error;
        process.exit(1);
    }
};

export default connectDB;