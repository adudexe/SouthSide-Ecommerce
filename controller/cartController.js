const products = require("../model/productScheme");
const cart = require("../model/cartSchema");
const statusCode = require("../public/javascript/statusCodes");
const { CurrencyCodes } = require("validator/lib/isISO4217");
const cartController = {};


cartController.loadCartPage = async (req,res)=>{
    try {
        const userId = req.session.user._id;
        const cartDetails = await cart.findOne({userId:userId}).populate('items.productId');
        // const productDetails =  await products.find();
        console.log(cartDetails.productId);
        res.render("./user/cartPage",{cartItems:cartDetails});
    } catch (error) {
        console.log("Error in Loading Cart",error);
    }
}


cartController.addProductToCart = async (req,res) => {
    try
    {
        const userId = req.session.user._id;
        const {productId,variantId,quantity} = req.body;

        //To get the cart Details
        const cartProductsDetails = await cart.findOne({userId:userId}); //Cart database
        // console.log(cartProductsDetails)

        //To get the details of the specific Product Variant  from the cart
        const cartProductVariant =  (cartProductsDetails.items).find((item)=>{
            // console.log("Cart Variant",item);
            return item.variantId.toString() === variantId.toString() ? item : false;
        })
        // console.log("Cart Variant Details -",cartProductVariant);
        
        //To get the product Details
        const productDetails =  await products.findOne({_id:productId}); //Product details from product Database 
        //To get the exact variant from the product database
        const productVariantDetails = (productDetails.variants).find((item)=>{
            // console.log("Variants ",item);
            return item._id.toString() === variantId ? item : false;
        })


        // console.log("ProductVariatDetails",productVariantDetails);
        
        //Checks if a product exists...
        if(!productVariantDetails)
        {
            return res.status(statusCode.NOT_FOUND).json({success:false,message:"Product Not Found...!"});
        }
        //Check if the stock is available
        if(productVariantDetails.quantity<=0)
        {
            return res.status(statusCode.BAD_REQUEST).json({success:false,message:"Product Currently Out of Stock..."});
        }
        //If the user is trying to add more than the available quantity.....
        if(quantity > productVariantDetails.quantity)
        {
            return res.status(statusCode.BAD_REQUEST).json({success:false,message:"Product Quantity is limited....."});
        }
        if(!cartProductVariant)
        {
            //If the producti variant is not present in the cart then the cart should need to be updated with the new product....
            cartProductsDetails.items.push({
                productId:productId,
                variantId:variantId,
                quantity:Number(quantity),
                // price:product.price,
                // totalPrice:product.price*quantity
            });
        }
        else
        {
            //If the product Variant already Exist's in the cart then the quantity should only need to be updated
            let newQuantity = cartProductVariant.quantity + Number(quantity);

            //To Limit the user to only buy 5 products
            // console.log("newQuantity - ",newQuantity);
            // console.log("Product Quantity - ",productVariantDetails.quantity);
            if(newQuantity > 5)
            {
                // return console.log("Quentity Exceeded...");
                return res.status(statusCode.INTERNAL_SERVER_ERROR).json({success:false,message:"Product max Limit Reached.."});
            }
            if(newQuantity > productVariantDetails.quantity)
            {
                return res.status(statusCode.BAD_REQUEST).json({success:false,message:"Product Quantity is limited....."});
            }

            cartProductVariant.quantity = newQuantity;
        }
        const updatedCartDetails  = await cartProductsDetails.save();
        console.log("Updated Cart Details - ",updatedCartDetails);
        if(!updatedCartDetails)
        {
            return res.status(statusCode.INTERNAL_SERVER_ERROR).json({success:false,message:"Error updating the cart..!"});
        }
        return res.status(statusCode.OK).json({success:true,message:"Product Added Succesfully."});
        
    }
    catch(error)
    {
        console.log("Error in adding product to cart",error);
    }
}


module.exports = cartController;


       
    