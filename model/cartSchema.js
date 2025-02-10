const mongoose = require("mongoose");


const cartSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Types.ObjectId,
        ref:"User",
        required:true,
        unique:true,
    },
    items:[{
        productId:{
            type:mongoose.Types.ObjectId,
            ref:"Products",
            required:true
        },
        variantId:{
            type:mongoose.Types.ObjectId,
            required:true,
        },
        quantity:{
            type:Number,
            default:1,
            max:5,
        },
        price:{
            type:Number,
            // required:true
        },
        totalPrice:{
            type:Number,
            // required:true
        },
        status:{
            type:String,
            defalut:"placed",
        },
        cancellationRequest:{
            type:String,
            default:"none"
        }
    }],
    couponApplied:{
        type:mongoose.Types.ObjectId,
        ref:"Coupon"
    }
});

module.exports = mongoose.model("Cart",cartSchema);
    