const mongoose = require("mongoose");


const addressScheme = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true      
    },
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
    },
    addressNumber: {
        type: String, // Address can be shipping or billing
        required: true,
    }

},{timestamps:true});

module.exports = mongoose.model("Address",addressScheme);

