import mongoose from "mongoose";
const likeSchema = mongoose.Schema({
    video:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Video",
        required:true
    },
comment:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"comment",
    required:true
},
tweet:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"tweet",
    required:true
},
likedBy:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
    required:true   
}

},{
    timestamps:true
})
export const like = mongoose.model("like",likeSchema)