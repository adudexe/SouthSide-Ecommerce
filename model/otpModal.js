const mongoose = require("mongoose");


const OTPScheme = mongoose.Schema({
    OTP:{
        type:String,
    },
    email:{
        type:String
    }
})

module.exports = mongoose.model("OTP",OTPScheme);