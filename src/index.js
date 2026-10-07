// import mongoose from "mongoose";
// import { DB_NAME } from "./constants";
import connectDB from "./db/index.js";
import dotenv from "dotenv"
import express from "express"


dotenv.config({path:"./.env"})

const app = express()








connectDB()
.then(()=>{
  app.on("error",(error)=>{
console.error("error",error)
throw error
  })
  app.listen(process.env.PORT || 8000 ,()=>{
    console.log(`server is running ${process.env.PORT}`)

  })
})
.catch((err)=>{
  console.log("mongodb connection faild",err)
})



/*
import express from "express"
const app = express()
(async()=>{
    try {
      await  mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
      app.on("error",(error)=>{
        console.log("error",error);
        throw error
      })
      app.listen(process.env.PORT,()=>{
        console.log(`app is lisning ${process.env.PORT}`)
      })  
    } catch (error) {
        console.error("error")
        throw error
    }
})() kaif*/