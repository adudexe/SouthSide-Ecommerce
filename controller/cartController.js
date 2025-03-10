const products = require("../model/productScheme");
const coupon = require("../model/couponSchema");
const cart = require("../model/cartSchema");
const statusCode = require("../public/javascript/statusCodes");
const cartController = {};

cartController.loadCartPage = async (req, res) => {
    try {
        const userId = req.session.user._id;
        console.log("User id", userId);
        const cartDetails = await cart.findOne({ userId: userId }).populate('items.productId');
        const productDetails = await products.find();
        console.log("Applied Coupon", cartDetails);
        //If coupon is applied then remove the coupon 
        if (cartDetails && cartDetails.couponApplied) {
            cartDetails.couponApplied = null;
        }
        if (!cartDetails.couponApplied) {
            console.log("coupon Nullified")
        }
        // Calculate total price of cart items
        const totalPrice = cartDetails.items.reduce((total, element) => {
            const product = element.productId; // Get the product details
            const variant = product.variants.find(variant => variant._id.toString() === element.variantId.toString()); // Find the selected variant

            // Add the price of the variant * quantity to the total
            return total + (variant.salePrice * element.quantity);
        }, 0); // Initial value is 0

        console.log("TotalPrice is ", totalPrice); // Logs total price

        //adding the total price to session
        req.session.totalPrice = Math.floor(totalPrice);

        // console.log(cartDetails);
        res.render("./user/cartPage", { cartItems: cartDetails, products: productDetails, totalPrice: totalPrice });
    } catch (error) {
        console.log("Error in Loading Cart", error);
    }
}



cartController.cartQuantityIncrementer = async (req, res) => {
    try {
        // To increase the quantity in the cart...
        const { newQuantity, productId, variantId } = req.body

        // console.log({newQuantity,productId,variantId})

        const userId = req.session.user._id;

        //cart details from cart Database...
        const cartDetails = await cart.findOne({ userId: userId }).populate('items.productId');
        console.log("Cart Details - ", cartDetails);

        //product details from product database...
        const productDetails = await products.findOne({ _id: productId });
        console.log("Product Details - ", productDetails);

        const productVariantDetails = productDetails.variants.find((item) => {
            return item._id.toString() == variantId
        })

        console.log("Product Variant Details- ", productVariantDetails);

        //To check if the user has exceeded the maximum quantity..
        if (newQuantity > 5) {
            return res.status(statusCode.FORBIDDEN).json({ success: false, message: "Max Quantity Reached.." });
        }
        if (productVariantDetails.quantity < newQuantity) {
            return res.status(statusCode.FORBIDDEN).json({ success: false, message: "Not Enought product Available..." });
        }
        //To update the cart quantity with new quantity....
        const updatedCart = await cart.findOneAndUpdate({ userId: userId, "items.variantId": variantId }, { $set: { "items.$.quantity": newQuantity } }, { new: true }).populate('items.productId');

        console.log("Updated Cart - ", updatedCart);


        console.log("Applied Coupon", cartDetails);
        //If coupon is applied then remove the coupon 
        if (cartDetails && cartDetails.couponApplied) {
            cartDetails.couponApplied = null;
        }
        if (!cartDetails.couponApplied) {
            console.log("coupon Nullified")
        }
        // Calculate total price of cart items
        const totalPrice = updatedCart.items.reduce((total, element) => {
            const product = element.productId; // Get the product details
            const variant = product.variants.find(variant => variant._id.toString() === element.variantId.toString()); // Find the selected variant

            // Add the price of the variant * quantity to the total
            return total + (variant.salePrice * element.quantity);
        }, 0); // Initial value is 0
        let val = 0
        const discount = cartDetails.items.reduce((dis, elm) => {
            val += (elm.productId.productOffer)
            return dis + val
        }, 0)

        // console.log("Total Discount is", discount);
        // console.log("TotalPrice is ", totalPrice);

        if (updatedCart) {
            return res.status(statusCode.OK).json({ success: true, totalPrice, discount })
        }
        else {
            return res.status(statusCode.OK).json({ success: false, message: "Internal Server" });
        }
    }
    catch (err) {
        console.log("Error in incramenting the Product", err);
        res.status(statusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: "Internal Server Error.." });
    }
}

cartController.cartQuantityDecrementer = async (req, res) => {
    try {
        // To increase the quantity in the cart...
        const { newQuantity, productId, variantId } = req.body

        console.log({ newQuantity, productId, variantId })

        const userId = req.session.user._id;

        //cart details from cart Database...
        const cartDetails = await cart.findOne({ userId: userId });
        console.log("Cart Details - ", cartDetails);

        //product details from product database...
        const productDetails = await products.findOne({ _id: productId });
        console.log("Product Details - ", productDetails);

        const productVariantDetails = productDetails.variants.find((item) => {
            return item._id.toString() == variantId
        })

        console.log("Product Variant Details- ", productVariantDetails);

        //To check if the user has exceeded the maximum quantity..
        if (newQuantity < 1) {
            return res.status(statusCode.FORBIDDEN).json({ success: false, message: "Minimum possible quantity...." });
        }
        // if(productVariantDetails.quantity < newQuantity)
        // {
        //     return res.status(statusCode.FORBIDDEN).json({success:false,message:"Not Enought product Available..."});
        // }
        //To update the cart quantity with new quantity....
        const updatedCart = await cart.findOneAndUpdate({ userId: userId, "items.variantId": variantId }, { $set: { "items.$.quantity": newQuantity } }, { new: true }).populate('items.productId');
        // const updatedCart = await cart.findOneAndUpdate({ userId: userId, "items.variantId": variantId }, { $set: { "items.$.quantity": newQuantity } }, { new: true })
        console.log("Updated Cart - ", updatedCart);

        const totalPrice = updatedCart.items.reduce((total, element) => {
            const product = element.productId; // Get the product details
            const variant = product.variants.find(variant => variant._id.toString() === element.variantId.toString()); // Find the selected variant

            // Add the price of the variant * quantity to the total
            return total + (variant.salePrice * element.quantity);
        }, 0); // Initial value is 0
        let val = 0
        const discount = cartDetails.items.reduce((dis, elm) => {
            val += (elm.productId.productOffer)
            return dis + val
        }, 0)

        if (updatedCart) {
            return res.status(statusCode.OK).json({ success: true, totalPrice, discount })
        }
        else {
            return res.status(statusCode.OK).json({ success: false, message: "Internal Server" });
        }
    }
    catch (error) {
        console.log("Error in Decrementing Product", error)
    }
}


cartController.addProductToCart = async (req, res) => {
    try {
        const userId = req.session.user._id;
        const { productId, variantId, quantity } = req.body;

        console.log({ productId, variantId, quantity });

        //To get the cart Details
        const cartProductsDetails = await cart.findOne({ userId: userId }); //Cart database
        // console.log("Cart product Details",cartProductsDetails)
        const productDetails = await products.findById(productId);

        const productVariantDetails = (productDetails.variants).find((item) => {
            // console.log("Variants ",item);
            return item._id.toString() === variantId ? item : false;
        })

        //Checks if a product exists...
        if (!productVariantDetails) {
            return res.status(statusCode.NOT_FOUND).json({ success: false, message: "Product Not Found...!" });
        }
        //Check if the stock is available
        if (productVariantDetails.quantity <= 0) {
            return res.status(statusCode.BAD_REQUEST).json({ success: false, message: "Product Currently Out of Stock..." });
        }
        // console.log("Before Product Validation..-",quantity)
        //If the user is trying to add more than the available quantity.....
        if (quantity > productVariantDetails.quantity) {
            return res.status(statusCode.BAD_REQUEST).json({ success: false, message: "Product Quantity is limited....." });
        }

        // console.log("Before Cart Variants-",Number(quantity));
        if ((cartProductsDetails.items).length) {
            //To get the details of the specific Product Variant  from the cart
            const cartProductVariant = (cartProductsDetails.items).find((item) => {
                // console.log("Cart Variant",item);
                // console.log(item.variantId.toString() == variantId);
                return item.variantId.toString() == variantId;
            })
            // console.log("Cart Product Variant -",cartProductVariant);
            if (!cartProductVariant) {
                //If the producti variant is not present in the cart then the cart should need to be updated with the new product....
                cartProductsDetails.items.push({
                    productId: productId,
                    variantId: variantId,
                    quantity: Number(quantity),
                    // price:product.price,
                    // totalPrice:product.price*quantity
                });
            }
            else {
                let newQuantity = cartProductVariant.quantity + Number(quantity);
                //To Limit the user to only buy 5 products
                console.log("newQuantity - ", newQuantity);
                // console.log("Product Quantity - ",productVariantDetails.quantity);
                if (newQuantity > 5) {
                    // return console.log("Quentity Exceeded...");
                    return res.status(statusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: "Product max Limit Reached.." });
                }
                if (newQuantity > productVariantDetails.quantity) {
                    return res.status(statusCode.BAD_REQUEST).json({ success: false, message: "Product Quantity is limited....." });
                }

                cartProductVariant.quantity = newQuantity;
            }

        }
        else {
            //If the producti variant is not present in the cart then the cart should need to be updated with the new product....
            cartProductsDetails.items.push({
                productId: productId,
                variantId: variantId,
                quantity: Number(quantity),
                // price:product.price,
                // totalPrice:product.price*quantity
            });
        }
        const updatedCartDetails = await cartProductsDetails.save();
        console.log("Updated Cart Details - ", updatedCartDetails);
        if (!updatedCartDetails) {
            return res.status(statusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: "Error updating the cart..!" });
        }
        return res.status(statusCode.OK).json({ success: true, message: "Product Added Succesfully." });




        // console.log("Cart Variant Details -",cartProductVariant);

        // //To get the product Details
        // const productDetails =  await products.findOne({_id:productId}); //Product details from product Database 
        // //To get the exact variant from the product database



        // // console.log("ProductVariatDetails",productVariantDetails);


        // if(!cartProductVariant)
        // {
        //     //If the producti variant is not present in the cart then the cart should need to be updated with the new product....
        //     cartProductsDetails.items.push({
        //         productId:productId,
        //         variantId:variantId,
        //         quantity:Number(quantity),
        //         // price:product.price,
        //         // totalPrice:product.price*quantity
        //     });
        // }
        // else
        // {
        //     //If the product Variant already Exist's in the cart then the quantity should only need to be updated
        //     let newQuantity = cartProductVariant.quantity + Number(quantity);
        //     //To Limit the user to only buy 5 products
        //     // console.log("newQuantity - ",newQuantity);
        //     // console.log("Product Quantity - ",productVariantDetails.quantity);
        //     if(newQuantity > 5)
        //     {
        //         // return console.log("Quentity Exceeded...");
        //         return res.status(statusCode.INTERNAL_SERVER_ERROR).json({success:false,message:"Product max Limit Reached.."});
        //     }
        //     if(newQuantity > productVariantDetails.quantity)
        //     {
        //         return res.status(statusCode.BAD_REQUEST).json({success:false,message:"Product Quantity is limited....."});
        //     }

        //     cartProductVariant.quantity = newQuantity;
        // }
        // const updatedCartDetails  = await cartProductsDetails.save();
        // console.log("Updated Cart Details - ",updatedCartDetails);
        // if(!updatedCartDetails)
        // {
        //     return res.status(statusCode.INTERNAL_SERVER_ERROR).json({success:false,message:"Error updating the cart..!"});
        // }
        // return res.status(statusCode.OK).json({success:true,message:"Product Added Succesfully."});

    }
    catch (error) {
        console.log("Error in adding product to cart", error);
    }
}


cartController.deleteProductFromCart = async (req, res) => {
    try {
        //Getting product id and variant id from front end..
        const { productId, variantId } = req.body

        //Getting user id from session...
        const userId = req.session.user._id;

        const cartDetails = await cart.findOne({ userId: userId });

        // console.log("Cart Details -",cartDetails);

        const productDetails = await products.findOne({ _id: productId });

        const productVariantDetails = productDetails.variants.find(item => item._id.toString() === variantId);

        console.log("Product Variant Details - ", productVariantDetails);

        if (!productVariantDetails) {
            return res.status(statusCode.BAD_REQUEST).json({ success: false, message: "Invalid Product.." });
        }

        const updatedCart = await cart.updateOne({ userId: userId, "items.variantId": variantId }, { $pull: { items: { variantId: variantId } } });

        if (updatedCart) {
            return res.status(statusCode.OK).json({ success: true, message: "Product Deleted...", updatedCart });
        }
        else {
            return res.status(statusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: "Internal Sever Error" });
        }

    }
    catch (err) {
        console.log("Error in deleting products from cart", err);
    }
}

//When emptying the cart also empty the appliedcoupon also...

cartController.applyCoupon = async (req, res) => {
    try {
        console.log("We are inside apply coupon");
        //When applying the coupon the total price should need to be reduced...
        const couponId = req.params.id;
        const userId = req.session.user._id;
        const totalPrice = req.session.totalPrice;

        const couponDetails = await coupon.findById(couponId);
        console.log("Coupon Details", couponDetails);
        const couponAmount = couponDetails.discount;
        const couponType = couponDetails.type;
        let discountPrice;
        console.log(totalPrice, "<", couponDetails.minmumAmount, (totalPrice < couponDetails.minmumAmount))

        if (totalPrice < couponDetails.minmumAmount) {
            return res.status(403).json({ success: false, message: "Please Add product till minimum amount is reached..." });
        }


        // console.log("Coupon Detail",couponDetails);
        // console.log("Total Price from Apply Coupon",totalPrice);


        //Check if Coupon is applied on the product...
        const existingCart = await cart.findOne({ userId: userId }).populate('items.productId');

        // console.log("Cart Details",existingCart);

        if (couponType == "fixed") {
            // Calculate total price of cart items
            discountPrice = existingCart.items.reduce((total, element) => {
                // console.log(element)
                const product = element.productId; // Get the product details
                const variant = product.variants.find(variant => variant._id.toString() === element.variantId.toString()); // Find the selected variant

                element.price = variant.salePrice - ((variant.salePrice / totalPrice) * couponDetails.discount);
                // Add the price of the variant * quantity to the total
                return total + (element.price * element.quantity);
            }, 0); // Initial value is 0
        }
        else {
            discountPrice = existingCart.items.reduce((total, element) => {
                // console.log(element)
                const product = element.productId; // Get the product details
                const variant = product.variants.find(variant => variant._id.toString() === element.variantId.toString()); // Find the selected variant

                element.price = variant.salePrice - ((variant.salePrice) * (couponDetails.discount / 100));

                // Add the price of the variant * quantity to the total
                return total + (element.price * element.quantity);
            }, 0); // Initial value is 0

        }

        if (existingCart && existingCart.couponApplied) {
            const updateCart = await cart.findOneAndUpdate(
                { userId: userId },
                { $set: { couponApplied: null } },
                { new: true });
        }
        // console.log("Update Cart")

        const applyCoupon = await cart.findOneAndUpdate(
            { userId: userId },
            { $set: { couponApplied: couponId } }
        )
        await existingCart.save();

        req.session.totalPrice = Math.floor(discountPrice);
        console.log("totalprice changed")

        // console.log("Discount Price ",discountPrice);
        // console.log("Existing Cart Price",existingCart);


        if (!applyCoupon) {
            //After applying the coupon then then price should need to be reduced;

            return res.status(500).json({ success: true, message: "Failed to Apply Coupon" });
        }
        return res.status(200).json({ success: true, message: "Coupon Applied Successfully...", newPrice: discountPrice, oldPrice: totalPrice, couponDetails });

    }
    catch (err) {
        console.log("Error in Applying Coupon", err);
    }
}


cartController.removeCoupon = async (req, res) => {
    try {
        console.log("We are inside Remove Coupon")
        req.session.totalPrice = 0
        const userId = req.session.user._id;
        const cartDetailsUpdate = await cart.findOneAndUpdate(
            { userId: userId },
            { $set: { couponApplied: null } },
            { new: true }
        );

        console.log("Update Cart Details", cartDetailsUpdate);

        const cartDetails = await cart.findOne({ userId: userId }).populate('items.productId');
        const totalPrice = cartDetails.items.reduce((total, element) => {
            const product = element.productId; // Get the product details
            const variant = product.variants.find(variant => variant._id.toString() === element.variantId.toString()); // Find the selected variant

            // Add the price of the variant * quantity to the total
            return total + (variant.salePrice * element.quantity);
        }, 0); // Initial value is 0
        console.log("Total Price", totalPrice);
        console.log("Session Total before", req.session.totalPrice)
        req.session.totalPrice = Math.floor(totalPrice);
        console.log("Session Total After", req.session.totalPrice)
        if (!cartDetailsUpdate) {
            return res.status(400).json({ success: false, message: "Failed to remove the coupon" });
        }
        return res.status(200).json({ success: true, message: "Coupon Successfully Removed", totalPrice });
    }
    catch (err) {
        console.log("Error in remove Coupon", err);
    }
}


module.exports = cartController;



