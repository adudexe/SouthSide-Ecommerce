const user = require("../model/userModel");



//This should need to be commented for admin to work as normal
// const requireAuth = async (req,res,next) =>{
//   req.session.admin = await user.findOne({isAdmin:true})
//   next();
// }


//This should need to be un commented....
const requireAuth = (req, res, next) => {
    if (req.session.admin) {
        next();
      }
     else 
     {
      return res.redirect("/admin/login");
     }
  };
  
  module.exports = {
    requireAuth,
  };