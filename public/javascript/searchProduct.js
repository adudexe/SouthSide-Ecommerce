document.addEventListener("DOMContentLoaded", () => {
    let debounceTimeout;
    const debounceTimelimit = 700;
    const products = document.getElementById("shop-products");
    const searchBox = document.getElementById("search-box");
    const pagination = document.querySelector(".pagination");  // Select pagination element

    let currentPage = 1;
    let totalPages = 1;

    const updatePagination = () => {
        const pageItems = Array.from(pagination.querySelectorAll(".page-item"));
        pageItems.forEach(item => {
            const pageLink = item.querySelector(".page-link");
            const pageNumber = parseInt(pageLink.textContent);
            
            if (pageNumber === currentPage) {
                item.classList.add("active");
            } else {
                item.classList.remove("active");
            }
        });
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

                // Generate product list HTML
                div.innerHTML = data.products.reduce((acc, product) => {
                    return acc + `
                        <div class="col-lg-4 col-md-6 col-sm-12 mb-30">
                            <div class="product-cart-wrap">
                                <div class="product-img-action-wrap">
                                    <div class="product-img product-img-zoom">
                                        <a href="shop-product-right.html"> 
                                            <img class="default-img" src="/${product.productImages[0]}" alt=""> 
                                            <img class="hover-img" src="/${product.productImages[1]}" alt=""> 
                                        </a>
                                    </div>
                                    <div class="product-action-1">
                                        <a aria-label="Quick view" class="action-btn hover-up" data-bs-toggle="modal" data-bs-target="#quickViewModal">
                                            <i class="fi-rs-search"></i>
                                        </a>
                                        <a aria-label="Add To Wishlist" class="action-btn hover-up" href="shop-wishlist.html">
                                            <i class="fi-rs-heart"></i>
                                        </a>
                                        <a aria-label="Compare" class="action-btn hover-up" href="shop-compare.html">
                                            <i class="fi-rs-shuffle"></i>
                                        </a>
                                    </div>
                                </div>
                                <div class="product-content-wrap">
                                    <h2><a href="shop-product-right.html">${product.productName}</a></h2>
                                    <div class="product-price">
                                        <span>$${product.variants[0].price}</span>
                                        <span class="old-price">$${product.oldPrice}</span>
                                    </div>
                                    <div class="product-action-1 show">
                                        <a aria-label="Add To Cart" class="action-btn hover-up" href="shop-cart.html">
                                            <i class="fi-rs-shopping-bag-add"></i>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
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
        if (e.target && e.target.classList.contains("page-link")) {
            const pageNumber = e.target.getAttribute("href");
            if (pageNumber !== "#" && pageNumber !== "...") {
                currentPage = parseInt(pageNumber);
                loadProducts();
            }
        }
    });

    // Initial products load
    loadProducts();
});