const Cart = require("../model/cartSchema");
const Product = require("../model/productScheme");
const Address = require("../model/userAddress");
const Order = require("../model/orderSchema");
const Coupon = require("../model/couponSchema");
const Razorpay = require('razorpay');
var { validatePaymentVerification, validateWebhookSignature } = require('razorpay/dist/utils/razorpay-utils'); 
const checkoutController = {};



const razorpay = new Razorpay({
    key_id:process.env.RAZORPAY_KEY_ID,
    key_secret:process.env.RAZORPAY_KEY_SECRET
});



checkoutController.loadCheckout = async (req, res) => {
    try {
        const userId = req.session.user._id;
        let address = [];
        let variants = [];
        let quantity = [];
        let shipping = 0;
        let total = 0;

        // Fetch the cart and address data
        const cart = await Cart.findOne({ userId: userId }).populate('items.productId');
        const userAddress = await Address.find({ userId: userId });
        
        // Fetch available coupons
        const coupons = await Coupon.find({});

        //If cart.coupoon applied is true then apply the discount percent to each product other then add find the total 

        if (cart && cart.items) {
            cart.items.forEach((item) => {
                if (!item.productId.isDeleted && !item.productId.isBlocked) {
                    item.productId.variants.forEach((variant) => {
                        if (variant._id.toString() === item.variantId.toString()) {
                            variants.push(variant);
                            quantity.push(item.quantity);
                            total += variant.salePrice * item.quantity;
                        }
                    });
                }
            });
        }

        console.log("Total Price from cart",total);

        res.render('user/checkout', {
            cart,
            variants,
            userAddress,
            total,
            shipping,
            coupons // Pass coupons to the view
        });

    } catch (error) {
        console.error('Error in loadCheckout:', error);
        res.status(500).send('Internal Server Error');
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
        const totalprice = req.session.totalPrice;
        const primaryAddress = await Address.findOne({ userId: userId, isPrimary: true });
        
        console.log("Total Price",totalprice);

        if (!primaryAddress) {
            return res.status(404).json({ success: false, message: "Address Not Found.." });
        }

        // Get the user Cart Details
        const cartItems = await Cart.findOne({ userId: userId }).populate("items.productId");
        // console.log("Cart Items", cartItems.items);
        const coupon = await Coupon.findById(cartItems.couponApplied);
        const appliedCoupon = {};
          appliedCoupon.code = coupon.code;
          appliedCoupon.discount = coupon.discount;


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
                    price: variant.salePrice * item.quantity,
                    status: 'Pending', // Default status when the order is created
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
        let discount = (totalAmount-totalprice) || 0
        // let finalAmount = req.session.total - discount;

        // Create new order document
        const newOrder = new Order({
            userId: userId,
            orderItems: orderItems,
            totalPrice: totalprice,
            discount: discount,
            finalAmount: totalprice,
            addres: primaryAddress,  // Use the primary address for shipping
            invoiceDate: new Date(),
            couponApplied: appliedCoupon || false,
            paymentMethod: OrderType
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

checkoutController.createOrder = async (req,res)=>{
    try {
        let order = {};
        const { amount, currency, receipt, notes } = req.body;
        const phoneNumber  = await Address.findOne({userId:req.session.user._id, isPrimary:true},{phone:1});
        console.log("Key ",process.env.RAZORPAY_KEY_ID);
    
        const options = {
          amount: amount * 100, // Convert amount to paise
          currency,
          receipt,
          notes,
        };
    
        const orders = await razorpay.orders.create(options);
        

        console.log(orders);

        order = {
          order_id: orders.id,
          userName:req.session.user.name,
          email:req.session.user.email,
          phone:phoneNumber.phone,
          payment_id:process.env.RAZORPAY_KEY_ID,
          amount: orders.amount,
          currency: orders.currency,
          receipt: orders.receipt,
          status: 'created',
        }

        // console.log(order);
    
        res.status(200).json({succes:true,order}); // Send order details to frontend, including order ID
      } catch (error) {
        console.error(error);
        res.status(500).json({succes:false,message:'Error creating order'});
      }
}



checkoutController.onlinePayment = async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature,order} = req.body;
  
    console.log("We are in Verify Payment",req.body);

    const secret = razorpay.key_secret;
    const body = razorpay_order_id + '|' + razorpay_payment_id;
  
    try {
      const isValidSignature = validateWebhookSignature(body, razorpay_signature, secret);
      if (isValidSignature) {
        // Update the order with payment details
        // const orders = readData();
        //Get the orders from the front end 
        
        // const order = orders.find(o => o.);
        // Find the order id which is equat to razorpay_order_id
        if (order.order.order_id === razorpay_order_id) {
        //   order.order.status = 'paid';
        //   order.order.payment_id = razorpay_payment_id;

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
          const cartItems = await Cart.findOne({ userId: userId })
            .populate("items.productId"); 

            const coupons = await Coupon.findById(cartItems.couponApplied);
          console.log("Coupons",coupons);
          const {code,discount} = coupons;
          console.log("Cart Items", cartItems);
  
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
                      price: variant.salePrice * item.quantity,
                      status: 'Pending', // Default status when the order is created
                  });
  
                  // Add to total price
                  totalAmount += item.price;
  
                  // Decrement the quantity of the variant in the product
                  if (variant.quantity >= item.quantity) {
                      variant.quantity -= item.quantity;  // Decrement the stock
                  } else {
                      // If insufficient stock, throw an error
                      return res.status(400).json({ success: false, message: `Insufficient stock for ${product.productName}` });
                  }
              }
          }
        //   console.log("Total Amount",totalAmount);
          console.log("Session Total",req.session.totalPrice);
          const appliedCoupon = {};
          appliedCoupon.code = code;
          appliedCoupon.discount = discount;
  
          // Apply any discounts (if needed)
        //   let discount = cartItems.discount || 0;
        //   let finalAmount = req.session.total - discount;
  
          // Create new order document
          const newOrder = new Order({
              userId: userId,
              orderItems: orderItems,
              totalPrice: totalAmount || req.session.totalPrice,
              discount: totalAmount ? totalAmount - req.session.totalPrice : 0,
              finalAmount: totalAmount || req.session.totalPrice,
              addres: primaryAddress,  // Use the primary address for shipping
              invoiceDate: new Date(),
              couponApplied: appliedCoupon || false,
              paymentMethod: 'online'
          });
  
          // Save the order to the database
          const savedOrder = await newOrder.save();
  
          // Save the updated product stock after the order
          await product.save();  // Save the product with the updated variant quantity
  
          // Optionally clear the cart after the order is placed
          await Cart.findOneAndUpdate({ userId: userId }, { $set: { items: [] } });
  
          // Return the saved order as a response
          return res.status(200).json({ success: true, message: 'Order placed successfully', order: savedOrder });
  
        }
        return res.status(200).json({ success:true, status: 'ok' });
        console.log("Payment verification successful");
      } else {
        return res.status(400).json({ status: 'verification_failed' });
        console.log("Payment verification failed");
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ status: 'error', message: 'Error verifying payment' });
    }
  }

module.exports = checkoutController;