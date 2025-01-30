const Product = require("../model/productScheme");
const Cart = require("../model/cartSchema");
const productAvailability = {};

productAvailability.quantity = async (req, res, next) => {
    try {
        const userId = req.session.user._id;

        // Populate the cart with product data
        const cartItems = await Cart.findOne({ userId: userId }).populate('items.productId'); // Assuming 'productId' is the reference field in your Cart schema
        
        if (!cartItems || cartItems.length === 0) {
            return res.status(400).send("Cart is empty.");
        }

        // console.log("Cart Items",cartItems);

        // Check stock for each product in the populated cart
        for (let item of (cartItems.items)) {
            const product = item.productId;  // The populated product data
            // console.log(product)
            // Find the variant based on variantId from cart
            const variant = product.variants.find((variant) => {
                return variant._id.toString() === item.variantId.toString();
            });

            if (!variant) {
                return res.status(400).send(`Variant not found for product: ${product.productName}`);
            }
            console.log(variant.quantity ,"<",item.quantity,variant.quantity < item.quantity)
            // Check if the quantity in the cart exceeds the available stock of the variant
            if (variant.quantity < item.quantity) {
                return res.status(400).send(`Insufficient stock for ${product.productName} (${variant.size || 'Default Size'}, ${variant.color || ''}`)
            }
        }

        next();  // All checks passed, proceed to checkout

    } catch (err) {
        console.log("Error in Product Availability Quantity Checker", err);
        res.status(500).send("Server error.");
    }
};

module.exports = productAvailability;
