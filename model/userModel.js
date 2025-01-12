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
    cart:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Cart"
    }]
},{timestamps:true});


module.exports = mongoose.model("User",userSchema);