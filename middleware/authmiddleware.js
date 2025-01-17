const Cart = require("../model/cartSchema");


//Optimization Needed....
const addtolocals = async (req,res,next) => {
    res.locals.user = req.session.user || null
    // console.log(req.session.user || null)
    if(req.session.user)
    {
        res.locals.cart = await Cart.findOne({userId:req.session.user._id});
    }
    next();
}

module.exports = addtolocals;