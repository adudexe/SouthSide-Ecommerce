const Cart = require("../model/cartSchema");


const addtolocals = async (req, res, next) => {
    // Always set user in locals (whether logged in or not)
    res.locals.user = req.session.user || null;

    // If the user is logged in, get their cart from the database
    if (req.session.user) {
        try {
            // Use `lean()` if you don't need the full Mongoose document overhead
            res.locals.cart = await Cart.findOne({ userId: req.session.user._id }).lean() || {};
        } catch (err) {
            console.error("Error fetching cart:", err);
            res.locals.cart = {}; // Fallback in case of an error
        }
    } else {
        res.locals.cart = {}; // If no user, initialize cart as empty
    }

    // Continue to the next middleware
    next();
}


module.exports = addtolocals;