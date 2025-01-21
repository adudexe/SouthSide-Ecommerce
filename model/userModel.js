const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        require:true,
    },
    email:{
        type:String,
        unique:true,
        require:true,
    },
    password:{
        type:String
    },
    isBlocked:{
        type:Boolean,
        default:false,
    },
    googleId:{
        type:String,
        unique:true
    },
    isAdmin:{
        type:Boolean,
        default:false
    },
    cart:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Cart"
    }],
    orders:[{
        type:mongoose.Schema.Types.ObjectId, 
        ref:"Order"
    }],
    wishlist:[{
        type:mongoose.Schema.Types.ObjectId, 
        ref:"Wishlist"
    }],
    wallet:[{
        type:mongoose.Schema.Types.ObjectId ,
        ref:"Wallet"
    }],
    
},{timestamps:true});


module.exports = mongoose.model("User",userSchema);