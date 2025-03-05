const products = require("../model/productScheme");
const category = require("../model/categorySchema");
const { default: mongoose } = require("mongoose");
const shopController = {};



shopController.filter = async (req, res) => {
  try {
    let product = null;
    console.log(req.body.filter);
    let filter = req.body.filter

    //   let semifilter = []
    //   semifilter = req.query.filters; // Filters as a string
    const sortType = req.query.sortType.split("-"); // Sort type as an array
    console.log("Destructured", filter, sortType);

    let sortValue = sortType[0];
    let sortIndex = (sortType[1] == null || sortType[1] === undefined) ? 1 : (sortType[1] === '0' ? -1 : 1);

    console.log("Sort Index", sortIndex);
    console.log("Sort Value", sortValue);
    console.log(filter);

    // If semifilter exists and has length, split it into an array
    //   if (semifilter && semifilter.length > 0) {
    //      semifilter.split(",").forEach(item=>filter.push(item)) // Convert filter string into an array
    //   }

    // Apply sorting and filtering based on the sort value
    if (filter.length > 0) {
      // If filters are applied, query with categories filter
      switch (sortValue) {
        case 'productName':
          console.log('call')
          product = await products.find({ category: { $in: filter } }).sort({ 'productName': sortIndex });
          break;
        case 'price':
          const updatedFilters = filter.map((el) => new mongoose.Types.ObjectId(String(el)))
          product = await products.aggregate([
            {
              $match: {
                category: { $in: updatedFilters }  // Filter products by category
              }
            },
            {
              $addFields: {
                firstVariantPrice: { $arrayElemAt: ["$variants.salePrice", 0] }  // Extract the price of the first variant
              }
            },
            {
              $sort: { firstVariantPrice: -sortIndex }  // Sort based on the extracted first variant's price
            }
          ]);
          break;
        case 'createdAt':
          product = await products.find({ category: { $in: filter } }).sort({ 'createdAt': sortIndex });
          break;
        default:
          // Default sorting by productName
          product = await products.find({ category: { $in: filter } }).sort({ 'productName': sortIndex });
          break;
      }
    } else {
      // If no filters, just sort all products
      switch (sortValue) {
        case 'productName':
          product = await products.find().sort({ 'productName': sortIndex });
          break;
        case 'price':
          product = await products.aggregate([
            {
              $addFields: {
                firstVariantPrice: { $arrayElemAt: ["$variants.salePrice", 0] }  // Extract the price of the first variant
              }
            },
            {
              $sort: { firstVariantPrice: -sortIndex }  // Sort based on the extracted first variant's price
            }
          ]);
          break;
        case 'createdAt':
          product = await products.find().sort({ 'createdAt': sortIndex });
          break;
        default:
          // Default sorting by productName
          product = await products.find().sort({ 'productName': sortIndex });
          break;
      }
    }

    console.log("Filtered Product", product);

    if (!product || product.length === 0) {
      return res.status(400).json({ success: false, message: "No Products found..." });
    }
    return res.status(200).json({ success: true, products: product });

  } catch (err) {
    console.log("Error in filter:", err);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};



shopController.loadShopPage = async (req, res) => {
  try {
    let offset = req.query.offset
    console.log("The value of Offset is ", offset);
    // const limit = 6;
    if (offset < 1 || !offset) {
      offset = 1;
    }

    const cartDetails = await products.find().populate('category')
    res.render("./user/shopList", { cartDetails, offset });
  }
  catch (error) {
    console.log("Error Loding Shop Page -", error);
  }
}

// shopController.searchItem = async (req, res) => {
//   try {
//     const { searchQuery, page = 1, limit = 10 } = req.query;
//     console.log("Search Query", searchQuery);

//     const regex = searchQuery;
//     const skip = (page - 1) * limit;  // Skip previous pages' results

//     const searchProduct = await products.find({
//       productName: {
//         $regex: regex,
//         $options: "i"
//       }
//     })
//       .skip(skip)
//       .limit(parseInt(limit));  // Limit number of results per page

//     const totalProducts = await products.countDocuments({
//       productName: {
//         $regex: regex,
//         $options: "i"
//       }
//     });

//     const totalPages = Math.ceil(totalProducts / limit);  // Calculate total pages

//     console.log("Products Found", searchProduct);

//     if (searchProduct.length) {
//       return res.status(200).json({
//         success: true,
//         products: searchProduct,
//         totalPages: totalPages,
//         currentPage: parseInt(page)
//       });
//     } else {
//       return res.status(404).json({
//         success: false,
//         products: "No Products Found.."
//       });
//     }
//   } catch (err) {
//     console.log("Error in Searching in shop", err);
//     res.status(500).json({ success: false, message: "Internal Server Error" });
//   }
// };

shopController.searchItem = async (req, res) => {
  try {
    const { searchQuery = "", page = 1, limit = 6 } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    const query = {
      productName: { $regex: searchQuery, $options: "i" },
      isDeleted: false, // Exclude deleted products
      isBlocked: false  // Exclude blocked products
    };

    // Fetch products
    const searchProduct = await products.find(query)
    // Count total matching products
    const totalProducts = await products.countDocuments(query);
    const totalPages = Math.ceil(totalProducts / limit);

    if (searchProduct.length > 0) {
      return res.status(200).json({
        success: true,
        products: searchProduct,
        totalPages: totalPages,
        currentPage: parseInt(page)
      });
    } else {
      return res.status(200).json({
        success: false,
        message: "No products found"
      });
    }
  } catch (err) {
    console.log("Error in searching shop:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};



shopController.sortProduct = async (req, res) => {
  try {
    const { sortType } = req.query; // Retrieve sortType from query parameter
    let aggregationPipeline = [];

    switch (sortType) {
      case 'productName':
        // Sort by product name in ascending order
        aggregationPipeline.push(
          { $sort: { productName: 1 } }
        );
        break;
      case 'productName-0':
        // Sort by product name in ascending order
        aggregationPipeline.push(
          { $sort: { productName: -1 } }
        );
        break;
      case 'price-0': // Price: Low to High
        // Unwind the variants array and sort by price in ascending order
        aggregationPipeline.push(
          // { $unwind: "$variants" },
          { $sort: { "variants.price": 1 } }
        );
        break;
      case 'price-1': // Price: High to Low
        // Unwind the variants array and sort by price in descending order
        aggregationPipeline.push(
          // { $unwind: "$variants" },
          { $sort: { "variants.price": -1 } }
        );
        break;
      case 'createdAt': // Release Date
        // Sort by createdAt in descending order (newest first)
        aggregationPipeline.push(
          { $sort: { createdAt: -1 } }
        );
        break;
      default:
        // No sorting applied
        break;
    }

    // If the aggregation pipeline has steps, use aggregation
    if (aggregationPipeline.length > 0) {
      const sortedProducts = await products.aggregate(aggregationPipeline);
      return res.status(200).json({ success: true, products: sortedProducts });
    } else {
      // If no aggregation needed, simply return products sorted by field
      const sortedProducts = await products.find().sort({ productName: 1 });
      return res.status(200).json({ success: true, products: sortedProducts });
    }

  } catch (error) {
    console.log("Error in sorting products", error);
    res.status(500).json({ success: false, message: "Error fetching sorted products" });
  }
};

shopController.categorySort = async (req, res) => {
  try {
    const catType = req.query.catType;
    const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
    const limit = 10; // Number of products per page
    const skip = (page - 1) * limit; // Skip previous pages

    // Find the category by name
    const categoryDetails = await category.findOne({ name: catType });
    if (!categoryDetails) {
      return res.status(404).json({ success: false, message: "Category Not Found..." });
    }

    const categoryId = categoryDetails._id.toString(); // Get category ID as a string

    // Fetch products for the selected category with pagination
    const productDetails = await products.find({ category: categoryId })
      .skip(skip) // Skip products based on the current page
      .limit(limit) // Limit the number of products per page
      .populate("category");

    const totalProducts = await products.countDocuments({ category: categoryId }); // Count total number of products
    const totalPages = Math.ceil(totalProducts / limit); // Calculate total pages

    return res.status(200).json({
      success: true,
      products: productDetails,
      currentPage: page,
      totalPages: totalPages,
      totalProducts: totalProducts
    });
  } catch (err) {
    console.log("Error in Category Sort:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};






module.exports = shopController;