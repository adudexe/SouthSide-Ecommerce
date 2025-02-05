const Orders = require("../model/orderSchema");
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
        const orderId = req.params.id;
        const userId = req.session.user._id;

        // Update the order's product status to 'Cancelled' based on the orderId, userId, and product ID
        const cancelOrder = await Orders.findOneAndUpdate(
            {
                userId: userId, // Make sure this is the correct user
                "orderItems._id": orderId // Find the correct product in the orderItems array
            },
            {
                $set: {
                    "orderItems.$.status": "Cancelled" // Update the product's status to 'Cancelled'
                }
            },
            { new: true } // Optionally return the updated order document
        );
        console.log(cancelOrder);
        if (!cancelOrder) {
            return res.status(404).json({ message: "Order or product not found" });
        }

        // If successful, return the updated order
        res.status(200).json({ message: "Product status updated to 'Cancelled'", order: cancelOrder });
    } catch (err) {
        console.log("Error in canceling the product:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};


module.exports = orderController;