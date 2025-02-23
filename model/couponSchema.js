const mongoose = require("mongoose");


const couponSchema = new mongoose.Schema({
    code:{
        type:String,
        required:true,
        unique:true
    },
    type: {
        type: String,
        enum: ['fixed', 'percentage'],  // 'fixed' or 'percentage' type for the discount
        required: true
    },

    // isActive:{
    //     type:Boolean,
    //     required:true,
    //     default:true,
    // },
    discount:{
        type:Number,
        required:true,
        min:0
    },
    minmumAmount:{
        type:Number,
        required:true
    },
    // isDeleted:{
    //     type:Boolean,
    //     default:true
    // },
    userId:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }]
})

module.exports =  mongoose.model("Coupon",couponSchema);
