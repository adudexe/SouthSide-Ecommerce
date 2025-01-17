const Cart = require("../model/cartSchema");

const cartQuantity = async (req,res,next) => {
    if(req.session.user)
    {
        res.locals.cart = await Cart.findOne({userId:req.session.user._id});
    }
    next();
}

module.exports = cartQuantity
