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

// couponController.addCoupon = async (req,res) => {
//     try{
//         // console.log(req.body)
//         const {code , discount , minAmount} = req.body;
//         const newCoupon = await new Coupon({
//             code:code,
//             discount:discount,
//             minmumAmount:minAmount
//         })
//         const saved = await newCoupon.save();
//         if(!saved)
//         {
//             return res.status(500).json({success:false,message:"Internal Server Error..."});
//         }
//         return res.status(200).json({success:true,message:"Coupon Has Succesfully Added..."});
//     }
//     catch(err)
//     {
//         console.log("Error in Adding the Couponn",err);
//     }
// }
couponController.addCoupon = async (req, res) => {
    try {
        const { code, discount, minAmount, type } = req.body;

        // console.log({ code, discount, , type } )
        

        // Validate the coupon type
        if (!['fixed', 'percentage'].includes(type)) {
            return res.status(400).json({ success: false, message: "Invalid coupon type. Must be either 'fixed' or 'percentage'" });
        }

        // If it's a percentage coupon, ensure discount is between 0 and 100
        if (type === 'percentage' && (discount < 0 || discount > 90)) {
            return res.status(400).json({ success: false, message: "Discount for percentage-based coupons must be between 0 and 90." });
        }

        console.log("Min Amount",Number(minAmount));

        // Create new coupon
        const newCoupon = await new Coupon({
            code: code,
            discount: Number(discount),
            minmumAmount: Number(minAmount),
            type: type
        });

        // Save coupon to database
        const saved = await newCoupon.save();

        if (!saved) {
            return res.status(500).json({ success: false, message: "Internal Server Error..." });
        }

        return res.status(200).json({ success: true, message: "Coupon Has Successfully Been Added..." });
    } catch (err) {
        console.log("Error in Adding the Coupon", err);
        return res.status(500).json({ success: false, message: "Something went wrong!" });
    }
};



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