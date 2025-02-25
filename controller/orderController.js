
const Orders = require("../model/orderSchema");
const Wallet = require("../model/walletSchema");
const Products = require("../model/productScheme");
const PDFDocument = require('pdfkit');
const moment = require('moment');
const fs = require('fs');
const path = require('path');
const orderController = {};

orderController.loadOrderDetails = async (req, res) => {
  try {
    const userId = req.session.user._id
    const orderId = req.params.id;
    // console.log(orderId)
    const Order = await Orders.find({ userId: userId, _id: orderId })

    res.render("./user/orderDetails", {
      Order,
      currentPage: 'orderDetails'
    });
  }
  catch (err) {
    console.log("Error in Loading Order Details Page", err);
  }
}

orderController.cancelOrder = async (req, res) => {
  try {
    const { reason } = req.body;
    const orderId = req.params.id;
    const userId = req.session.user._id;
    // let refundToWallet = null;
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

    console.log("Order Details", orderDetails);
    console.log("Order Product Details", orderDetails.orderItems);

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
          "orderItems.$.status": "CancelInit" // Update the product's status to 'Cancelled'
        }
      },
      { new: true } // Return the updated order document
    );

    // Find the cancelled item from the order
    const cancelledItem = cancelOrder.orderItems.find(item => item.status === "CancelInit");
    if (!cancelledItem) {
      return res.status(400).json({ message: "Cancelled item not found" });
    }

    let totalAmount = Number(wallet.totalAmount || 0) + Number(cancelledItem.price);

    console.log("Refund amount:", cancelledItem.price);
    console.log("New total wallet amount:", totalAmount);

    // If the payment method is 'online', add refund to wallet
    // if (orderDetails.paymentMethod === "online" || orderDetails.paymentMethod === "wallet") {
    //   refundToWallet = await Wallet.findOneAndUpdate(
    //     { userId: userId },
    //     {
    //       $push: {
    //         transactions: {
    //           transactionType: "credit",  // Refund transaction
    //           amount: cancelledItem.price,
    //           date: Date.now() // Set the transaction date
    //         }
    //       },
    //       $set: {
    //         totalAmount: totalAmount // Update the total amount in the wallet
    //       }
    //     },
    //     { new: true }
    //   );
    // }

    // console.log("Refund DB:", refundToWallet);

    //Find which product is cancelled 
    const productVariant = cancelOrder.orderItems.find(item => item.status === "CancelInit");


    const updateProduct = await Products.findOneAndUpdate(
      { "variants._id": productVariant.variantId },
      { $inc: { "variants.$.quantity": productVariant.quantity } }
    );

    //add the order quantity with the product quantity...

    console.log("Update Product", updateProduct);

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

orderController.returnOrder = async (req, res) => {
  try {
    const { reason } = req.body;
    const orderId = req.params.id;
    const userId = req.session.user._id;
    // let refundToWallet = null;
    let wallet = null;

    console.log("We Are in return product and the reason is", reason)

    // Find the order and wallet for the user
    const orderDetails = await Orders.findOne({ userId: userId, "orderItems._id": orderId });


    console.log("Order Details", orderDetails);
    console.log("Order Product Details", orderDetails.orderItems);



    // Update the order's product status to 'Cancelled'
    const returnOrder = await Orders.findOneAndUpdate(
      {
        userId: userId, // Ensure this is the correct user
        "orderItems._id": orderId // Find the correct product in the orderItems array
      },
      {
        $set: {
          "orderItems.$.returnReson": reason,
          "orderItems.$.status": "ReturnInit" // Update the product's status to 'Cancelled'
        }
      },
      { new: true } // Return the updated order document
    );

    if (!returnOrder) {
      return res.status(500).json({ success: false, message: "Internal Server Error" });
    }

    return res.status(200).json({ success: true, message: "Return Initiated.." });
  }
  catch (err) {
    console.log("Error in Return Order", err);
    res.status(500).send("Internal Server Error in Return Order", err);
  }
}


orderController.orderSuccess = async (req, res) => {
  try {
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
    console.log("Images", images);
    res.render("./user/orderSuccess", { orderDetails });
  }
  catch (err) {
    console.log("Error in Order Success Page", err);
  }
}

orderController.downloadInvoice = async (req, res) => {
  try {
    const userId = req.session.user._id;  // Get userId from session
    const orderId = req.params.id;  // Order ID from URL parameter

    // Fetch the order from the database
    const order = await Orders.findOne({ userId: userId, _id: orderId });

    if (!order) {
      return res.status(404).send('Order not found');
    }

    // Create a new PDF document
    const doc = new PDFDocument();

    // Set response headers for the PDF file download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice_${order._id}.pdf`);

    // Pipe the PDF document to the response
    doc.pipe(res);

    // Add Company Header with Logo (if available)
    //   doc.image(path.join(__dirname, '..', 'assets', 'logo.png'), 50, 30, { width: 100 })  // Assuming a logo file exists
    //     .fontSize(18)
    //     .font('Helvetica-Bold')
    //     .text('SouthSide', { align: 'right' });

    doc.moveDown(0.5);

    // Invoice Title
    doc.fontSize(22)
      .font('Helvetica-Bold')
      .text('Invoice', { align: 'center' });

    // Invoice Details
    doc.fontSize(12)
      .text(`Invoice Date: ${moment(order.invoiceDate).format('MMMM DD, YYYY')}`, { align: 'left' })
      .text(`Invoice Number: ${order._id.toString().slice(-8)}`, { align: 'left' })
      .text(`Customer: ${req.session.user.name}`, { align: 'left' });

    doc.moveDown(1);

    // Shipping Address Section with Title
    doc.fontSize(12)
      .font('Helvetica-Bold')
      .text('Shipping Address:', { underline: true })
      .font('Helvetica')
      .text(`${order.addres.name}`)
      .text(`${order.addres.street}`)
      .text(`${order.addres.city}, ${order.addres.state}, ${order.addres.postalCode}`)
      .text(`${order.addres.country}`)
      .text(`Phone: ${order.addres.phone}`);

    doc.moveDown(1);

    // Order Table Header with borders
    const tableTop = doc.y;
    const columnSpacing = 15;
    const columns = {
      productName: { x: 50, width: 180 },
      price: { x: 250, width: 70 },
      quantity: { x: 330, width: 70 },
      total: { x: 410, width: 70 }
    };

    // Table Header
    doc.font('Helvetica-Bold')
      .fontSize(10)
      .text('Product Name', columns.productName.x, tableTop)
      .text('Price', columns.price.x, tableTop)
      .text('Quantity', columns.quantity.x, tableTop)
      .text('Total', columns.total.x, tableTop);

    // Table Border
    doc.rect(40, tableTop - 10, 530, 20).stroke();

    doc.font('Helvetica')
      .fontSize(9);

    // Table Content - Order Items
    let rowY = tableTop + 20;
    order.orderItems.forEach(item => {
      doc.text(item.product.productName, columns.productName.x, rowY);
      doc.text(`$${item.price.toFixed(2) / item.quantity}`, columns.price.x, rowY);
      doc.text(item.quantity, columns.quantity.x, rowY);
      doc.text(`$${(item.price).toFixed(2)}`, columns.total.x, rowY);
      rowY += 20;

      // Add table border for each row
      // doc.rect(40, rowY - 10, 530, 20).stroke();
    });

    // Price Summary Section
    doc.moveDown(1);
    doc.fontSize(12)
      .font('Helvetica-Bold')
      .text('Total Summary', { underline: true });

    doc.fontSize(10)
      .font('Helvetica')
      .moveDown(0.5)
      .text(`Total Price: $${order.totalPrice.toFixed(2)}`);

    if (order.discount > 0) {
      doc.text(`Discount: -$${order.discount.toFixed(2)}`);
    }

    doc.text(`Final Amount: $${order.finalAmount.toFixed(2)}`);

    doc.moveDown(1);

    // Payment Method Section
    doc.fontSize(12)
      .font('Helvetica-Bold')
      .text('Payment Method:', { underline: true });

    doc.fontSize(10)
      .font('Helvetica')
      .moveDown(0.5)
      .text(`${order.paymentMethod}`);

    // Footer with Timestamp
    doc.moveDown(1);
    doc.moveDown(1);
    doc.fontSize(8)
      .text(`Invoice generated by SouthSide on ${moment().format('MMMM DD, YYYY HH:mm:ss')}`, {
        align: 'center',
        y: doc.page.height - 50
      });

    // Finalize the PDF
    doc.end();
  } catch (error) {
    console.error('Error in generating invoice:', error);
    res.status(500).send('Internal Server Error');
  }
};



module.exports = orderController;