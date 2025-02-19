
const Orders = require("../model/orderSchema");
const Wallet = require("../model/walletSchema");
const Products = require("../model/productScheme");
const orderController = {};

orderController.loadOrderDetails = async (req,res) => {
    try{
        const userId = req.session.user._id
        const orderId = req.params.id;
        // console.log(orderId)
        const Order = await Orders.find({userId:userId,_id:orderId});
        res.render("./user/orderDetails", {
            Order,
            currentPage: 'orderDetails'
        });
    }
    catch(err)
    {
        console.log("Error in Loading Order Details Page",err);
    }
}

orderController.cancelOrder = async (req, res) => {
    try {
        const { reason } = req.body;
        const orderId = req.params.id;
        const userId = req.session.user._id;
        let refundToWallet = null;
        let wallet = null;
        

        // Find the order and wallet for the user
        const orderDetails = await Orders.findOne({ userId: userId, "orderItems._id": orderId });
        wallet = await Wallet.findOne({ userId: userId });

        // console.log("Order Details",orderDetails);

        // console.log("Variant Id",orderDetails.orderItems[0].variantId);

        // //Product Detials
        // const prdoucts = await Products.find({"variants._id":orderDetails.orderItems[0].variantId});
        // console.log("Product Details",prdoucts);

        // // if()

        console.log("Order Details",orderDetails);
        console.log("Order Product Details",orderDetails.orderItems);

        // Create wallet if it doesn't exist
        if (!wallet) {
            wallet = await Wallet.create({ userId: userId, totalAmount: 0, transactions: [] });
        }

        // console.log("Wallet before refund:", wallet);
        
        //stock  < 5 then refund should price/2
        
        // Update the order's product status to 'Cancelled'
        const cancelOrder = await Orders.findOneAndUpdate(
            {
                userId: userId, // Ensure this is the correct user
                "orderItems._id": orderId // Find the correct product in the orderItems array
            },
            {
                $set: {
                    "orderItems.$.cancelReason": reason,
                    "orderItems.$.status": "Cancelled" // Update the product's status to 'Cancelled'
                }
            },
            { new: true } // Return the updated order document
        );

        // Find the cancelled item from the order
        const cancelledItem = cancelOrder.orderItems.find(item => item.status === "Cancelled");
        if (!cancelledItem) {
            return res.status(400).json({ message: "Cancelled item not found" });
        }

        let totalAmount = Number(wallet.totalAmount || 0) + Number(cancelledItem.price);

        console.log("Refund amount:", cancelledItem.price);
        console.log("New total wallet amount:", totalAmount);

        // If the payment method is 'online', add refund to wallet
        if (orderDetails.paymentMethod === "online" || orderDetails.paymentMethod === "wallet") {
            refundToWallet = await Wallet.findOneAndUpdate(
                { userId: userId },
                {
                    $push: {
                        transactions: {
                            transactionType: "credit",  // Refund transaction
                            amount: cancelledItem.price,
                            date: Date.now() // Set the transaction date
                        }
                    },
                    $set: {
                        totalAmount: totalAmount // Update the total amount in the wallet
                    }
                },
                { new: true }
            );
        }

        // console.log("Refund DB:", refundToWallet);

        //Find which product is cancelled 
        const productVariant =  cancelOrder.orderItems.find(item => item.status === "Cancelled");


        const updateProduct = await Products.findOneAndUpdate(
            { "variants._id": productVariant.variantId },
            { $inc: { "variants.$.quantity": productVariant.quantity } }
        );
        
        //add the order quantity with the product quantity...

        console.log("Update Product",updateProduct);

        if (!cancelOrder) {
            return res.status(404).json({ message: "Order or product not found" });
        }

        // Return the updated order if everything is successful
        res.status(200).json({ message: "Product status updated to 'Cancelled'", order: cancelOrder });
    } catch (err) {
        console.log("Error in canceling the product:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};


orderController.orderSuccess = async (req,res) =>{
    try
    {
        let images = [];
        console.log("We are in order details...");
        const userId = req.session.user._id;
        const orderDetails = await Orders.findOne({ 
            userId: userId 
        }).sort({ 
            createdOn: -1
        });
        console.log("Order Details")
        console.log(orderDetails);
        console.log("Product Details");
        orderDetails.orderItems.forEach(element => {
            
        });
        console.log("Images",images);
        res.render("./user/orderSuccess",{orderDetails});
    }
    catch(err)
    {
        console.log("Error in Order Success Page",err);
    }
}

module.exports = orderController;