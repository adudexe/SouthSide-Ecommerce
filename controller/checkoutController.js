const Cart = require("../model/cartSchema");
const Product = require("../model/productScheme");
const Address = require("../model/userAddress");
const Order = require("../model/orderSchema");
const checkoutController = {};


checkoutController.loadCheckout = async (req, res) => {
    try {
        const userId = req.session.user._id;
        // console.log("User Id", userId);
        let address = [];
        let variants = [];
        let quantity = [];
        let shipping = 0;
        //find the product details and varients and send it to the front end...
        const products = await Product.find



        // Fetch the cart and address data
        const cart = await Cart.findOne({ userId: userId }).populate('items.productId');
        // console.log("Cart Items",cart);

        

        (cart.items).find((item)=>{
            // console.log("Items",item);
            if(!(item.productId.isDeleted) && !(item.productId.isBlocked) )
            {
                return (item.productId.variants).find((variant)=>{
                    if(variant._id.toString() === (item.variantId).toString())
                    {   
                        // console.log("item",item);
                        // console.log("item quantity",item.quantity);
                        // total = total*item.quantity
                        variants.push(variant);
                        quantity.push(item.quantity);
                    }
                })
            }
            // console.log("Variant Id",item.variantId);
        })
        // console.log("Cart Product Variants",variants);
        address = await Address.find({ userId: userId });

        let total = variants.reduce((acc, product,i) => {
            return acc + (product.salePrice * quantity[i]);
        }, 0);        

        console.log("Total",total);

        // console.log(total);
        // console.log("Addresss",address);

        // console.log("Cart Details",cart);

        // Total Price =

        if (!cart) {
            console.log("Cart not found for user", userId);
            return res.redirect('/cart'); // Optionally redirect to the cart page if no cart is found
        }

        if (!address) {
            console.log("No address found for user", userId);
        }

        // Render the checkout page with cart and address data
        res.render("./user/checkout", {
            cart,
            total,
            shipping,
            variants,
            userAddress: address || null, // Pass the address (or null if not found) as 'userAddress' for clarity
        });
    } catch (err) {
        console.log("Error in loading the Checkout Page", err);
        res.status(500).send("An error occurred while loading the checkout page.");
    }
};


checkoutController.addNewAddress = async (req,res) => {
    try {
            // Extract address data from the request body
            const { name, street, city, state, postalCode, phone, country, addressNumber, isPrimary } = req.body;
    
            // Log the data for debugging purposes
            console.log({ name, street, city, state, postalCode, phone, country, isPrimary });
    
            //To keep a single primary address 
            if(isPrimary)
            {
                const primaryUpdate = await Address.findOneAndUpdate({userId:req.session.user._id , isPrimary:true},{$set:{isPrimary:false}});
                console.log("Checking is Primary from addNewAddress in Checkout",primaryUpdate);
            }

            // Create a new address document
            const address = new Address({
                userId:req.session.user._id,
                name:name,
                street:street,
                city:city,
                state:state,
                postalCode:postalCode,
                phone:phone,
                country:country, // Added the country field here
                addressNumber:Math.floor(Math.random()*10),
                isPrimary:isPrimary
            });
    
            // Save the address to the database
            const addAddress = await address.save();
    
            // Log the saved address (optional)
            // console.log(addAddress);
    
            // Send a success response
            res.status(200).json({ success: true, message: 'Address added successfully', address: addAddress });
        }
        catch(err)
        {
            console.log("Error in adding address from checkout page.",err);
            res.status(500).send("An error occured while adding address from the checkoug page...");
        }
}

checkoutController.setAddress = async (req,res) => {
    try
    {
        const addressId = req.params.id;
        const userId = req.session.user._id;
        console.log("Address Id",addressId);

        //Get the address which is primary and set it to false and set the new id as primary 
        //Get the addres which is primary 
        const primaryAddress = await Address.findOneAndUpdate({userId:userId,isPrimary:true},{$set:{isPrimary:false}},{new:true});
        if(!primaryAddress)
        {
            return res.status(500).json({success:false,message:"Error in setting the address to primary."});
        }
        const newPrimaryAddress = await Address.findByIdAndUpdate(addressId,{$set:{isPrimary:true}});

        if(!newPrimaryAddress)
        {
            return res.status(500).json({success:false,message:"Error in setting the address to primary."});
        }

        return res.status(200).json({success:true,message:"New Address has been set"});
    }
    catch(err)
    {
        console.log("Error in Setting address",err);
        res.status(500).send("Error in setting address..");
    }
}

checkoutController.updateAddress = async (req,res) => {
    try
    {
        const updateAddress = req.body;
        const addressId = req.params.id
        const userId = req.session.user._id;
        // console.log(updateAddress);
        console.log(addressId);
        //Check if primary address exist
        if(updateAddress.isPrimary)
        {
            const isPrimary = await Address.findOneAndUpdate({userId:userId , isPrimary:true},{$set:{isPrimary:false}});        
            console.log("isPrimary",isPrimary);
        }
        
        const UpdatedAddress = await Address.findByIdAndUpdate(addressId,{$set:updateAddress},{new:true});
        console.log("Updated Address",UpdatedAddress);
        if(!UpdatedAddress)
        {
            return res.status(500).json({succes:false,message:"Internal Server Error"});
        }

        return res.status(200).json({succes:true,message:"Address Updated Successfully..."});
        
        
    }
    catch(err)
    {
        console.log("Error in Updating Addresss",err);
        return res.status(500).send("Error in Updaing Addresss");
    }
}



checkoutController.placeOrder = async (req, res) => {
    try {
        const { OrderType } = req.body; // Get the Payment Method from the front end..
        let product = null;
        let variant = null;

        // Get the primary address for the user
        const userId = req.session.user._id;
        const primaryAddress = await Address.findOne({ userId: userId, isPrimary: true });
        console.log("Primary Address", primaryAddress);

        if (!primaryAddress) {
            return res.status(404).json({ success: false, message: "Address Not Found.." });
        }

        // Get the user Cart Details
        const cartItems = await Cart.findOne({ userId: userId }).populate("items.productId");
        // console.log("Cart Items", cartItems.items);

        if (!cartItems) {
            return res.status(404).json({ success: false, message: "User Cart Not Found..." });
        }

        // Prepare order items and total calculation
        const orderItems = [];
        let totalAmount = 0;

        for (let item of cartItems.items) {
            product = item.productId; // The populated product data

            // Find the variant based on variantId from the cart
            variant = product.variants.find((variant) => variant._id.toString() === item.variantId.toString());

            // Add item details to orderItems
            if (variant) {
                orderItems.push({
                    product: {
                        productName: product.productName,
                        description: product.description,
                        category: product.category,
                        productOffer: product.productOffer,
                        variants: [variant],
                        productImages: product.productImages
                    },
                    quantity: item.quantity,
                    price: variant.salePrice * item.quantity
                });

                // Add to total price
                totalAmount += variant.salePrice * item.quantity;

                // Decrement the quantity of the variant in the product
                if (variant.quantity >= item.quantity) {
                    variant.quantity -= item.quantity;  // Decrement the stock
                } else {
                    // If insufficient stock, throw an error
                    return res.status(400).json({ success: false, message: `Insufficient stock for ${product.productName}` });
                }
            }
        }

        // Apply any discounts (if needed)
        let discount = cartItems.discount || 0;
        let finalAmount = totalAmount - discount;

        // Create new order document
        const newOrder = new Order({
            userId: userId,
            orderItems: orderItems,
            totalPrice: totalAmount,
            discount: discount,
            finalAmount: finalAmount,
            addres: primaryAddress,  // Use the primary address for shipping
            invoiceDate: new Date(),
            status: 'Pending', // Default status when the order is created
            couponApplied: cartItems.couponApplied || false
        });

        // Save the order to the database
        const savedOrder = await newOrder.save();

        // Save the updated product stock after the order
        await product.save();  // Save the product with the updated variant quantity

        // Optionally clear the cart after the order is placed
        await Cart.findOneAndUpdate({ userId: userId }, { $set: { items: [] } });

        // Return the saved order as a response
        res.status(200).json({ success: true, message: 'Order placed successfully', order: savedOrder });

    } catch (err) {
        console.log("Error in Placing Order", err);
        res.status(500).json({ success: false, message: "An error occurred while placing the order" });
    }
};




module.exports = checkoutController;