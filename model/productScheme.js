const mongoose = require("mongoose");


const productSchema = new mongoose.Schema({
    productName : {
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    // brand:{
    //     type:String,
    //     required:true,
    // },
    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Category",
        required:true,
    },
    productOffer:{
        type:Number,
        default:0,
    },
    variants:[{
        size: {
            type: String,
            required: false, // Optional, depending on your use case
        },
        color: {
            type: String,
            required: false, // Optional, depending on your use case
        },
        price: {
            type: Number,
            required: true,
        },
        salePrice: {
            type: Number,
            default: null,
        },
        quantity: {
            type: Number,
            default: 0,
            min: 0,
        },
        status: {
            type: String,
            enum: ["Available", "OutOfStock", "Discontinued"],
            default: "Available",
        },
    }],
    productImages:{
        type:[String],
        required:true,
    },
    isDeleted:{
        type:Boolean,
        default:false
    },
    isBlocked:{
        type:Boolean,
        default:false,
    },
    // isListed:{
    //     type:Boolean,
    //     default:true
    // }
},{timestamps:true});

module.exports = mongoose.model("Products",productSchema);