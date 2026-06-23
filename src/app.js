import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

// $ touch app.js constants.js index.js
const app = express()
app.use(cors({
    origin:process.env.CORS,
    credentials:true
}))
app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

// route
import Router from "./routes/user.router.js"

//  route declaration 
app.use("/api/v1/users",userRouter)

export {app}