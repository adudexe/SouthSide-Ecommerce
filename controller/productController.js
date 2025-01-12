const Products = require("../model/productScheme");
const productController = {};


productController.loadProductPage = async (req,res) => {
    console.log("Accessing the Product Page",req.params.id);
    try {
        // console.log("params is",req.params);
        // console.log(req.params)
        const productId = req.params.id;
        //Controller to Load the Produt Page
        // console.log("hi");
        const product = await Products.findOne({_id:productId}).populate('category');
        console.log(product);
        res.render("./user/productPage",{productDetails:product});
        
    } catch (error) {
        console.log("Error in Loading the Product Page",error)
    }
}


module.exports = productController;