const express = require("express");
const router = express.Router();
const userAuth = require("../middleware/auth");
const userController = require("../controller/user/userController");
const addressController = require("../controller/addressController");
const productController = require("../controller/productController");
const shopController = require("../controller/shopController");
const cartController = require("../controller/cartController");
const forgetController = require("../controller/forgetController");
const checkoutController = require("../controller/checkoutController");
const productAvailability = require("../middleware/productAvailability");
const orderController = require("../controller/orderController");
const passport = require("passport");
const errorHandling = require("../middleware/errorHandling");

// userController
router.get("/login",userController.loadLoginPage); // Remove userAuth.isLogged From here since it for just constant user....
router.post("/login", userController.userLogin);
router.get("/home",userAuth.isLogged,userAuth.isBlocked,userController.loadHomePage);
router.post("/resentOTP", userController.resendOTP);
router.get("/signup", userController.loadSignUpPage);
router.post("/signup", userController.registerUser);
router.post("/verifyOtp", userController.verifyOTP);
router.get("/userLogout",userController.userLogout);

//forgetController
router.post("/forgetPassword",forgetController.forgetPassword)
router.post("/forgetPassword/otpMatch",forgetController.OTPMatch);
router.post("/forgetPassword/newPassword",forgetController.newPassword);


//addressController
router.get("/myAccount",userAuth.isLogged,userAuth.isBlocked,addressController.loadMyAccount);
router.post("/myAccount/Address",userAuth.isLogged,userAuth.isBlocked,addressController.addAddress);
router.get("/myAccount/editAddress/:id",addressController.getAddressById)
router.patch("/myAccount/editAddress/:id",userAuth.isLogged,addressController.updateAddresById);
router.delete("/myAccount/editAddress/:id",userAuth.isLogged,addressController.deleteAddressById);


//userController
router.patch("/myAccount/editProfile",userAuth.isLogged,userController.updateDetails);

// Google OAuth Routes
router.get("/auth/google", passport.authenticate('google', { scope: ['email', 'profile'] }));
router.get("/auth/google/callback",passport.authenticate('google', {failureRedirect:'/user/login'}),userAuth.googleSession)


//Product Controller 
router.get("/product/:id",productController.loadProductPage);

//ShopList Controller
router.get("/shop",shopController.loadShopPage);
router.get("/shop/search",shopController.searchItem);
router.get("/shop/sort",shopController.sortProduct);
router.get("/shop/category",shopController.categorySort);

//Cart Controller 
router.get("/cart",productAvailability.quantity,cartController.loadCartPage);
router.post("/cart/add",productAvailability.quantity,cartController.addProductToCart);
router.patch("/cart/quantityinc",productAvailability.quantity,cartController.cartQuantityIncrementer);
router.patch("/cart/quantitydec",productAvailability.quantity,cartController.cartQuantityDecrementer);
router.delete("/cart/delete/",productAvailability.quantity,cartController.deleteProductFromCart);


//Checkout Controller
router.get("/checkout",productAvailability.quantity,checkoutController.loadCheckout);
router.post("/checkout/address/add",checkoutController.addNewAddress);
router.get("/chekcout/address/set/:id",checkoutController.setAddress);
router.put("/checkout/address/update/:id",checkoutController.updateAddress);
router.post("/checkout/placeorder",productAvailability.quantity,checkoutController.placeOrder);


//Order Controller
router.get("/myAccount/orders/:id",orderController.loadOrderDetails);
router.get("/myAccount/order/cancel/:id",orderController.cancelOrder);

//Error Handling Middle ware..
router.use(errorHandling.errorHandlingMiddleware);




module.exports = router;
