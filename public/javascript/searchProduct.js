document.addEventListener("DOMContentLoaded", () => {
    let debounceTimeout;
    const debounceTimelimit = 700;
    const products = document.getElementById("shop-products");
    const searchBox = document.getElementById("search-box");
    const pagination = document.querySelector(".pagination");  // Select pagination element

    let currentPage = 1;
    let totalPages = 1;

    const updatePagination = () => {
        //this is to update the pagination details





        // const pageItems = Array.from(pagination.querySelectorAll(".page-item"));
        // pageItems.forEach(item => {
        //     const pageLink = item.querySelector(".page-link");
        //     const pageNumber = parseInt(pageLink.textContent);

        //     if (pageNumber === currentPage) {
        //         item.classList.add("active");
        //     } else {
        //         item.classList.remove("active");
        //     }
        // });


    };

    const loadProducts = async () => {
        const searchQuery = searchBox.value.trim();

        try {
            let response = await fetch(`/user/shop/search?searchQuery=${searchQuery}&page=${currentPage}`);
            const data = await response.json();

            if (data.success) {
                products.innerHTML = ""; // Clear existing content
                const div = document.createElement("div");
                div.classList.add("row");

                div.innerHTML = data.products.reduce((acc, product) => {
                    // Only add product if it's not blocked
                    if (product.isBlocked === false) {
                        return acc + `
                            <div class="col-lg-4 col-md-6 col-sm-12 mb-30">
                                <div class="product-cart-wrap">
                                    <div class="product-img-action-wrap">
                                        <div class="product-img product-img-zoom">
                                            <a href="/user/product/${product._id}"> 
                                                <img class="default-img" src="/${product.productImages[0]}" alt="${product.productName}"> 
                                                <img class="hover-img" src="/${product.productImages[1]}" alt="${product.productName}"> 
                                            </a>
                                        </div>
                                        <div class="product-action-1">
                                            <a aria-label="Add To Wishlist" class="action-btn hover-up">
                                                <i class="fi-rs-heart add-to-wishlist" data-id="${product._id}" data-variantId="${product.variants[0]._id}"></i>
                                            </a>
                                        </div>
                                    </div>
                                    <div class="product-content-wrap">
                                        <h2><a href="/user/product/${product._id}">${product.productName}</a></h2>
                                        <div class="product-price">
                                            <span>₹${product.variants[0].salePrice}</span>
                                            <span class="old-price">₹${product.variants[0].price}</span>
                                        </div>
                                        <div class="product-action-1 show">
                                            
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `;

                        /*<a aria-label="Add To Cart" class="action-btn hover-up add-to-wishlist" onClick="(event)=>{event.preventDefault()}">
                                               <i class="fi-rs-shopping-bag-add"></i>
                                           </a> */
                    }
                    return acc;  // Return the accumulated string for non-blocked products
                }, "");



                products.appendChild(div);

                totalPages = data.totalPages;
                updatePagination();
            } else {
                products.innerHTML = "<p>No products found</p>";
            }
        } catch (error) {
            console.error(error);
            products.innerHTML = "<p>Error fetching products. Please try again later.</p>";
        }
    };

    // Event listener for search box input
    searchBox.addEventListener("keyup", () => {
        clearTimeout(debounceTimeout);

        debounceTimeout = setTimeout(() => {
            currentPage = 1; // Reset to first page when searching
            loadProducts();
        }, debounceTimelimit);
    });

    // Event listener for pagination links
    pagination.addEventListener("click", (e) => {
        e.preventDefault();
        const pageNumber = e.target.querySelector("#Number");
        if (e.target.classList.contains("page-link") && e.target.classList.contains("left")) {
            console.log(pageNumber)

        }
        if (e.target.classList.contains("page-link") && e.target.classList.contains("right")) {
            console.log(pageNumber)

        }

        //in this we will set the current pagenumber and again load the products
        //              console.log(e.target && e.target.classList.contains("page-link"))
        // if (e.target && e.target.classList.contains("page-link")) {

        //     const pageNumber = e.target.querySelector(".page-item")
        //     console.log("Page Number is", pageNumber);
        //     if (pageNumber !== "#" && pageNumber !== "...") {
        //         currentPage = parseInt(pageNumber);
        //         loadProducts();
        //     }
        // }

        //My Pagination Logic


    });

    // Initial products load
    loadProducts();
});