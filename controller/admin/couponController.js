const Coupon = require("../../model/couponSchema");
const couponController = {}


couponController.loadPage = async (req,res) => {
    try{
        const Coupons = await Coupon.find();
        console.log("Coupons",Coupons);
        res.render("./admin/coupon",{Coupons});
    }   
    catch(err)
    {
        console.log("Erro in loading the Coupon Pager",err);
    }
}

couponController.addCoupon = async (req,res) => {
    try{
        // console.log(req.body)
        const {code , discount , minAmount} = req.body;
        const newCoupon = await new Coupon({
            code:code,
            discount:discount,
            minmumAmount:minAmount
        })
        const saved = await newCoupon.save();
        if(!saved)
        {
            return res.status(500).json({success:false,message:"Internal Server Error..."});
        }
        return res.status(200).json({success:true,message:"Coupon Has Succesfully Added..."});
    }
    catch(err)
    {
        console.log("Error in Adding the Couponn",err);
    }
}


couponController.deleteCoupon = async (req,res) => {
    try{
        const couponId = req.params.id;
        const deletCoupon = await Coupon.findByIdAndDelete(couponId,{new:true});
        if(!deletCoupon)
        {
            return res.status(500).json({success:false,message:"Internal Server Error.."});
        }
        return res.status(200).json({success:true,message:"Product Has Been Deleted"});
    }
    catch(err)
    {
        console.log("Error in Deleting the Coupon",err);
    }
}




module.exports = couponController;