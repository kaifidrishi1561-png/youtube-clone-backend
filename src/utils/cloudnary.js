import {v2 as cloudinary} from "cloudinary"
import fs from "fs"




cloudinary.config({ 
  cloud_name: CLOUDINARY_CLOUD_NAME, 
  api_key: CLOUDINARY_API_KEY, 
  api_secret: CLOUDINARY_API_SECRET
});


const UploadOnCloudnary = async (localFilePath)=>{
  try {
    if(!localFilePath) return null
    const response = cloudinary.uploader.upload(localFilePath,{
      resource_type:"auto",
    })
    // console.log("file is upload",(await response).url);
    fs.unlinkSync(localFilePath)
    return response
  } catch (error) {
    fs.unlinkSync(localFilePath)// remove locally save temorary file  as the upload opration
    // got failed 
  }
}



export {UploadOnCloudnary}
// cloudinary.uploader
//   .upload("my_image.jpg")
//   .then(result=>console.log(result));