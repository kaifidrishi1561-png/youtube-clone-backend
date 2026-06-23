import mongoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const videoschema = new schema({
    Videofile:{
        type:String,
        required:true
    },
    thumbnail:{
        type:String,
        required:true
    },
    title:{
        type:String,
        required:true
    },
    discribtion:{
        type:String,
        required:true
    },
    duration:{
        type:Number,
        required:true
    },
    views:{type:String,
        default:0
    },
    ispubliched:{
        type:Boolean,
        default:true
    },
    owner:{
        type:Schema.Types.ObjectId
        ,ref:"User"
    }

},{
    timestamps:true
})
videoschema.plugin(mongooseAggregatePaginate)
export const video = mongoose.model("Video",videoschema)


// mongoose-aggregate-paginate-v2