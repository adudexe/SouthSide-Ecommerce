const mongoose = require("mongoose");
const orderSchema = mongoose.Schema({
    userId:{
        type:mongoose.Schema.ObjectId,
        ref:"User",
        required:true
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
                        type: Number,  //If discount is appled then the discount applied price should be added here..
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
        },
        status:{
            type:String,
            required:true,
            enum:['Pending','Processing','Shipped','Delivered','Cancelled','Returned','Refunded']
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
    createdOn:{
        type:Date,
        default:Date.now,
        required:true
    },
    couponApplied:{
        code:{
            type:String,
            required:true,
            unique:true
        },
        discount:{
            type:Number,
            required:true,
            min:0
        },
    },
    paymentMethod:{
        type:String,
        required:true,
    },
    // status:{
    //     type:String,
    //     required:true,
    //     enum:['Pending','Processed','Shipped','Delivered','Cancelled','Return Request','Returned','Refunded']
    // } 
    // couponApplied:{
    //     type:mongoose.Schema.Types.ObjectId,
    //     ref:"",
    // }

})

module.exports = mongoose.model("Order",orderSchema);