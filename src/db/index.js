import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";


const connectDB = async () => {
    console.log('MONGODB_URL:', process.env.MONGODB_URL)
    try {

        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
        console.log(`MONGO DB connected DB HOST: ${connectionInstance.connection.host} `)
        

    } catch (error) {
        console.log("MONGO DB connection error: ", error)
        process.exit(1)
    }
}


export default connectDB 