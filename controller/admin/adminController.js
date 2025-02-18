const session = require("express-session");
const flash = require("connect-flash");
const multer = require("multer");
const Category = require("../../model/categorySchema");
const User =  require("../../model/userModel");
const Product = require("../../model/productScheme");
const Order = require("../../model/orderSchema");
const statusCodes = require("../../public/javascript/statusCodes");
const bcrypt = require("bcrypt");
const fs = require('fs');
const moment = require('moment'); // For formatting dates
// const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const adminController = {};


adminController.generateSalesReport = async (req, res) => {
    try {
      // Fetch all orders from the database
      const orders = await Order.find();
  
      if (orders.length === 0) {
        return res.status(404).send({ message: 'No orders found to generate sales report.' });
      }
  
      // Create a new PDF document
      const doc = new PDFDocument();
      
      // Set response headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=southside_sales_report.pdf');
      
      // Pipe the PDF document to the response
      doc.pipe(res);
  
      // Add company header
      doc.fontSize(24)
         .font('Helvetica-Bold')
         .text('SOUTHSIDE', { align: 'center' });
      
      doc.moveDown(0.5);
      
      // Add report title and date
      doc.fontSize(18)
         .font('Helvetica')
         .text('Sales Report', { align: 'center' });
      
      doc.fontSize(12)
         .text(`Generated on: ${moment().format('MMMM DD, YYYY HH:mm:ss')}`, { align: 'center' });
      
      doc.moveDown(2);
  
      // Define table layout
      const tableTop = 200;
      const columnSpacing = 15;
      const columns = {
        orderId: { x: 50, width: 80 },
        userId: { x: 130, width: 70 },
        date: { x: 200, width: 100 },
        price: { x: 300, width: 70 },
        discount: { x: 370, width: 70 },
        final: { x: 440, width: 70 },
        payment: { x: 510, width: 80 }
      };
  
      // Draw table header
      doc.font('Helvetica-Bold')
         .fontSize(10);
      
      // Add background for header
      doc.rect(40, tableTop - 15, 530, 20)
         .fill('#f0f0f0');
      
      // Add header text
      doc.fillColor('#000000')
         .text('Order ID', columns.orderId.x, tableTop - 10)
         .text('User ID', columns.userId.x, tableTop - 10)
         .text('Date', columns.date.x, tableTop - 10)
         .text('Price', columns.price.x, tableTop - 10)
         .text('Discount', columns.discount.x, tableTop - 10)
         .text('Final', columns.final.x, tableTop - 10)
         .text('Payment', columns.payment.x, tableTop - 10);
  
      // Draw table content
      let rowY = tableTop + 10;
      doc.font('Helvetica')
         .fontSize(9);
  
      orders.forEach((order, i) => {
        // Add zebra striping
        if (i % 2 === 0) {
          doc.rect(40, rowY - 5, 530, 20)
             .fill('#f9f9f9');
        }
  
        doc.fillColor('#000000')
           .text(order._id.toString().slice(-8), columns.orderId.x, rowY)
           .text(order.userId.toString().slice(-6), columns.userId.x, rowY)
           .text(moment(order.invoiceDate).format('DD/MM/YY'), columns.date.x, rowY)
           .text(`$${order.totalPrice.toFixed(2)}`, columns.price.x, rowY)
           .text(`$${order.discount.toFixed(2)}`, columns.discount.x, rowY)
           .text(`$${order.finalAmount.toFixed(2)}`, columns.final.x, rowY)
           .text(order.paymentMethod, columns.payment.x, rowY);
  
        rowY += 20;
  
        // Add new page if needed
        if (rowY > 700) {
          doc.addPage();
          rowY = 50;
          // Repeat header on new page
          doc.font('Helvetica-Bold')
             .fontSize(10);
          
          doc.rect(40, rowY - 15, 530, 20)
             .fill('#f0f0f0');
          
          doc.fillColor('#000000')
             .text('Order ID', columns.orderId.x, rowY - 10)
             .text('User ID', columns.userId.x, rowY - 10)
             .text('Date', columns.date.x, rowY - 10)
             .text('Price', columns.price.x, rowY - 10)
             .text('Discount', columns.discount.x, rowY - 10)
             .text('Final', columns.final.x, rowY - 10)
             .text('Payment', columns.payment.x, rowY - 10);
  
          doc.font('Helvetica')
             .fontSize(9);
          rowY += 10;
        }
      });
  
      // Calculate detailed summary statistics
      const totalSales = orders.reduce((sum, order) => sum + order.finalAmount, 0);
      const totalDiscounts = orders.reduce((sum, order) => sum + order.discount, 0);
      const totalGrossSales = orders.reduce((sum, order) => sum + order.totalPrice, 0);
      const totalOrders = orders.length;
      const averageOrderValue = totalSales / totalOrders;
  
      // Group orders by payment method
      const paymentMethodStats = orders.reduce((acc, order) => {
        acc[order.paymentMethod] = (acc[order.paymentMethod] || 0) + 1;
        return acc;
      }, {});
  
      // Add detailed summary section
      doc.addPage();
      doc.fontSize(16)
         .font('Helvetica-Bold')
         .text('Sales Summary Report', { align: 'center' });
      
      doc.moveDown(2);
      
      // Financial Summary
      doc.fontSize(14)
         .text('Financial Overview');
      
      doc.fontSize(10)
         .font('Helvetica')
         .moveDown(0.5)
         .text(`Total Number of Orders: ${totalOrders}`)
         .text(`Gross Sales (Before Discounts): $${totalGrossSales.toFixed(2)}`)
         .text(`Total Discounts Applied: $${totalDiscounts.toFixed(2)}`)
         .text(`Net Sales (After Discounts): $${totalSales.toFixed(2)}`)
         .text(`Average Order Value: $${averageOrderValue.toFixed(2)}`);
  
      doc.moveDown(1.5);
  
      // Payment Methods Breakdown
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .text('Payment Methods Breakdown');
      
      doc.fontSize(10)
         .font('Helvetica')
         .moveDown(0.5);
  
      Object.entries(paymentMethodStats).forEach(([method, count]) => {
        const percentage = ((count / totalOrders) * 100).toFixed(1);
        doc.text(`${method}: ${count} orders (${percentage}%)`);
      });
  
      // Add report footer
      doc.fontSize(8)
         .text(`Report generated by Southside on ${moment().format('MMMM DD, YYYY HH:mm:ss')}`, {
           align: 'center',
           y: doc.page.height - 50
         });
  
      // Finalize the PDF file
      doc.end();
  
    } catch (error) {
      console.error('Error generating sales report:', error);
      return res.status(500).send({ message: 'Internal Server Error' });
    }
  };

adminController.loadDashboard = async  (req,res) => { 
    try{
        // console.log("Load dashboard")
        let currentDate = new Date();
        let total=null;
        let count = null;
        const orders = await Order.find().sort({createdOn:-1});
        const products = await Product.find().countDocuments();
        const categories = await Category.find({isListed:true}).countDocuments();
        const currentMonth = currentDate.getMonth()+1;

        // console.log("Current Date",currentDate);
        // console.log("Current Mouth",currentMonth);

        const currentMonthTotal = await Order.aggregate([
            {
              $project: {
                month: { $month: "$createdOn" },  
                totalPrice: 1  
              }
            },
            {
              $match: {
                month: new Date().getMonth() + 1  
              }
            },
            {
              $group: {
                _id: null, 
                totalAmount: { $sum: "$totalPrice" }  
              }
            }
          ]);

          const yearsAndMonths = await Order.aggregate([
            // Get all distinct years
            {
              $project: {
                year: { $year: "$createdOn" },  
                month: { $month: "$createdOn" } 
              }
            },
            {
              $group: {
                _id: null, 
                years: { $addToSet: "$year" },  
                months: { $addToSet: "$month" } 
              }
            },
            {
              $project: {
                _id: 0, 
                years: 1,  
                months: 1  
              }
            }
          ]);
          
        //   console.log(yearsAndMonths);
          
          
          
        //   console.log(currentMonthTotal)
        
        // console.log("Orders",orders);
        for(let i of orders)
        {
            count++;
            total = total+i.totalPrice;
        }
        
        res.render('./admin/index',{orders,total,count,products,categories,currentMonthTotal,yearsAndMonths});
    }
    catch(err)
    {
        console.log("Error Loading Admin" + err);
    }
}

adminController.dashboardFiltering = async (req,res) =>{
    try
    {
        console.log()
        const date = new Date();
        // let orders = null;
        const { endDate, startDate, category } = req.body;

// Build the query object
let query = {};

// 1. Match the date range if startDate and endDate are provided
if (startDate && endDate) {
  query.createdOn = { 
    $gte: new Date(startDate), // Greater than or equal to startDate
    $lte: new Date(endDate)    // Less than or equal to endDate
  };
}

// 2. Filter by category (specific year) if category is provided
if (category) {
  const year = new Date(category).getFullYear(); // Extract the year from the category

  if (query.createdOn) {
    // If the date range is already defined, update it to match the full year range
    query.createdOn.$gte = new Date(year, 0, 1); // Start of the year (January 1st)
    query.createdOn.$lte = new Date(year, 11, 31); // End of the year (December 31st)
  } else {
    // If no date range is defined, just filter by the year
    query.createdOn = {
      $gte: new Date(year, 0, 1), // Start of the year
      $lte: new Date(year, 11, 31) // End of the year
    };
  }
}

// Now find the orders based on the built query
const orders = await Order.find(query).sort({ createdOn: -1 }); // Sort by createdOn in descending order

console.log(orders);


        if(!orders.length)
        {
            return res.status(404).json({success:false,message:'No Data Found in datebase'});
        }
        return res.status(200).json({success:true,orders})
    

    }
    catch(err)
    {
        console.log("There is an error in dashboardFiltering",err);
    }
}



adminController.loadLoginPage = (req,res) => {
    try{
        res.render('./admin/loginPage')
    }
    catch(err)
    {
        console.log("Error Loading Login Page" + err);
    }
}

adminController.Login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({ message: "Email and Password are required" });
    }

    // Find user by email
    const user = await User.findOne({ email });

    // If user does not exist
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the user is an admin
    if (!user.isAdmin) {
      return res.status(403).json({ message: "User is not an admin" });
    }

    // Compare the provided password with the hashed password in the database
    const match = await bcrypt.compare(password, user.password);

    if (match) {
      // If the passwords match, store user information in the session
      req.session.admin = user;
      return res.status(200).json({ success: true, message: "Login successful" });
    } else {
      return res.status(401).json({ message: "Invalid password" });
    }

  } catch (err) {
    // Log the error and return a generic error message
    console.error("Error in Logging In", err);
    return res.status(500).json({ message: "An error occurred during login. Please try again later." });
  }
};


adminController.pageNumber = (req,res) => {
    try{
        // console.log(req.params.val);
        req.session.val = req.params.val;
        res.redirect('/admin/userManagement');

    }catch(err)
    {
        console.log("Error in getting data from front end "+err);
    }
}

adminController.loadUserManagement = async (req,res) => {
    try{

        const userlength = await User.find().countDocuments();
        const pageSize = Math.ceil(userlength/10)
        // console.log(pageSize);
        const count = req.session.val || 0;
        const user = await User.find().limit(10).skip(count*10);
        
        res.render("./admin/userManagement",{users : user ,pageSize , cp:count});
    }
    catch(err)
    {
        console.log(" Error in loading the UserManagement Page " + err);
    }
}

adminController.productManagement = (req,res) => {
    try {
        res.render("./admin/productManagement"); 
    } catch (err) {
        console.log("Error in loading the Product Page "+err);
    }
} 

adminController.blockUser = async (req,res) => {
    try{
        // console.log("Block")
        // console.log(req.params.id);
        const test = await User.findOneAndUpdate({_id : req.params.id},{$set:{isBlocked:true}});
        // console.log(test)
        res.redirect("/admin/userManagement")
    }
    catch(err)
    {
        console.log("Error in Handeling Users "+err);
    }
}

adminController.UnblockUser = async (req,res) => {
    try{
        // console.log("Unblock")
        // console.log(req.params.id);
        const test = await User.findOneAndUpdate({_id :req.params.id},{$set:{isBlocked:false}});
        // console.log(test)
        res.redirect("/admin/userManagement");
    }
    catch(err)
    {
        console.log("Error in Handeling Users "+err);
    }
}

adminController.loadProductManagement = async (req, res) => {
    try {
        const perPage = 10; // Limit of products per page
        const page = parseInt(req.query.page) || 1; // Default to page 1 if no query parameter

        // Get products for the current page, including variants
        const products = await Product.find()
            .skip((page - 1) * perPage) // Skip the previous pages' products
            .limit(perPage); // Limit the number of products per page

        // Get the total count of products for pagination
        const totalProducts = await Product.countDocuments();

        // Calculate total pages
        const totalPages = Math.ceil(totalProducts / perPage);

        // Render the page with products, variants, and pagination data
        res.render("./admin/productManagement", {
            products: products,
            currentPage: page,
            totalPages: totalPages,
        });
    } catch (err) {
        console.log("Error in loading the Product Page: " + err);
    }
};



adminController.addProduct = async (req,res) => { 
    try{
        const category = await Category.find();
        res.render("./admin/addProduct",{category});
    }
    catch(err)
    {
        console.log("Error in Loading Add Product Page.. "+err);
    }
}

const storage = multer.diskStorage({
    destination:function (req,file,cb){
        cb(null,"uploads/");
    },
    filename:function (req,file,cb)
    {
        cb(null, (file.fieldname + "_" + Date.now() + "_" + file.originalname).replace(/\s+/g,"_"));

    }
});


adminController.upload = multer({ storage: storage }).fields([
    { name: 'image_1', maxCount: 1 },
    { name: 'image_2', maxCount: 1 },
    { name: 'image_3', maxCount: 1 },
    // You can extend this list dynamically based on how many images you expect
]);
// adminController.upload = multer({storage:storage}).array("images");

adminController.productUpdatePage = async (req,res) =>{
    try {
        const productId = req.params.id; 
        if(!productId || productId == "")
        {
            console.log("Invalid Id");
        }
        const productDetails = await Product.findOne({_id:productId}).populate('category')
        const categoryDetails =  await Category.find();

        if(!productDetails)
        {
            return res.send("Invalid Product!!!");
        }
        return res.render("./admin/updateProduct",{productDetails,category:categoryDetails});
        // 


    } catch (error) {
        console.log("Error in loading the product update page",error);
    }
}


adminController.addProducts = async (req, res) => {
    try {
        console.log(req.body); // Log the request body for debugging
        console.log(req.files); // Log the uploaded files

        // console.log(JSON.parse(req.body.variants))
        // Parse the variants string into an actual JavaScript array
        const { productTitle, productOffer,  productCategory, productDescription, variants } = req.body;

        // Check if the variants field exists and is a valid string (or array)
        let parsedVariants = [];
        if (typeof variants === "string") {
            try {
                parsedVariants = JSON.parse(variants);  // Parse the string into an array of objects
            } catch (error) {
                return res.status(400).json({ success: false, message: "Invalid variants format" });
            }
        } else {
            parsedVariants = variants;  // If variants is already an array, use it as is
        }

        // Validate required fields
        if (!productTitle || !productOffer  || !productCategory || !productDescription) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        // Validate variants
        if (!parsedVariants || parsedVariants.length === 0) {
            return res.status(400).json({ success: false, message: "At least one variant must be provided" });
        }

        const category = await Category.findById(productCategory);
        console.log(category)


        const offer = productOffer > category.discount ? category.discount : productOffer;

        // Process images (check if files were uploaded or base64 data was provided)
        const productImages = [];
        // console.log(Object.entries(req.files));
        // console.log(Object.entries(req.files));
        if (Object.entries(req.files).length > 0) {
            // Files were uploaded using multer
            Object.entries(req.files).forEach(file => {
                productImages.push(file[1][0].path);  // Save file paths
            });
        }
        // console.log(productImages)
        // let finalPrice =  

        // console.log("Parsed Variants",parsedVariants);

        // Prepare the variants data (from the front-end)
        const variantObjects = parsedVariants.map(variant => ({
            size: variant.size,
            color: variant.color,
            status: variant.status,
            price: variant.price,
            salePrice:Math.floor((variant.price - ((variant.price * offer) / 100))),
            quantity: variant.quantity,
        }));

        // console.log("Variant Obj",variantObjects);

        // Check if product already exists (by title)
        const existingProduct = await Product.findOne({ productName: productTitle });
        if (existingProduct) {
            return res.status(409).json({ success: false, message: "Product already exists" });
        }

        // Create the product document
        const newProduct = await new Product({
            productName: productTitle,
            description: productDescription,
            // brand: productBrand,
            category: productCategory,
            productOffer: productOffer,
            productImages,  // Save image file paths
            variants: variantObjects  // Save variants array
        });

        console.log(newProduct);

        // Save the product in the database
        const savedProduct = await newProduct.save();
        if (!savedProduct) {
            return res.status(500).json({ success: false, message: "Error in adding product to the database" });
        }

        res.status(200).json({ success: true, message: "Product successfully added" });

    } catch (error) {
        console.error("Error in adding product details: ", error);
        res.status(500).json({ success: false, message: "An error occurred while adding the product" });
    }
};



adminController.deleteProduct = async (req,res) => {
    try {
        const productId = req.params.id;
        
        const deleteProduct = await Product.findByIdAndUpdate(productId,{isDeleted:true});
        const product = await Product.find();
        // console.log("Deleted Product",deleteProduct);
        if(deleteProduct)
        {
            return res.status(statusCodes.OK).json({message:"Product Has Been Sucessfully Deleted" , product});
        }
        else
        {
            return res.status(statusCodes.INTERNAL_SERVER_ERROR);
        }
    } catch (error) {
        console.log("Error in Deleting Product",error);
    }
}

adminController.loadCategory = async (req,res) =>{
    try{
        const cat = await Category.find();
        console.log(cat);
        res.render("./admin/categoryManagement",{category:cat});
    }
    catch(err)
    {
        console.log("error in loading CategoryPage"+err);
    }
}

adminController.manageCategory = async (req,res) => {
    try{
        let {categoryName , categoryDescription ,  catDiscount } = req.body
        categoryName = categoryName.toLowerCase();
        // console.log(typeof(categoryName));
        console.log(req.body)
        const desc = categoryDescription || "";
        const discount =  catDiscount  || 0;
        // console.log(desc);
        const cata = await Category.findOne({name:categoryName});

        console.log("cateogryfound",cata)

        if(cata)
        {
            return res.status(409).json({success:false, message:"Category Already Present"})
        }
        const newCategory = await new Category({ 
            name:categoryName,
            discount: discount,
            description:desc,
        })

        const saveCategory = await newCategory.save();
        console.log(saveCategory);

        res.status(statusCodes.OK).json({success:true , message:"Category Added Successfully",category:saveCategory});
    }
    catch(err)
    {
        console.log("Error in Category Management"+err);
    }
}

adminController.updateList = async (req, res) => {
    try {
        // Fetch categories from the database
        const categories = await Category.find();
        
        res.json({ success: true, categories });
    } catch (err) {
        console.error('Error fetching categories: '+err);
        res.status(500).json({ success: false, message: 'Error fetching categories' });
    }
}

adminController.unlistCategory = async (req,res) => {
        try{
            // console.log(req.params);
            const unlist = await Category.findByIdAndUpdate({_id:req.params.id},{$set:{isListed:false}});
            if(unlist)
            {
                return res.redirect("/admin/categoryManagement");
            }
            else
            {
                return res.json({"message":"error"});
            }
        }catch(err)
        {
            console.log("Error in Listing Category"+err);
        }
}

adminController.listCategory = async (req,res) => { 
        try{
            // console.log(req.params);
            const list = await Category.findByIdAndUpdate({_id:req.params.id},{$set:{isListed:true}});
            if(list)
            {
                return res.redirect("/admin/categoryManagement");
            }
            else
            {
                return res.json({"message":"error"});
            }
        }catch(err)
        {
            console.log("Error in Listing Category"+err);
        }
}


adminController.updateProduct = async (req, res) => {
    try {
        let changedVariants = [];
        let newVariants = [];
        const { product_id, product_title, product_offer, product_category, product_description, variants } = req.body;
        console.log("Images", req.files);
        console.log("Request body", req.body);
        
        const parsedVariants = JSON.parse(variants);
        const productDetails = await Product.findOne({ _id: product_id });
        const categoryDetails = await Category.findOne({ _id: product_category });
        
        if (!productDetails || !categoryDetails) {
            return res.status(404).json({ success: false, message: "Product or category not found" });
        }

        const productVariants = productDetails.variants;
      
        const offer = Number(product_offer) > categoryDetails.discount ? categoryDetails.discount : Number(product_offer);
        // console.log("Offer",offer);

    
        parsedVariants.forEach((variant, i) => {
            const existingVariant = productVariants[i];
            if (existingVariant && (
                variant.size !== existingVariant.size ||
                variant.color !== existingVariant.color ||
                variant.price !== existingVariant.price ||
                variant.quantity !== existingVariant.quantity ||
                variant.status !== existingVariant.status
            )) {
                changedVariants.push(variant._id);
            }
        });
        
        console.log("Changed variants:", changedVariants);
        
       
        productVariants.forEach(variant => {
            const updatedVariant = parsedVariants.find(v => v._id.toString() === variant._id.toString());
            console.log(updatedVariant);
            if (updatedVariant) {
                variant.size = updatedVariant.size;
                variant.color = updatedVariant.color;
                variant.price = updatedVariant.price;
                variant.quantity = updatedVariant.quantity;
                variant.status = updatedVariant.status;
                variant.salePrice = Math.floor(updatedVariant.price - (updatedVariant.price * offer / 100));
                newVariants.push(variant);
            } else {
                variant.salePrice = Math.floor(variant.price - (variant.price * offer / 100));
                newVariants.push(variant);
            }
        });

        console.log("Updated variants:", newVariants);

        
        const images = [];

        if (Object.entries(req.files).length > 0) {
            Object.entries(req.files).forEach(file => {
                images.push(file[1][0].path);  
            });
        }


        
        const updateData = {
            productName: product_title,
            description: product_description,
            category: product_category,
            productOffer: product_offer,
            variants: newVariants,
            productImages: images.length > 0 ? images : productDetails.productImages, // Only update images if new ones are provided
        };

        const updatedProduct = await Product.findByIdAndUpdate(product_id, updateData, { new: true });

        if (!updatedProduct) {
            return res.status(404).json({ success: false, message: "Product update failed" , updatedProduct });
        }

        res.status(200).json({
            success: true,
            message: "Product updated successfully",
            product: updatedProduct
        });
    } catch (err) {
        console.log("Error in updating Product:", err);
        res.status(500).json({ success: false, message: "Failed to update product", error: err.message });
    }
};



adminController.logout = (req,res) =>
{
    try
    {
        if(req.session.admin)
            {
                req.session.admin = null;
                res.redirect("/admin/login");
            }
    }
    catch(err)
    {
        console.log("Error in logout"+err);
    }
}




module.exports = adminController;