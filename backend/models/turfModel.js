import mongoose from "mongoose"
const turfSchema=new mongoose.Schema(
    {
        name:{
            type:String,
            required:true,
        },
        location:{
            type:String,
            required:true,
        },
        address:{
            type:String,
            required:true,
        },
        types:[
            {
                type:String,
            },
        ],
        images:[
            {
                type:String,
            },
        ],
        price:{
            type:Number,
            required:true,
        },
        partnerId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:User,
            required:true,
        },
        isActive:{
            type:Boolean,
            default:true,
        },
    },
    {timestamps:true}
)
const Turf= mongoose.model("Turf",turfSchema)

export default Turf