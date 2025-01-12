const express = require("express");
const adminAuth = require("../middleware/adminAuth")
const admin =  express.Router();
const adminController = require("../controller/admin/adminController");


admin.get("/login",adminController.loadLoginPage);
admin.post("/login",adminController.Login);

admin.get("/",adminAuth.requireAuth,adminController.loadDashboard);
admin.get("/userManagement",adminAuth.requireAuth,adminController.loadUserManagement);
admin.get("/block/:id",adminController.blockUser);
admin.get("/unblock/:id",adminController.UnblockUser); 
admin.get("/page/:val",adminController.pageNumber);



admin.get("/productManagement",adminAuth.requireAuth,adminController.loadProductManagement);
admin.get("/addProduct",adminAuth.requireAuth,adminController.addProduct);
admin.delete("/products/:id",adminAuth.requireAuth,adminController.deleteProduct);
admin.post("/products/add",adminAuth.requireAuth,adminController.upload,adminController.addProducts)
admin.get("/products/edit/:id",adminAuth.requireAuth,adminController.productUpdatePage)


admin.get("/categoryManagement",adminAuth.requireAuth,adminController.loadCategory);
admin.post("/categoryManagement",adminAuth.requireAuth,adminController.manageCategory);
admin.get("/category/unlist/:id",adminController.unlistCategory);
admin.get("/category/list/:id",adminController.listCategory);
admin.get('/category/updateList',adminAuth.requireAuth,adminController.updateList );
admin.get('/logout',adminAuth.requireAuth,adminController.logout);


// admin.get("/productManagement",adminController.loadUserManagement)




module.exports = admin;