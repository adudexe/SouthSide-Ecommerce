const Orders = require("../../model/orderSchema");
const Wallet = require("../../model/walletSchema");
const Products = require("../../model/productScheme");
const orderController = {};

orderController.loadManagementPage = async (req,res) => {
    try
    {
        const orders = await Orders.find().populate("userId").sort({createdOn:-1});
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
        const order = await Orders.findOne({_id:orderId});
        const userId = order.userId;
        let updatedOrder; 
        
        if(status == "Refunded")
        {
            let amount = null;
            console.log("Product Refunded");
            const wallet = await Wallet.findOne({userId:userId})
            console.log("Order Price",order.totalPrice);
            console.log("Wallet Details",wallet);

            amount = wallet.totalAmount + order.totalPrice
            
            order.orderItems.forEach(async (item)=>{
                console.log("Order Items",item);
                item.status = status;
                const products = await Products.findOne({_id:item.productId}) 
                const variant = products.variants.find(elm => elm._id.toString() == item.variantId.toString())
                console.log("Variants",variant);

                variant.quantity += item.quantity
                await products.save()
            })

            

            console.log("Total Amount",amount)

            const refundToWallet = await Wallet.findOneAndUpdate(
                { userId: userId },
                {
                    $push: {
                        transactions: {
                            transactionType: "credit",  // Refund transaction
                            amount: order.totalPrice,
                            date: Date.now() // Set the transaction date
                        }
                    },
                    $set: {
                        totalAmount: amount // Update the total amount in the wallet
                    }
                },
                { new: true }
            );

            //Chnage the status of the product's
            


            console.log("Updated Wallet",refundToWallet);
            

            updatedOrder = await order.save();
        }
        else
        {
            console.log("OrderId",orderId);
            // const order = await Orders.findOne({_id:orderId});
            order.orderItems.forEach((item)=>{
                console.log("Order Items",item);
                item.status = status; 
            })
            updatedOrder = await order.save();
            // console.log("Updated Order Details",updatedOrder);
            // console.log("Orders :",order);
        }


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
        
        let updateProduct;
        
        const order = await Orders.findOne({_id:orderId});
        const userId = order.userId;
        const wallet = await Wallet.findOne({userId:userId})
        const product = order.orderItems.find((item=>{
            return (item._id).toString() == itemId
        }))
        
        console.log("Prduct",product);
        console.log("Order",order);

        if(status == "Refunded")
        {
            product.status = status;
            updateProduct= await order.save();
            console.log("Product Price",product.price);
            console.log("UpdateProduct",updateProduct);
            let amount = wallet.totalAmount + product.price;
            const refundToWallet = await Wallet.findOneAndUpdate(
                { userId: userId },
                {
                    $push: {
                        transactions: {
                            transactionType: "credit",  // Refund transaction
                            amount: product.price,
                            date: Date.now() // Set the transaction date
                        }
                    },
                    $set: {
                        totalAmount: amount // Update the total amount in the wallet
                    }
                },
                { new: true }
            );
            console.log("Updated Wallet",refundToWallet);

            //increase the product Quantity
            const products = await Products.findOne({'variants._id':product.variantId});

            console.log("Products",products);

            const variant = products.variants.find(elm => {
                return elm._id.toString() == product.variantId.toString()
            })


            variant.quantity += product.quantity

            await products.save();

        }
        else
        {
            product.status = status;
            updateProduct = await order.save();
            console.log("UpdateProduct",updateProduct);

        }
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