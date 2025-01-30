const Product = require("../model/productScheme");
const Cart = require("../model/cartSchema");
const productAvailability = {};

productAvailability.quantity = async (req, res, next) => {
    try {
        const userId = req.session.user._id;

        // Populate the cart with product data
        const cartItems = await Cart.findOne({ userId: userId }).populate('items.productId'); // Assuming 'productId' is the reference field in your Cart schema
        
        if (!cartItems || cartItems.items.length === 0) {
            // return res.status(400).send("Cart is empty.");
            console.log("Cart is empty");
        }

        // Check stock for each product in the populated cart
        for (let item of cartItems.items) {
            const product = item.productId;  // The populated product data

            // Find the variant based on variantId from the cart
            const variant = product.variants.find((variant) => {
                return variant._id.toString() === item.variantId.toString();
            });

            if (!variant) {
                return res.status(400).send(`Variant not found for product: ${product.productName}`);
            }

            // If quantity in the cart is greater than the available stock, remove the item
            if (variant.quantity < item.quantity) {
                console.log(`Insufficient stock for ${product.productName} (${variant.size || 'Default Size'}, ${variant.color || 'Default Color'})`);

                // Remove the product from the cart
                await Cart.findOneAndUpdate(
                    { userId: userId },
                    { $pull: { 'items': { productId: product._id } } },  // Removes the item with the matching productId
                    { new: true }  // Return the updated cart
                );

                // Optionally send a message about the item removal
                return res.status(400).send(`The product ${product.productName} has been removed from your cart due to insufficient stock.`);
            }
        }

        next();  // All checks passed, proceed to checkout

    } catch (err) {
        console.log("Error in Product Availability Quantity Checker", err);
        res.status(500).send("Server error.");
    }
};


module.exports = productAvailability;
