const mongoose = require("mongooose");


const wishlistSchema =  new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    products:[{
        productsId:{
            type:mongoose.Schema.Type.ObjectId,
            ref:"Products",
            required:true
        },
        addedOn:{
            type:Date,
            default:Date.now
        }
    }]
})

module.exports = mongoose.module("Wishlist",wishlistSchema);