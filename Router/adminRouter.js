const express = require("express");
const adminAuth = require("../middleware/adminAuth")
const admin =  express.Router();
const adminController = require("../controller/admin/adminController");
const orderController = require("../controller/admin/adminOrderController");
const couponController = require("../controller/admin/couponController")


admin.get("/login",adminController.loadLoginPage);
admin.post("/login",adminController.Login);
//add admin.use
admin.get("/",adminAuth.requireAuth,adminController.loadDashboard);
admin.get("/userManagement",adminAuth.requireAuth,adminController.loadUserManagement);
admin.get("/block/:id",adminController.blockUser);
admin.get("/unblock/:id",adminController.UnblockUser); 
admin.get("/page/:val",adminController.pageNumber);


//Product Management
admin.get("/productManagement",adminAuth.requireAuth,adminController.loadProductManagement);
admin.get("/addProduct",adminAuth.requireAuth,adminController.addProduct);
admin.delete("/products/:id",adminAuth.requireAuth,adminController.deleteProduct);
admin.post("/products/add",adminAuth.requireAuth,adminController.upload,adminController.addProducts)
admin.get("/products/edit/:id",adminAuth.requireAuth,adminController.productUpdatePage)
admin.put("/products/edit",adminAuth.requireAuth,adminController.updateProduct)
//Category Management
admin.get("/categoryManagement",adminAuth.requireAuth,adminController.loadCategory);
admin.post("/categoryManagement",adminAuth.requireAuth,adminController.manageCategory);
admin.get("/category/unlist/:id",adminController.unlistCategory);
admin.get("/category/list/:id",adminController.listCategory);
admin.get('/category/updateList',adminAuth.requireAuth,adminController.updateList );
admin.get('/logout',adminAuth.requireAuth,adminController.logout);

//Order Management
admin.get("/orderManagement",orderController.loadManagementPage);
admin.get("/orderManagement/details/:id",orderController.loadeOrderDetails);
admin.put("/orderManagement/details/singleStatus",orderController.changeSingleStatus);
admin.put("/orderManagement/details/bukStatus",orderController.changeBulkStatus);


admin.get("/coupons",couponController.loadPage);
admin.post("/coupons/add",couponController.addCoupon);
admin.delete("/coupons/delete/:id",couponController.deleteCoupon)


// admin.get("/productManagement",adminController.loadUserManagement)




module.exports = admin;