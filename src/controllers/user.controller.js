import { ApiError } from "../utils/ApiError.js";
import { asynchandler } from "../utils/asynchandler.js";
import { user } from "../models/user.model.js"
import {UploadOnCloudnary} from "../utils/cloudnary.js"
import { ApiResponce } from "../utils/ApiResponce.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";
const generateAccessTokenandRefrenceToken  =  async(userId)=>
    {
    try {
    const user =  await User.findById(userId)
    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()  
    user.refreshToken = refreshToken
    await user.save({validateBeforeSave:false})
    return {accessToken,refreshToken}
    } catch (error) {
        throw new ApiError("something went wrong while generate refrensh and acces token")
    }

}
const registerUser = asynchandler(async (req,res )=>{
  // get user details from frontend
  // validation  - not empty
  // check if user alredy exists: username,email
  // check for images , check for avtar
  // create user object  - create entry in db
  // remove password and refresh token field    from response
  // check for user creation
  // return res
  const {fullname,username,email,password} = req.body
  console.log("email",email);
//   if(fullname === ""){
//     throw new ApiError(400,"full name required ")
//   }
    if([fullname,email,password].some((field)=>
        field?.trim() === "")){
            throw new ApiError(400,"full name required ")
        }
        const existedUser = await User.findOne({
            $or:[{username},{email}]
        })
        if(existedUser){
            throw new ApiError(409," this is already existed")
        }
        const avatarLocalPath = req.files?.avatar[0]?.path
        // const coverImageLocalPath = req.files?.coverImage[0]?.path
        let coverImageLocalPath;
        if(req.files && Array.isArray(req.files.coverImage)
        && req.files.coverImage.length > 0){
    coverImageLocalPath = req.files.coverImage[0].path}
        if(!avatarLocalPath){
            throw new ApiError(400,"avatar file is required")
        }
        const avatar = await UploadOnCloudnary(avatarLocalPath)
        const coverImage = await UploadOnCloudnary(coverImageLocalPath)

        if(!avatar){
            throw new error(400,"avatar file is required")
        }

      const user =   User.create({
            fullname,
            avatar:avatar.url,
            coverImage:coverImage?.url || "",
            email,
            password,
            username: username.toLowerCase()
        })

        const createdUser = await User.findById(user._id).select(
            "-password refreshToken"
        )
        if(!createdUser){
            throw new ApiError(500,"something went wrong while registered the user")
        }
        return res.status(201).json(
            new ApiResponce(200,createdUser,"user registerd successfully")
        )
       
          
})
 const loginUser = asynchandler(async(req,res)=>{
            // req.body =>data
            // username or email
            // find the user 
            // password check
            // acces or refrece token   
            // send cookies
            const {email,password,username} = req.body
            if(!(username || password)){
                throw new ApiError(400,"must be required")
            }
            const user =  await User.findOne({
                $or: [{username},{email}]
        })
        if(!user){
            throw new ApiError(404,"user does not access")
        }
        
        const isPasswordVailed =  await user.isPasswordCorrect(password)
        if(!isPasswordVailed){
            throw new ApiError(401,"invailed user credential")
        }
        const {accessToken,refreshToken} = generateAccessTokenandRefrenceToken(user._id)

          const loggedinUser = await User.findById(user._id).
            select("-password -refreshToken")

            const options ={
                httpOnly:true,
                secure:true
            }
        
            return res.status(200)
.cookie("accessToken",accessToken,options)
.cookie("refreshToken",refreshToken,options)
.json(
    new ApiResponce(
        200,
        {user:loggedInUser,accessToken,refreshToken},
        "User logged in Successfully"
    )
)

})

const loggoutUser = asynchandler(async(req,res)=>{
              await  User.findByIdAndUpdate(
                    req.user._id,
                    {
                        $set :{
                            refreshToken:undefined
                        }
                    },
                    {
                        new:true
                    }
                )
                const options ={
                httpOnly:true,
                secure:true
            }
            return res
            .status(200).clearCookie("accessToken",options)
            .status(200).clearCookie("refreshToken",options)
            .json(new ApiResponce(200,{},"User logged out"))
            })

            const refreshAccessToken = asynchandler(async(req,res)=>{
                const incomingRefreshToken = req.cookie.refreshToken || req.body.refreshToken
                if(!incomingRefreshToken){
                    throw new ApiError(401,"unauthorized request")
                }

               try {
                 const decodedToken  = jwt.verify(
                     incomingRefreshToken,
                     process.env.REFRESH_TOKEN_SECRET
                 )
                 const user = await User.findById(decodedToken?._id)
                 if(!user){
                     throw new ApiError(401,"invalid refresh token")
                 }
                 if(incomingRefreshToken !== user?.refreshToken){
                     throw new ApiError(401,"refresh token is expired or used")
                 }
                 const options ={
                 httpOnly:true,
                 secure:true
             }
             const {accessToken,newRefreshToken} = await generateAccessTokenandRefrenceToken(user._id)
             return res
             .cookie("accessToken",accessToken,options)
             .cookie("refreshToken",newRefreshToken,options)
             .json(new ApiResponce(200,
                {accessToken,refreshToken : newRefreshToken,},"access token refresed"
             ))
               } catch (error) {
                throw new ApiError(401,error?.message || "invaled refresh token")
               }
            })
const ChangeCurrentPassword = asynchandler(async(req,res)=>{
    const {oldPassword,newPassword} = req.body
        const user = await user.findById(req.user?._id)
        const isPasswordCorrect = await isPasswordCorrect(oldPassword)
        if(!isPasswordCorrect){
            throw new ApiError(400,"invailed old password")
        }
        user.password = newPassword
        await user.save({validateBeforeSave:false})
        return res
        .status(200)
        .json(new ApiResponce(200,{},"password change successfully"))
})

const getCurrentUser = asynchandler(async(req,res)=>{
    return res
    .status(200)
    .json(new ApiResponce(200,req.user,"current user fetch successfully"))
})
const updateAccountDetails = asynchandler(async(req,res)=>{
    const {fullname,email} = req.body
    if(!fullname || !email){
        throw new ApiError(400,"all field are required")
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                    fullname,
                    email:email
            }
        },
        {new:true}
    ).select("-password")
    return res
    .status(200)
    .json(new ApiResponce(200,user,"Account details successfully"))


})
const updateUserAvatar = asynchandler(async(req,res)=>{
    const avatarLocalPath = req.file?.path
    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is missing")
    }
    // todo delete old image
    const avatar = UploadOnCloudnary(avatarLocalPath)

    if(!avatar.url){
        throw new ApiError(400,"error while uploading in avatar")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar:avatar.url
            }
        }, {new:true}
    ).select("-password")
    return res.status(200)
    .json(200,user,"avatar image updated successfully")
})
const updateUserCoverImage = asynchandler(async(req,res)=>{
    const coverImageLocalPath = req.file?.path
    if(!coverImageLocalPath){
        throw new ApiError(400,"cover file is missing")
    }
    const coverImage = UploadOnCloudnary(avatarLocalPath)

    if(!coverImage.url){
        throw new ApiError(400,"error while uploading in avatar")
    }

   const user =  await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage:coverImage.url
            }
        }, {new:true}
    ).select("-password")
    return res.status(200)
    .json(200,user,"cover image updated successfully")
})
const getUserChennelProfile = asynchandler(async(req,res)=>{
    const {username} = req.params
    if(!username?.trim()){
        throw new ApiError(400,"username is missing")
    }


    const channel = await User.aggregate([
        {
            $match:{
                username:username?.toLowerCase()
            }
        },{
            $lookup:{
                from:"subscribtion",
                localField:"_id",
                foreignField:"channel",
                as:"subscribtion"
            },
            
        },
        {
            $lookup:{
                 from:"subscribtion",
                localField:"_id",
                foreignField:"subscriber",
                as:"subscribeTo"
            }
        },{
            $addFields:{
                subsciberCount:{
                    $size: "$subscriber"
                },
                channelSubscribeToCount:{
                    $size:"$subscribeTo"
                },
                isSubscribed:{
                    $cond: {
                        if:{$in:[req.user?._id,"$subscribtion.subscriber"]},
                        then:true,
                        else:false
                    }
                }
            }
        },
        {
            $project:{
                fullname:1,
                username:1,
                 subsciberCount:1,
                 channelSubscribeToCount:1,
                 isSubscribed:1,
                 avatar:1,
                 coverImage:1,
                 email:1
            }
        }
    ])
    if(!channel?.length){
        throw new ApiError(404,"channel does not exits")
    }
    return res
    .status(200)
    .json(new ApiResponce(200,channel[0],"user channel fatch successed"))
})

const getWatchHistory = asynchandler(async(req,res)=>{
    const user  =  await User.aggregate([
        {
            $match:{
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },{
            $lookup:{
                from:"videos",
                localField:"watchHistory",
                foreignField:"_id",
                as:"watchHistory",
                pipeline:[
                    {
                            $lookup:{
                                from:"users",
                                localField:"owner",
                                foreignField:"_id",
                                as:"owner",pipeline:[
                                    {
                                        $project:{
                                            fullname:1,
                                            username:1,
                                            avatar:1
                                        }
                                    }
                                ]
                            }
                    },
                    {
                        $addFields:{
                            owner:{
                                $first:"$owner"
                            }
                        }
                    }

                ]
            }
        }
    ])

    return res.status(200)
    .json(new ApiResponce(200,user[0].watchHistory,"watch history is succesfully"))
})
   
export  {registerUser,
    loginUser
    ,loggoutUser,
    refreshAccessToken,
    ChangeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChennelProfile,
    getWatchHistory
}