const products = require("../model/productScheme");
const shopController = {};




shopController.loadShopPage = async (req,res) =>{
    try{
        const cartDetails = await products.find().populate('category');
        res.render("./user/shopList",{cartDetails});
    }
    catch(error)
    {
        console.log("Error Loding Shop Page -",error);
    }
} 


module.exports = shopController;