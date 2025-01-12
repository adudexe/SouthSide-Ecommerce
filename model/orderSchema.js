const mongoose = require("mongoose");
const {v4:uuidv4} = require("uuid");
const orderSchema = mongoose.Schema({
    orderId:{
        type:String,
        default:()=>uuidv4(),
        unique:true
    },
    orderItems:[{
        //status
        product:{
            type:mongoose.Schema.ObjectId,
            ref:"Products",
            unique:ture,
        },
        quantity:{
            type:Number,
            required:true,
        },
        price:{
            type:Number,
            default:0
        }
    }],
    totalPrice:{
        type:Number,
        required:true
    },
    discount:{
        type:Number,
        default:0
    },
    finalAmount:{
        type:Number,
        required:true
    },
    addres:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:ture
    },
    invoiceDate:{
        type:Date
    },
    status:{
        type:String,
        required:true,
        enum:['Pending','Processed','Shipped','Delivered','Cancelled','Return Request','Returned']
    },
    createdOn:{
        type:Date,
        default:Date.now,
        required:true
    },
    couponApplied:{
        type:Boolean,
        default:false
    }
})

module.exports = mongoose.mongo("Order",orderSchema);