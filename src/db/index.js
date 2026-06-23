import mongoose, { Mongoose } from "mongoose";
import { DB_NAME } from "../constants.js";
const connectDB  = async ()=>{
try {
   const connecttionInstance =  mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
   console.log(`\n this is a important information ${(await connecttionInstance).connection.host}`)
} catch (error) {
    console.log("mongoodb connection error",error)
    process.exit(1)
}
}

export default connectDB