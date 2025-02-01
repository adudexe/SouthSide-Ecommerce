const Product = require("../model/productScheme");
const Cart = require("../model/cartSchema");
const productAvailability = {};

productAvailability.quantity = async (req, res, next) => {
    try {
        const userId = req.session.user._id;

        // Populate the cart with product data
        const cartItems = await Cart.findOne({ userId: userId }).populate('items.productId'); 

        if (!cartItems || cartItems.items.length === 0) {
            
            console.log("Cart is empty");
        }

        
        for (let item of cartItems.items) {
            const product = item.productId;  

            
            const variant = product.variants.find((variant) => {
                return variant._id.toString() === item.variantId.toString();
            });

            if (!variant) {
                return res.status(400).json({success:true,message:`Variant not found for product: ${product.productName}`});
            }

            
            if (variant.quantity < item.quantity) {
                console.log(`Insufficient stock for ${product.productName} (${variant.size || 'Default Size'}, ${variant.color || 'Default Color'})`);

                await Cart.findOneAndUpdate(
                    { userId: userId },
                    { $pull: { 'items': { variantId: variant._id } } },  
                    { new: true }  
                );
                return res.status(400).json({success:false,message:`The product ${product.productName} has been removed from your cart due to insufficient stock.`});
            }
        }

        next();  // All checks passed, proceed to checkout

    } catch (err) {
        console.log("Error in Product Availability Quantity Checker", err);
        res.status(500).send("Server error.");
    }
};


module.exports = productAvailability;
