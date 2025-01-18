const express = require("express");
const router = express.Router();
const userAuth = require("../middleware/auth");
const userController = require("../controller/user/userController");
const addressController = require("../controller/addressController");
const productController = require("../controller/productController");
const shopController = require("../controller/shopController");
const cartController = require("../controller/cartController");
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
router.get("/cart",cartController.loadCartPage);
router.post("/cart/add",cartController.addProductToCart);
router.patch("/cart/quantityinc",cartController.cartQuantityIncrementer);
router.patch("/cart/quantitydec",cartController.cartQuantityDecrementer);
router.delete("/cart/delete/",cartController.deleteProductFromCart);




//Error Handling Middle ware..
router.use(errorHandling.errorHandlingMiddleware);




module.exports = router;
