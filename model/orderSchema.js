const mongoose = require("mongoose");
const orderSchema = mongoose.Schema({
    userId:{
        type:mongoose.Schema.ObjectId,
        ref:"User",
    },
    orderItems:[{
            product:{
                productName : {
                    type:String,
                    required:true
                },
                description:{
                    type:String,
                    required:true
                },
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
            }
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
        name:{
            type:String,
            required:true,
            tirm:true,
        },
        street: {
            type: String,
            required: true,
            trim: true,
        },
        city: {
            type: String,
            required: true,
            trim: true,
        },
        state: {
            type: String,
            required: true,
            trim: true,
        },
        postalCode: {
            type: String,
            required: true,
        },
        country: {
            type: String,
            required: true,
            trim: true,
        },
        phone: {
            type: String,
            required: true,
            match: [/^\+?\d{1,4}?[-.\s]?\(?\d+\)?[-.\s]?\d+[-.\s]?\d+$/, 'Please enter a valid phone number'], // General phone number validation
        },
        isPrimary: {
            type: Boolean,
            default: false,
            required: true,  // Only one primary address can be true for a user
        }
    },
    invoiceDate:{
        type:Date
    },
    status:{
        type:String,
        required:true,
        enum:['Pending','Processed','Shipped','Delivered','Cancelled','Return Request','Returned','Refunded']
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

module.exports = mongoose.model("Order",orderSchema);