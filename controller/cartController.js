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
        const cartDetails = await cart.findOne({userId:userId}); //Cart database
        console.log(cartDetails)
        //To get the product Details
        const productDetails =  await products.findOne({_id:productId}); //Product database

        console.log("Variants Details",Array.isArray(productDetails.variants)); //To Check if varinats is an array 
        //To Check if the VariantId is present in the cart.
        const cartItems = await cart.findOne({userId:userId,'items.variantId':variantId},{items:1});
        console.log("cartVarinat -",cartItems);
        // console.log("frontEnd - ",typeof(quantity));
        // console.log("Quantity - ",typeof(cartVariant.items[0].quantity));
    
        if(cartItems&&cartItems.items[0].variantId.toString() === variantId.toString())
        {
            let newQuantity = cartItems.items[0].quantity + Number(quantity);

            console.log("product Variants",productVariant); // To print the variant details of request variant from product database
            console.log("New Quantity",newQuantity); // To print the value of the new updated quantiy in cart
            // console.log("Variant Present...");

            //To Prevent User from buying more than 5 products
            if(newQuantity > 5)
            {
                // return console.log("Quentity Exceeded...");
                return res.status(statusCode.INTERNAL_SERVER_ERROR).json({success:false,message:"The Product Qunatity Limit Exceeded...!"});
            }
            if(newQuantity > productVariant.quantity);
            {
                return res.status(statusCode.BAD_REQUEST).json({success:false,message:"Not Enough Product Quantity.!"});
            }
            // return console.log("Fine Amout...")
        }
        
        //If there is no product details return error showing no products
        if(!productDetails)
        {
            return res.status(statusCode.NOT_FOUND).json({success:false,message:"Product Not Found...!"});
        }
        
        //To Check if the requested variant is present in the product database..
        let productVariant = (productDetails.variants).find((items)=>{
            return ((items._id).toString() === variantId.toString()) ? items : false; //Compare and find's the product varient with the variand ID send from the forntend 
        })
        
        //If the requested variant is not present in the database...
        if(!productVariant)
        {
            console.log("The Variant is not in the Product Database");
            return res.status(statusCode.NOT_FOUND).json({success:false,message:"Product Not Found...!"});
        }

        //what I should do if the variant is already present in the cart database 
        //If the product varinat is present in the cart database you should need add the current quentity with the new quantity..
        
        //what I should do if the variant product variant is OutOfStock
        //what I should do if the 
        

        // console.log(cartDetails.);


        
        // console.log("Variant Not Present..");
        
    }
    catch(error)
    {
        console.log("Error in adding product to cart",error);
    }
}




module.exports = cartController;





//Add Product

// console.log("From Start")
//         const userId = req.session.user._id
//         const {productId,varientId,quantity} = req.body


//         const product = await products.findOne({_id:productId})
//         const variant = product.variants.find((item)=>{
//             return item._id.toString() == varientId.toString() ? item : false; 
//         })
//         // console.log(variant.quantity <= 4);
//         // console.log(product);
//         // console.log(product.variants[varientIndex]);
//         if(!product)
//         {
//             
//         }
//         if(variant.quantity==0)          {
//             return res.status(statusCode.BAD_REQUEST).json({success:false,message:"Product Out Of Stock..!"});
//         }
//         if(!productId)
//         {
//             return res.status(statusCode.NOT_FOUND).json({success:false,message:"Invalid Product ID...!"});
//         }
//         if(quantity<=0)
//         {
//             return res.status(statusCode.INTERNAL_SERVER_ERROR).json({success:false,message:"At Least One Product Should need be selected..."});
//         }
//         if(quantity>=5)
//         {
//             
//         }
//         const userCart = await cart.findOne({userId:userId})
//         if(!userCart.items)
//         {
//             userCart.items = [];
//         }
//         // const existingProduct = userCart.items.find(items => items.productId.toString() == productId)
        
//         // const existingProduct  = userCart.items.find(items => items.productId.toexString() === productId.toString());
//         // let existingVariant  = userCart.find((item)=>{
//         //     return item.variantId == varientId ? item : false;
//         // })
//         // console.log("Existing Product",existingProduct);
//         const existingQuantity = await cart.findOne({userId:userId,"items.variantId":varientId},{"items.quantity":1});
//         console.log("Quantity - "+existingQuantity)
//         if(existingProduct)  
//         {   
//             const newQuantity = Number(existingProduct.quantity)+Number(quantity);
            

//             if(newQuantity > variant.quantity)
//             {
                
//                 // console.log("Variant",);
//                 
//             }
            
            
//             console.log("Existig",existingProduct.quantity," New",newQuantity)
//             if( newQuantity> 5)
//             {
//                 return res.status(statusCode.BAD_REQUEST).json({success:false,message:"Max Product Quantity Reached..!"});
//             }
//             else
//             {
//                 // console.log("Existing Variant Id",existingProduct.variantId.toString());
//                 let existingVariant = existingProduct.variantId.toString() === varientId.toString();
            
//                 if(existingVariant)
//                 {
//                     existingProduct.quantity = newQuantity;
//                     console.log("Updated");
//                 }
//                 else
//                 {
//                     userCart.items.push({
//                         productId:productId,
//                         variantId:varientId,
//                         quantity:Number(quantity),
//                         // price:product.price,
//                         // totalPrice:product.price*quantity
//                     });
//                 }
//             }
//         }
//         else
//         {
//             userCart.items.push({
//                 productId:productId,
//                 variantId:varientId,
//                 quantity:Number(quantity),
//                 // price:product.price,
//                 // totalPrice:product.price*quantity
//             });
//         }

//         const cartUpdated  = await userCart.save();
//         console.log(cartUpdated);
//         if(!cartUpdated)
//         {
//             return res.status(statusCode.INTERNAL_SERVER_ERROR).json({success:false,message:"Error updating the cart..!"});
//         }
//         return res.status(statusCode.OK).json({success:true,message:"Product Added Succesfully."});
    