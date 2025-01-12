// const express = require("express");
const User = require("../../model/userModel");
const session = require("express-session");
const flash = require("connect-flash");
const statusCode = require("../../public/javascript/statusCodes");
const bcrypt = require("bcrypt");
require('dotenv').config();
const nodemailer = require("nodemailer");
const Product = require("../../model/productScheme");
// const { json } = require("express");
const userController = {};

//To Load Home Page
userController.loadHomePage = async (req,res)=>{
    try{

        // console.log("Home Page")
        // req.session.user = {
        //     id:req.user.id,
        //     name:req.user.name,
        //     email:req.user.email
        // }
        // console.log("User Session",req.session.user);
        // console.log("Google User Session",req.user);
        const sessionUser = req.session.user
        const product = await Product.find().populate('category');
        // console.log(req.session.user);
        res.render("./user/landingPage",{products:product,user:sessionUser,});
    }
    catch(err)
    {
        console.log(err);
    }
} 

userController.userLogin = async (req,res) => {
    try
    {
        const {email , password} = req.body;
        console.log({email , password});
        const user = await User.findOne({email}); 
         console.log(user);
        
        if(user)
        {
           if(!user.isBlocked)
            {
                const match = await bcrypt.compare(password, user.password);
                if(match)
                {
                    req.session.user = user;
                    // console.log(req.session.user);
                    // console.log("sessi",req.session.user.isBlocked)
                    // console.log(req.user);
                    res.status(statusCode.OK).json({success:true,redirected:"/user"});
                }
                else
                {
                    res.status(statusCode.OK).json({success:false,message:"Cannot Login"});
                }
            } 
            else
            {
                res.status(statusCode.FORBIDDEN).json({message:"Your Account Has Been Blcoked.."});
            }
           
            
        }
        else
        {
            res.status(statusCode.NOT_FOUND).json({message:"User Not Found"});
        }

    }catch(err)
    {
        console.log("Error in Logging In "+err);
    }

}

//To Load Login Page
userController.loadLoginPage = (req,res) => {
    try{
            let message = req.session.message || req.flash('success') || req.flash('error') || '' ; // checks if any message is present in the following session or flash message
            delete req.session.message; // The session containing the message will be deleted for new message to be held.
            if(typeof(message)=="object")
            {
                message = ''
            }
            res.render('./user/loginPage',{ error: message || ''}); // The Login page will be rendered along with the error message.
    }
    catch(err)
    {
        console.log("Error in Rendering the Login Page ",err);
        rse.status(statusCode.INTERNAL_SERVER_ERROR).render("./user/pageNotFound",{message : "Error in loading the Loginpage"});
    }
}

//To Load SignUp Page
userController.loadSignUpPage = (req,res) => {
    try{
        res.render("./user/signUpPage",{error:""});
    }
    catch(err)
    {
        console.log(err);
    }
}

// //General Error Function
// function sendErrorMessage(req,res,message)
// {
//     req.session.message = message;
//     res.status(statusCode.INTERNAL_SERVER_ERROR).redirect('/login');
// }

//Function to generate OTP
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

//Mail sender function
async function sendVerificationEmail(email,otp){
    try{
        const transporter = nodemailer.createTransport({
            service:"gmail",
            port:587,
            secure:false,
            requireTLS:true,
            auth:{
                user:process.env.NODEMAILER_EMAIL,
                pass:process.env.NODEMAILER_PASS,
            }
        })

        const info = await transporter.sendMail({
            from:process.env.NODEMAILER_EMAIL,
            to:email,
            subject:"Verify Your Account",
            text:`Your OTP is ${otp}`,
            html:`<b>Your OTP :${otp}<b>`
        })

        // console.log("info");
        // console.log(!!info.messageId);
        return !!info.messageId;
    }
    catch(err)
    {
        console.log(err);
    }
}


userController.verifyOTP = async (req, res) => {
   try {
       const userOtp = req.body.otp;
       
        console.log("OTP is "+req.session.OTP)

       console.log("User OTP is "+userOtp);
       
       // Compare OTP
       if (userOtp == req.session.OTP) {
        
           res.status(statusCode.OK).json({
            message:"Otp Verified Sucessfully",
            redirectTo:"/user/login"
           });

           // Create new user
           const newUser = await new User({
               name: req.session.userData.name,
               email: req.session.userData.email,
               password: req.session.userData.password
           });

        //    console.log(newUser);

           // Save new user to the database
           const savedUser = await newUser.save();
           if (savedUser) {
               console.log(savedUser);
               console.log("User has been added");
           } 
       } else {
           res.status(statusCode.BAD_REQUEST).json({ message: "OTP Not Verified" });
       }
   } catch (err) {
       console.error(err);
       res.status(statusCode.INTERNAL_SERVER_ERROR).json({ message: "An error occurred" });
   }
};


//To Logout 
userController.userLogout = (req,res)=> {
    try {
        if((req.session && req.session.user) || req.user)
        {
            req.session.destroy((err)=>{
                console.log("Error in Destroing Session",err);
            })
            res.redirect("/user/login")
        }
        else
        {
            console.log()
        }
    } catch (error) {
        console.log('Error in logging out..',error)
    }
}



userController.resendOTP = async (req,res) => {
    try{
        const {email} = req.session.userData;
        req.session.OTP = null;
        console.log("sessionOTP"+req.session.OTP);
        const {resend} = req.body;
        console.log(resend);
        if(resend)
        {
        const OTP = generateOTP();
            req.session.OTP = OTP;
            req.session.save()
        console.log("New OTP is "+req.session.OTP);
        console.log("Email is"+email);
        const emailSent = await sendVerificationEmail( email,OTP );
        if(!emailSent)
        {
            return res.status(statusCode.INTERNAL_SERVER_ERROR).send("Failed to send email");
        }
        }
        else
        {
            res.redirect("/user/signup")
        }
    }
    catch(err)
    {
        console.log("Error in resending OTP"+ err);
    }
}

//To Collect Data From SignUPPage
userController.registerUser = async (req,res) =>{
    try
    {

        //store the otp in db 
        
        // console.log('registerUser')
        // console.log(req.body)
        const { name , email , password } = req.body;
        // console.log(name,email);
        const existingUser = await User.findOne({ email });
        // console.log(existingUser[0]);
        if(existingUser)
        {
            return res.status(statusCode.COFLICT).json({
                message:"Email Already in use",
                redirectTo:"/user/login"
            });
        }
        const OTP = generateOTP();
        console.log("The OTP is "+OTP);

        const emailSent = await sendVerificationEmail( email,OTP );

        if(!emailSent)
        {
            return res.status(statusCode.INTERNAL_SERVER_ERROR).send("Failed to send email");
        }

        const hashedPassword = await bcrypt.hash(password,12);

        req.session.OTP = OTP,
        req.session.userData = {
            name,
            email,
            password:hashedPassword,
        } 
        return res.status(statusCode.OK).json({ verfyOTPForm:true });
    }
    catch(err)
    {
        console.log('Error in RegisterPage ' +err);
        res.redirect("/user/pageNotFound");
    }
}

userController.updateDetails = async (req,res)=>{
    try {
        console.log("hi");
        const userId = req.session.user._id;
        const newValues = req.body;
        console.log(userId,newValues)
        const updatedValue = await User.findOneAndUpdate({_id:userId},{$set:newValues});
        if(updatedValue)
        {
            return res.status(statusCode.OK).json({message:"Data Changed Succesfully",user:updatedValue});
        }
        else
        {
            return res.status(statusCode.INTERNAL_SERVER_ERROR).json({message:"Internal Server Error"});
        }
        

    } catch (error) {
        console.log("Error in Updating User Details...",error);
    }
}


module.exports = userController