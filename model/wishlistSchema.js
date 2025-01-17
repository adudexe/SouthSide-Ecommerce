const mongoose = require('mongoose');

const wishlistSchema =  new mongoose.Schema({
     userId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'User',
            required:true      
        },
    products:[{
        productsId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Products",
            required:true
        },
        addedOn:{
            type:Date,
            default:Date.now
        }
    }]
})

module.exports = mongoose.model("Wishlist",wishlistSchema);