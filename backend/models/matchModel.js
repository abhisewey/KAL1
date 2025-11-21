import mongoose from "mongoose"
const matchSchema=new mongoose.Schema(
    {
        hostId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true,
        },
        turfId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Turf",
            required:true,
        },
        slotId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Slot",
            required:true,
        },
        turfType:{
            type:String,
            required:true,
        },
        totalPrice:{
            type:Number,
            required:true,
        },
    }
)