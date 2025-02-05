const addressController = {};
const Address =  require("../model/userAddress");
const Order = require("../model/orderSchema");
const statusCode = require("../public/javascript/statusCodes");


addressController.loadMyAccount = async (req,res) => {
    try{
        let address = [];
        address =  await Address.find({userId:req.session.user._id});
        const orders = await Order.find({userId:req.session.user._id}).sort({createdOn:-1});

        console.log(orders);
        //To Check Wheather if any address is present for this User
        res.render("./user/accountPage",{address,orders});
        //Render the account page with the userAddress
        
        //{Address:address.address}
    }
    catch(err)
    {
        console.log("Error in loading"+err);
        // res.status(statusCode.INTERNAL_SERVER_ERROR).json({error:"Internal Server Error"});
    }
}

// const Address = require('../models/Address');  // Assuming you have an Address model

addressController.addAddress = async (req, res) => {
    try {
        // Extract address data from the request body
        const { name, street, city, state, postalCode, phone, country, addressNumber, isPrimary } = req.body;

        // Log the data for debugging purposes
        console.log({ name, street, city, state, postalCode, phone, country, addressNumber, isPrimary });

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
            addressNumber:addressNumber,
            isPrimary:isPrimary
        });

        // Save the address to the database
        const addAddress = await address.save();

        // Log the saved address (optional)
        // console.log(addAddress);

        // Send a success response
        res.status(200).json({ success: true, message: 'Address added successfully', address: addAddress });

    } catch (err) {
        // Log any errors that occur during the process
        console.log("Error in adding Address: " + err);

        // Send an error response
        res.status(500).json({ success: false, message: 'Failed to add address. Please try again.' });
    }
};

addressController.getAddressById = async (req,res) => {
    try {
        if(!req.session.user)
        {
            return res.status(404).json({success:false,message:"User Not Authenticated"});
        }
        const userId = req.session.user._id;
        const addressId = req.params.id;
        console.log(userId,addressId);
        const address  = await Address.findOne({userId,_id:addressId});
        return res.status(200).json({success:true,address:address});

    } catch (error) {
        console.log("Error in Getting User Details "+error);
    }
}

addressController.updateAddresById = async (req,res) => {
    try {
        // console.log(req.params);
        const addressId=req.params.id;
        // console.log("params",addressId);
        //if primary then check if the address is already primary.. 
            //retrive all the address based on the userId
        const userAddress = await Address.findOne({userId:req.session.user._id,isPrimary:true});
        // console.log("User Address",userAddress);
        if(userAddress)
        {
          //If any isPrimary is set then change that to false..... 
            const isPrimary = await Address.findOneAndUpdate({userId:req.session.user._id,isPrimary:true},{$set:{isPrimary:false}});
        }
        const updateData = req.body
        // console.log('Update Data',updateData);

        // console.log(req.body);
        const updateAddress = await Address.findOneAndUpdate({_id:addressId},{$set:updateData},{new:true});
        // console.log(updateAddress);
        if(!updateAddress)
        {
            return res.state(statusCode.INTERNAL_SERVER_ERROR).json({success:false,message:"Coudn't update the Database"});
        }
        else
        {
            return res.status(statusCode.OK).json({success:true,message:"Address Updated Sucessfully"})
        }
    } catch (error) {
        console.log("Error in Updating the Address"+error);
    }
}

addressController.deleteAddressById = async (req,res) => {
    try {
        const addressId = req.params.id;
        const deleteAddress = await Address.findByIdAndDelete({_id:addressId});
        if(!deleteAddress)
        {
            return res.status(statusCode.INTERNAL_SERVER_ERROR).json({success:false,message:"Coudn't Delete the Data"});
        }
        else
        {
            return res.status(statusCode.OK).json({success:true,message:"Address Deleted Sucessfully"});
        }
    } catch (error) {
        console.log("Error in Deleting Addresss.....",error);
    }
}








module.exports = addressController;