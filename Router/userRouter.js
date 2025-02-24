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
const wishlistController = require("../controller/wishlistController");
const walletController = require("../controller/walletController");
const passport = require("passport");
const errorHandling = require("../middleware/errorHandling");

// router.all("*",userAuth.isLogged); // To help keep is logged in 

// userController
router.get("/login", userController.loadLoginPage); // Remove userAuth.isLogged From here since it for just constant user....
router.post("/login", userController.userLogin);
router.get("/home", userController.loadHomePage); //Remove userAuth.isLogged
router.post("/resentOTP", userController.resendOTP);
router.get("/signup", userController.loadSignUpPage);
router.post("/signup", userController.registerUser);
router.post("/verifyOtp", userController.verifyOTP);
router.get("/userLogout", userController.userLogout);

//forgetController
router.post("/forgetPassword", forgetController.forgetPassword)
router.post("/forgetPassword/otpMatch", forgetController.OTPMatch);
router.post("/forgetPassword/newPassword", forgetController.newPassword);


//addressController
router.get("/myAccount", userAuth.isLogged, userAuth.isBlocked, addressController.loadMyAccount);
router.post("/myAccount/Address", userAuth.isLogged, userAuth.isBlocked, addressController.addAddress);
router.get("/myAccount/editAddress/:id", userAuth.isLogged, userAuth.isBlocked, addressController.getAddressById)
router.patch("/myAccount/editAddress/:id", userAuth.isLogged, addressController.updateAddresById);
router.delete("/myAccount/editAddress/:id", userAuth.isLogged, addressController.deleteAddressById);


//userController
router.patch("/myAccount/editProfile", userAuth.isLogged, userController.updateDetails);

// Google OAuth Routes
router.get("/auth/google", passport.authenticate('google', { scope: ['email', 'profile'] }));
router.get("/auth/google/callback", passport.authenticate('google', { failureRedirect: '/user/login' }), userAuth.googleSession)


//Product Controller 
router.get("/product/:id", productController.loadProductPage);

//ShopList Controller
router.get("/shop", userAuth.isLogged, userAuth.isBlocked, shopController.loadShopPage);
router.get("/shop/search", userAuth.isLogged, userAuth.isBlocked, shopController.searchItem);
router.get("/shop/sort", userAuth.isLogged, userAuth.isBlocked, shopController.sortProduct);
// router.get("/shop/category",userAuth.isLogged,userAuth.isBlocked,shopController.categorySort);
router.post("/shop/filter", shopController.filter);

//Cart Controller 
router.get("/cart", userAuth.isLogged, userAuth.isBlocked, cartController.loadCartPage);
router.post("/cart/add", userAuth.isLogged, userAuth.isBlocked, productAvailability.quantity, cartController.addProductToCart);
router.patch("/cart/quantityinc", userAuth.isLogged, userAuth.isBlocked, productAvailability.quantity, cartController.cartQuantityIncrementer);
router.patch("/cart/quantitydec", userAuth.isLogged, userAuth.isBlocked, productAvailability.quantity, cartController.cartQuantityDecrementer);
router.delete("/cart/delete/", userAuth.isLogged, userAuth.isBlocked, productAvailability.quantity, cartController.deleteProductFromCart);


//Checkout Controller
router.get("/checkout", userAuth.isLogged, userAuth.isBlocked, checkoutController.loadCheckout);
router.post("/checkout/address/add", userAuth.isLogged, userAuth.isBlocked, productAvailability.quantity, checkoutController.addNewAddress);
router.get("/chekcout/address/set/:id", userAuth.isLogged, userAuth.isBlocked, productAvailability.quantity, checkoutController.setAddress);
router.put("/checkout/address/update/:id", userAuth.isLogged, userAuth.isBlocked, productAvailability.quantity, checkoutController.updateAddress);
router.post("/checkout/placeorder", userAuth.isLogged, userAuth.isBlocked, productAvailability.quantity, checkoutController.placeOrder);
router.post("/checkout/wallet", userAuth.isLogged, userAuth.isBlocked, productAvailability.quantity, checkoutController.walletOrder);
router.post("/create-order", userAuth.isLogged, userAuth.isBlocked, checkoutController.createOrder)
router.post('/verify-payment', userAuth.isLogged, userAuth.isBlocked, checkoutController.onlinePayment);
router.post("/checkout/failed", userAuth.isLogged, userAuth.isBlocked, checkoutController.failedPayment);


//Order Controller
router.get("/myAccount/order/:id", orderController.loadOrderDetails);
router.post("/myAccount/order/cancel/:id", orderController.cancelOrder);
router.post("/myAccount/order/return/:id", orderController.returnOrder);
router.get("/order/success", orderController.orderSuccess);
router.get("/order/downloadinvoice/:id", orderController.downloadInvoice);


//Coupon Controller
router.put('/coupon/apply/:id', cartController.applyCoupon);
router.get('/coupon/remove', cartController.removeCoupon);


//Wishlist Controller
router.get("/wishlist", wishlistController.loadWishlist);
router.post("/wishlist/add/:id", wishlistController.addToWishList);
router.delete("/wishlist/delete/:id", wishlistController.deleteItem);

//Wallet Controller
// router.get("/wallet",walletController.loadWallet);



//Error Handling Middle ware..
router.use(errorHandling.errorHandlingMiddleware);




module.exports = router;
