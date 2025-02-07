const { whitelist } = require("validator");
const Product = require("../model/productScheme");
const Wishlist = require("../model/wishlistSchema");
const wishlistController = {};

wishlistController.loadWishlist = async (req,res) => {
    try
    {
        const userId = req.session.user._id;
        const userWishlist = await Wishlist.findOne({userId:userId}).populate('products.productsId');
        // let  = await Wishlist.findOne({ userId: userId });

        console.log("User Wishlist",userWishlist);
        
        // If no wishlist exists, create one
        if (!userWishlist) {
            userWishlist = await Wishlist.create({
                userId: userId,
                products: []
            });
        }
        console.log("wishlist",userWishlist);
        


        return res.render("./user/wishlist",{wishtList:userWishlist});
    }
    catch(err)
    {
        console.log("Errro in Loading the wishlist",err);
    }
}

wishlistController.addToWishList = async (req, res) => {
    try {
        const productId = req.params.id;
        const variantId = req.body.variantId;
        const userId = req.session.user._id;

        // console.log("Product Id",productId);
        // console.log("Variant Id",variantId);
        // console.log("User Id",userId);


        // Find the product
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        // Get user's wishlist
        let userWishlist = await Wishlist.findOne({ userId: userId });

        console.log("User Wishlist",userWishlist);
        
        // If no wishlist exists, create one
        if (!userWishlist) {
            userWishlist = await Wishlist.create({
                userId: userId,
                products: []
            });
        }

        // Check if product already exists in wishlist
        const productExists = userWishlist.products.some(item => 
            item.variantId.toString() === variantId.toString()  // Fix here
        );

        if (productExists) {
            return res.status(400).json({ success: false, message: "Product already in wishlist" });
        }

        // Prepare product data to add
        const productToAdd = {
            productsId: productId,
            variantId: variantId
        };

        // Add to wishlist
        await Wishlist.updateOne(
            { userId: userId },
            { $push: { products: productToAdd } }
        );

        return res.status(200).json({ 
            success: true, 
            message: "Product added to wishlist successfully" 
        });
    } catch (err) {
        console.error("Error in adding product to wishlist:", err);
        return res.status(500).json({ 
            success: false, 
            message: "Error adding product to wishlist" 
        });
    }
}

wishlistController.deleteItem = async (req,res) => {
    try
    {
        const deleteId = req.params.id;
        const userId = req.session.user._id;
        console.log("variant Id",deleteId);
        const deleteWishilist = await Wishlist.findOneAndUpdate(
            { userId: userId }, 
            { $pull: { products: { variantId: deleteId } } }, 
            { new: true }
        );
        if(!deleteWishilist)
        {
            return res.status(500).json({success:false,message:"Internarl Server Error"});
        }
        return res.status(200).json({success:true,message:"Product Succesfully Deleted"});
    }
    catch(err)
    {
        console.log("Error in Delete product",err);
    }
}


module.exports = wishlistController;