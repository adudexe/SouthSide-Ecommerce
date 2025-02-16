const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        unique:true
    },
    description:{
        type:String,
        // required:true
    },
    discount:{
        type:Number,
    },
    isListed:{
        type:Boolean,
        default:true,
    },
    createdAt:{
        type:Date,
        default:Date.now
    }
});

module.exports = mongoose.model("Category",categorySchema);