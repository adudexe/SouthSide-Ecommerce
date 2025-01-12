const mongoose = require("mongoose");

//To Establish Connection to the database...
module.exports = connectDB = async ()=>{
    mongoose.connect(process.env.DB_URI).then(()=>{
        console.log("MongoDB Connection is Established....");
    }).catch((err)=>{
        console.log("Error in Connecting to Database",err);
    })
};
