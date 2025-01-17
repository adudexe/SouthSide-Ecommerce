const User = require("../model/userModel");
const cart = require("../model/cartSchema");
const userAuth = {}


//is Logged in
userAuth.isLogged = async (req, res, next) => {
  try {
    // To Constantly be Logged in...
    // const user = await User.findOne();
    // req.session.user = user; //to get a const user

    // console.log(req.session.user); //To check if there was a session
    //Remove the above line becuse it causes constent login


    //To Check if the user is logged in...
    if((req.session && req.session.user) || req.user)
    {
      // return res.redirect("/user/home")
      return next();
    }
    else
    {
      return res.redirect("/user/login");
    }
    // res.redirect("/user/login");
  }
  catch (error) {
    console.log("Error in auth",error);
    res.status(500).json({"message":"Internal Server Error"});
  }
};

//To handle Google Auth User Session
userAuth.googleSession = async (req, res, next) => {
  try {
    // Fetch the user from the database by their ID
    const user = await User.findById(req.user.id); // Use findById instead of find
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Store user in session
    req.session.user = user;
   


    // Check if the user is blocked
    if (user.isBlocked) {
      // Instead of redirecting and sending JSON, redirect first
      req.session.message = "Your account Has Been  Blocked"
      return res.redirect("/user/login"); // Redirect to login if blocked
    }

    // Redirect to the home page if the user is not blocked
    res.redirect("/user/home");

  } catch (error) {
    console.log("Error in storing Google user details:", error);
    res.status(500).json({ message: "Internal Server Error" }); // Send error response
  }
}


userAuth.isBlocked = async (req,res,next) => {
  try {
    const user = await User.findById(req.session.user._id);
    if(user && user.isBlocked)
    {
      req.session.destroy((err)=>{
        if(err)
        {
          console.log("error in destroing the sesion",err);
          return next(err);
        }
        req.flash("error","Your Account has been blocked")
        return res.redirect("/user/login");  
        }) 
    }
    // Cart Checking and Allotement
    const userId = req.session.user._id
    
    const cartDetails = await cart.findOne({userId:userId});
    if(!cartDetails)
    {
      if(userId)
        {
          const userCart = new cart({
            userId:userId,
          })
          await userCart.save();
        }
        else
        {
          throw "User Not Logged In";
        }
    }
    next();
  } catch (error) {
    console.log("Error in Checking Blocked...",error);
  }
}


//is Blocked
module.exports = userAuth
