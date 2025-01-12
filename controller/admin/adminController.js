const session = require("express-session");
const flash = require("connect-flash");
const multer = require("multer");
const Category = require("../../model/categorySchema");
const User =  require("../../model/userModel");
const Product = require("../../model/productScheme");
const statusCodes = require("../../public/javascript/statusCodes");
const bcrypt = require("bcrypt");
const adminController = {};


adminController.loadDashboard =  (req,res) => { 
    try{
        res.render('./admin/index');
    }
    catch(err)
    {
        console.log("Error Loading Admin" + err);
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
        const productDetails = await Product.findOne({_id:productId});
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
        // console.log(req.body); // Log the request body for debugging
        // console.log(req.files); // Log the uploaded files

        // console.log(JSON.parse(req.body.variants))
        // Parse the variants string into an actual JavaScript array
        const { productTitle, productOffer, productBrand, productCategory, productDescription, variants } = req.body;

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
        if (!productTitle || !productOffer || !productBrand || !productCategory || !productDescription) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        // Validate variants
        if (!parsedVariants || parsedVariants.length === 0) {
            return res.status(400).json({ success: false, message: "At least one variant must be provided" });
        }

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
        console.log(productImages)

        // console.log("Parsed Variants",parsedVariants);

        // Prepare the variants data (from the front-end)
        const variantObjects = parsedVariants.map(variant => ({
            size: variant.size,
            color: variant.color,
            status: variant.status,
            price: variant.price,
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
            brand: productBrand,
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
        const product = await Product.find();
        const deleteProduct = await Product.findByIdAndDelete({_id:productId});
        if(deleteProduct)
        {
            return res.status(statusCodes.OK).json({message:"Product Has Been Sucessfully Deleted"});
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
        const {categoryName , categoryDescription } = req.body
        // console.log(typeof(categoryName));
        const desc = categoryDescription || "";
        // console.log(desc);
        const cata = await Category.findOne({categoryName});
        if(cata)
        {
            return res.status(statusCodes.COFLICT).json({success:false, message:"Category Already Present"})
        }
        const newCategory = await new Category({ 
            name:categoryName,
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