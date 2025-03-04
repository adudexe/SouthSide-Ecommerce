const express = require("express");
const adminAuth = require("../middleware/adminAuth")
const admin = express.Router();
const adminController = require("../controller/admin/adminController");
const orderController = require("../controller/admin/adminOrderController");
const couponController = require("../controller/admin/couponController")


admin.get("/login", adminController.loadLoginPage);
admin.post("/login", adminController.Login);
//add admin.use
admin.get("/", adminAuth.requireAuth, adminController.loadDashboard);
admin.put("/filter", adminAuth.requireAuth, adminController.dashboardFiltering);
admin.get("/userManagement", adminAuth.requireAuth, adminController.loadUserManagement);
admin.get("/block/:id", adminController.blockUser);
admin.get("/unblock/:id", adminController.UnblockUser);
admin.get("/page/:val", adminController.pageNumber);


//Product Management
admin.get("/productManagement", adminAuth.requireAuth, adminController.loadProductManagement);
admin.get("/addProduct", adminAuth.requireAuth, adminController.addProduct);
admin.delete("/products/:id", adminAuth.requireAuth, adminController.deleteProduct);
admin.put("/products/:id", adminAuth.requireAuth, adminController.blockProduct);
admin.patch("/products/:id", adminAuth.requireAuth, adminController.unblockProduct);
admin.post("/products/add", adminAuth.requireAuth, adminController.upload, adminController.addProducts)
admin.get("/products/edit/:id", adminAuth.requireAuth, adminController.productUpdatePage)
admin.post("/products/edit", adminController.upload, adminController.updateProduct)
//Category Management
admin.get("/categoryManagement", adminAuth.requireAuth, adminController.loadCategory);
admin.post("/categoryManagement", adminAuth.requireAuth, adminController.manageCategory);
admin.get("/category/unlist/:id", adminController.unlistCategory);
admin.get("/category/list/:id", adminController.listCategory);
admin.get('/category/updateList', adminAuth.requireAuth, adminController.updateList);
admin.get('/category/update/:id', adminAuth.requireAuth, adminController.loadSpecificCategory);
admin.put('/category/update/:id', adminAuth.requireAuth, adminController.upateCategory);
admin.get('/logout', adminAuth.requireAuth, adminController.logout);

//Order Management
admin.get("/orderManagement", adminAuth.requireAuth, orderController.loadManagementPage);
admin.get("/orderManagement/details/:id", adminAuth.requireAuth, orderController.loadeOrderDetails);
admin.put("/orderManagement/details/singleStatus", adminAuth.requireAuth, orderController.changeSingleStatus);
admin.put("/orderManagement/details/bukStatus", adminAuth.requireAuth, orderController.changeBulkStatus);
// admin.get("/order/pagination", orderController.pagination);

admin.get("/coupons", adminAuth.requireAuth, couponController.loadPage);
admin.post("/coupons/add", adminAuth.requireAuth, couponController.addCoupon);
admin.delete("/coupons/delete/:id", adminAuth.requireAuth, couponController.deleteCoupon)



admin.post('/sales-report', adminAuth.requireAuth, adminController.generateSalesReport);


// admin.get("/productManagement",adminController.loadUserManagement)




module.exports = admin;