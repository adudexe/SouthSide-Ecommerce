const checkoutController = {};


checkoutController.loadCheckout = async (req,res) => {
    try
    {
        res.render("./user/checkout");
    }
    catch(err)
    {
        console.log("Error in loading the Checkout Page",err);
    }
}


module.exports = checkoutController;