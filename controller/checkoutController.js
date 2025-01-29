const Cart = require("../model/cartSchema");
const Address = require("../model/userAddress");
const checkoutController = {};


checkoutController.loadCheckout = async (req, res) => {
    try {
        const userId = req.session.user._id;
        // console.log("User Id", userId);
        let address = [];
        // Fetch the cart and address data
        const cart = await Cart.findOne({ userId: userId });
        address = await Address.find({ userId: userId });
        // console.log("Addresss",address);

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


module.exports = checkoutController;