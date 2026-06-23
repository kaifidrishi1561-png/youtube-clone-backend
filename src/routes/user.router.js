import { Router } from "express";
import { ChangeCurrentPassword, getCurrentUser, getUserChennelProfile, getWatchHistory, loggoutUser, loginUser, registerUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middlewate.js"
import {ApiError} from "../utils/ApiError.js"
import { refreshAccessToken } from "../controllers/user.controller.js";
const router = Router()


Router.route("/reginster").post(
    upload.fields([{
name:"avatar",
maxCount:1
    },
{
    name:"coverImage",
    maxCount:1
}]),


    registerUser
)
Router.route("/login").post(loginUser)
Router.route("/logout").post(verifyJWT,loggoutUser)
Router.route("/refresh-token").post(refreshAccessToken)
Router.route("/change-password").post(verifyJWT,ChangeCurrentPassword)
Router.route("/current-user").get(verifyJWT,getCurrentUser)
Router.route("/update-account").patch(verifyJWT,updateAccountDetails)
Router.route("/avatar").patch(verifyJWT,upload.single("avatar"),updateUserAvatar)
Router.route("/cover-image").patch(verifyJWT,upload.single("coverImage"),updateUserCoverImage)
Router.route("/c/:username").get(verifyJWT,getUserChennelProfile)
Router.route("/history").get(verifyJWT,getWatchHistory)



// Router.Route("/login").post(login)
export default Router