const User = require("../model/userModel");
const OTPDB = require("../model/otpModal");
const nodemailer = require("nodemailer");
const bcrypt = require('bcryptjs');
const forgetController = {};

forgetController.forgetPassword = async (req,res) =>{
    try{
        const userEmail = req.body.email;
        const userFound = await User.findOne({email:userEmail});
        if(userFound)
        {
            const OTP = generateOTP();
            req.session.email = userEmail;
            const NewOTP =  new OTPDB({
                email:userEmail,
                OTP:OTP,
            })
            const OTPSaved = await NewOTP.save();
            console.log(OTPSaved);
            if(OTPSaved)
            {
                if(sendVerificationEmail(userEmail,OTP))
                {
                    return res.status(200).json({success:true})
                }
                
            }
            else
            {
                return res.status(500).json({message:"Internal Server Error"});
            }
        }
        else
        {
            return res.status(404).json({success:false,message:"Email Not Found"});
        }
    }   
    catch(err)
    {
        console.log("Error in Foget Password",err);
    }
}


forgetController.OTPMatch = async (req,res)=>{
    try
    {
        const userOTP = req.body.otp;
        const DBOTP = await OTPDB.findOne({OTP:userOTP});
        if(DBOTP)
        {
            const deleteOTP = await OTPDB.findByIdAndDelete(DBOTP._id);
            console.log("Deleted OTP",deleteOTP);
            return res.status(200).json({success:true});
        }
        else
        {
            // const deleteOTP = await OTPDB.deleteMany();
            // console.log("Deleted OTP",deleteOTP);
            return res.status(404).json({success:false,message:"Invalid OTP"});
        }
    }
    catch(error)
    {
        console.log("Error in OTP match",error);
    }
}

forgetController.newPassword = async (req, res) => {
    try {
      // Get newPassword and oldPassword from request body
      const { newPassword, oldPassword } = req.body;
  
      // Check if both passwords are provided
      if (!newPassword || !oldPassword) {
        return res.status(400).json({ success: false, message: 'Both old and new passwords are required!' });
      }
  
      // Get the user's email from the session
      const email = req.session.email;
      console.log("Email",email);
  
      if (!email) {
        return res.status(400).json({ success: false, message: 'User not logged in!' });
      }
  
      
      // Find the user by email
      const user = await User.findOne({ email });
      console.log("User",user);
  
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found!' });
      }
  
      // Verify the old password with the hashed password in the database
      const isMatch = await bcrypt.compare(oldPassword, user.password);
  
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Old password is incorrect!' });
      }
  
      // Hash the new password before saving
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
  
      // Update the user's password with the new hashed password
      user.password = hashedNewPassword;
  
      // Save the updated user document
      await user.save();
  
      // Return a success response
      return res.status(200).json({ success: true, message: 'Password updated successfully!' });
  
    } catch (err) {
      console.log('Error in newPassword:', err);
      return res.status(500).json({ success: false, message: 'An error occurred while updating the password.' });
    }
  };


forgetController.resedOTP = async (req,res) =>{
    try
    {

    }
    catch(err)
    {
        console.log("Error in resendOTP",err);
    }
}

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





module.exports = forgetController;