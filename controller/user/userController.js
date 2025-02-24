// const express = require("express");
const User = require("../../model/userModel");
const OTPDB = require("../../model/otpModal");
const Wishlist = require("../../model/wishlistSchema");
const Cart = require("../../model/cartSchema");
const Wallet = require("../../model/walletSchema");
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
userController.loadHomePage = async (req, res) => {
    try {
        const sessionUser = req.session.user
        const product = await Product.find().populate('category').limit(4);

        if (sessionUser) {
            return res.render("./user/landingPage", { products: product, user: sessionUser });
        }
        else {
            return res.render("./user/landingPage", { products: product });
        }


    }
    catch (err) {
        console.log(err);
    }
}

userController.userLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log({ email, password });
        const user = await User.findOne({ email })
        // console.log(user.orders);
        // const cart = await cart.find({userId:user._id})


        // //To set the cart id in the user modal during login
        // const cartDetailsUpdate = await User.findByIdAndUpdate(user._id,{cart:card._id});
        // console.log(cartDetailsUpdate);

        if (user) {
            if (!user.isBlocked) {
                const match = await bcrypt.compare(password, user.password);
                if (match) {
                    req.session.user = user;
                    // console.log(req.session.user);
                    // console.log("sessi",req.session.user.isBlocked)
                    // console.log(req.user);
                    res.status(statusCode.OK).json({ success: true, redirected: "/user/home" });
                }
                else {
                    res.status(statusCode.OK).json({ success: false, message: "Cannot Login" });
                }
            }
            else {
                res.status(statusCode.FORBIDDEN).json({ message: "Your Account Has Been Blcoked.." });
            }


        }
        else {
            res.status(statusCode.NOT_FOUND).json({ message: "User Not Found" });
        }

    } catch (err) {
        console.log("Error in Logging In " + err);
    }

}

//To Load Login Page
userController.loadLoginPage = (req, res) => {
    try {
        // console.log("User Session From Get login",req.session.user)
        if (req.session.user) {
            // console.log("It should redirect to home");
            return res.redirect("/user/home");
        }
        else {
            let message = req.session.message || req.flash('success') || req.flash('error') || ''; // checks if any message is present in the following session or flash message
            delete req.session.message; // The session containing the message will be deleted for new message to be held.
            if (typeof (message) == "object") {
                message = ''
            }
            res.render('./user/loginPage', { error: message || '' }); // The Login page will be rendered along with the error message.
        }
    }
    catch (err) {
        console.log("Error in Rendering the Login Page ", err);
        rse.status(statusCode.INTERNAL_SERVER_ERROR).render("./user/pageNotFound", { message: "Error in loading the Loginpage" });
    }
}

//To Load SignUp Page
userController.loadSignUpPage = (req, res) => {
    try {
        if (req.session.user) {
            res.redirect("/user/home")
        }
        else {
            return res.render("./user/signUpPage", { error: "" });
        }
    }
    catch (err) {
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
async function sendVerificationEmail(email, otp) {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: process.env.NODEMAILER_EMAIL,
                pass: process.env.NODEMAILER_PASS,
            }
        })

        const info = await transporter.sendMail({
            from: process.env.NODEMAILER_EMAIL,
            to: email,
            subject: "Verify Your Account",
            text: `Your OTP is ${otp}`,
            html: `<b>Your OTP :${otp}<b>`
        })

        // console.log("info");
        // console.log(!!info.messageId);
        return !!info.messageId;
    }
    catch (err) {
        console.log(err);
    }
}


userController.verifyOTP = async (req, res) => {
    try {
        const userOtp = req.body.otp;

        console.log("User OTP is " + userOtp);

        const savedOTP = await OTPDB.findOne({ OTP: userOtp });

        console.log("Saved OTP - ", savedOTP);

        // Compare OTP
        if (savedOTP) {
            if (savedOTP.OTP == userOtp) {
                const deleteOTP = await OTPDB.findByIdAndDelete(savedOTP._id);
                if (deleteOTP) {
                    console.log("OTP Successfully Deleted..");
                }
                else {
                    console.log("OTP Not deleted")
                }
                res.status(statusCode.OK).json({
                    message: "Otp Verified Sucessfully",
                    redirectTo: "/user/login"
                });

                // Create new user
                const newUser = await new User({
                    name: req.session.userData.name,
                    email: req.session.userData.email,
                    password: req.session.userData.password
                });
                // console.log(newUser);
                // Save new user to the database
                const savedUser = await newUser.save();
                if (savedUser) {
                    console.log(savedUser);
                    console.log("User has been added");
                }
                const newUserCart = await new Cart({
                    userId: savedUser._id
                })
                await newUserCart.save();
                const newUserWallet = await new Wallet({
                    userId: savedUser._id
                })
                await newUserWallet.save();
                const newUserWishList = await new Wishlist({
                    userId: savedUser._id
                })
                await newUserWishList.save();

            }
            else {
                res.status(statusCode.BAD_REQUEST).json({ message: "OTP Not Verified" });
            }
        }
        else {
            return res.status(statusCode.INTERNAL_SERVER_ERROR).json({ message: "OTP Not found" });
        }

    } catch (err) {
        console.error(err);
        res.status(statusCode.INTERNAL_SERVER_ERROR).json({ message: "An error occurred" });
    }
};


//To Logout 
userController.userLogout = (req, res) => {
    try {
        if ((req.session && req.session.user) || req.user) {
            req.session.destroy((err) => {
                console.log("Error in Destroing Session", err);
            })
            res.redirect("/user/login")
        }
        else {
            console.log()
        }
    } catch (error) {
        console.log('Error in logging out..', error)
    }
}



userController.resendOTP = async (req, res) => {
    try {
        const { email } = req.session.userData;

        const savedOTP = await OTPDB.findOne({ email: email });
        if (savedOTP) {
            const DeleteOTP = await OTPDB.findOneAndDelete({ email: email });
            console.log("Deleted OTP :", DeleteOTP);
        }
        else {

        }

        const { resend } = req.body;

        if (resend) {
            const OTP = generateOTP();
            const resentOTP = new OTPDB({
                OTP: OTP,
                email: email,
                createdAt: new Date(),
            });
            const newOTP = await resentOTP.save();
            console.log("New OTP ", newOTP);

            // console.log("New OTP is "+req.session.OTP);
            console.log("Email is" + email);
            const emailSent = await sendVerificationEmail(email, OTP);
            if (!emailSent) {
                return res.status(statusCode.INTERNAL_SERVER_ERROR).send("Failed to send email");
            }
        }
        else {
            res.redirect("/user/signup")
        }
    }
    catch (err) {
        console.log("Error in resending OTP" + err);
    }
}

//To Collect Data From SignUPPage
userController.registerUser = async (req, res) => {
    try {


        // Destructure the input fields from the request body
        const { name, email, password } = req.body;
        console.log({ name, email, password });

        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        // console.log(existingUser);

        if (existingUser) {
            return res.status(409).json({
                message: "Email Already in use",
                redirectTo: "/user/login",
            });
        }

        // Generate OTP
        const otp = generateOTP();
        console.log("The OTP is " + otp);

        // Save OTP in the OTP database with an expiration time (optional)
        const otpRecord = new OTPDB({
            OTP: otp,
            email: email,
            createdAt: new Date(),
        });
        const savedOTP = await otpRecord.save();
        console.log(savedOTP);

        if (savedOTP) {
            console.log("We are in Saved OTP");
            // Send OTP email
            const emailSent = await sendVerificationEmail(email, otp);

            if (!emailSent) {
                return res.status(500).send("Failed to send email");
            }

            // Hash the password before storing it
            const hashedPassword = await bcrypt.hash(password, 12);

            // Store user data in session
            req.session.userData = {
                name,
                email,
                password: hashedPassword,
            };
            console.log("OTP Successfully Sent");
            // Respond with OTP verification form prompt
            return res.status(200).json({ verifyOTPForm: true });
        } else {
            return res.status(500).json({ message: "Internal Server Error" });
        }
    } catch (err) {
        console.log("Error in RegisterPage: ", err);
        res.status(500).json({ message: "An error occurred while processing your request" });
    }
}

userController.updateDetails = async (req, res) => {
    try {
        console.log("hi");
        const userId = req.session.user._id;
        const newValues = req.body;
        console.log(userId, newValues)
        const updatedValue = await User.findOneAndUpdate({ _id: userId }, { $set: newValues });
        if (updatedValue) {
            return res.status(statusCode.OK).json({ message: "Data Changed Succesfully", user: updatedValue });
        }
        else {
            return res.status(statusCode.INTERNAL_SERVER_ERROR).json({ message: "Internal Server Error" });
        }


    } catch (error) {
        console.log("Error in Updating User Details...", error);
    }
}


module.exports = userController
