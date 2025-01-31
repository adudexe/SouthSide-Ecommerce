const Orders = require("../../model/orderSchema");
const orderController = {};

orderController.loadManagementPage = async (req,res) => {
    try
    {
        const orders = await Orders.find().populate("userId");
        console.log("Order's",orders);
        console.log("User's");
        res.render("./admin/orderManagement",{orders});
    }
    catch(err)
    {
        console.log("Error in loading admin order ",err);
    }
}

orderController.loadeOrderDetails = async (req,res) => {
    try
    {
        const id = req.params.id;
        const orderDetails = await Orders.findById(id).populate("userId");
        // console.log(orderDetails);
        res.render("./admin/orderDetails",{orderDetails})

    }
    catch(err)
    {
        console.log("Error in loading order Details page..",err);        
    }
} 

orderController.changeBulkStatus = async (req,res) => {
    try{
        //order id should be sent then all the product's in the id will changed to that.
        console.log("We are in change bulk controller..");
        console.log(req.body);
        const {orderId,status} = req.body.updates;
        
        console.log("OrderId",orderId);
        const order = await Orders.findOne({_id:orderId});
        order.orderItems.forEach((item)=>{
            console.log("Order Items",item);
            item.status = status; 
        })
        const updatedOrder = await order.save();
        // console.log("Updated Order Details",updatedOrder);
        // console.log("Orders :",order);
        if(!updatedOrder)
        {
            return res.status(500).json({success:false,message:"Internal Server Error"});
        }
        return res.status(200).json({success:true,message:"Status Succesfully Changed.."});
    }
    catch(err)
    {
        console.log("Error in changing the status of the Order",err);
    }
}

orderController.changeSingleStatus = async (req,res) => {
    try{
        //if single productstatus is changed then the product id along with order id is sent
        const {orderId,status,itemId} = req.body;
        console.log({orderId,status,itemId});
        
        const order = await Orders.findOne({_id:orderId});
        const product = order.orderItems.find((item=>{
            return (item._id).toString() == itemId
        }))
        
        console.log("Prduct",product);
        console.log("Order",order);

        product.status = status;
        const updateProduct = await order.save();
        console.log("UpdateProduct",updateProduct);

        if(!updateProduct)
        {
            return res.status(500).json({success:false,message:"Internal Server.."});
        }
        return res.status(200).json({success:true,message:"Data Succesfully Updated"});
    }
    catch(err)
    {
        console.log("Error in changing the status of the Order",err);
    }
}



module.exports = orderController;