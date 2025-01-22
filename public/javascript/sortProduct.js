document.addEventListener("DOMContentLoaded", () => {
    const sortDropdown = document.getElementById("sort-dropdown");
    const sortCover = document.querySelector(".sort-by-cover");
    const products = document.getElementById("shop-products");
    const sortBy = document.getElementById("sortBy");
    const sortDropdownWrap = document.querySelector(".sort-by-dropdown");

    // Toggle dropdown visibility when clicking on the sort button
    sortCover.addEventListener("click", () => {
        // sortDropdown.classList.contains("show")  ? sortDropdown.classList.remove("show") : sortDropdown.classList.add("show")
    });

    // Handle selection of sorting option
    sortDropdown.addEventListener("click", async (e) => {
        if (e.target.tagName === 'A') {
            
            const newValue = e.target.innerHTML;
            const sortType = e.target.getAttribute("data-value");

            // Update the selected sort option displayed
            const span = document.createElement("span");
            span.innerHTML = `${newValue} <i class="fi-rs-angle-small-down"></i>`;
            sortBy.innerHTML = ''; // Clear the current text
            sortBy.appendChild(span);

            // Close the dropdown
            sortDropdown.parentElement.classList.remove("show");
            sortCover.classList.remove("show")

            // Make an API call to sort products based on the selected sort option
            try {
                const response = await fetch(`/user/shop/sort?sortType=${sortType}`);
                const details = await response.json();

                if (details.success) {
                    // Clear previous products
                    products.innerHTML = ""; 

                    // Check if there are products in the response
                    if (details.products && details.products.length > 0) {
                        const div = document.createElement("div");
                        div.classList.add("row");

                        // Generate product list HTML
                        div.innerHTML = details.products.reduce((acc, product) => {
                            return acc + `
                                <div class="col-lg-4 col-md-6 col-sm-12 mb-30">
                                    <div class="product-cart-wrap">
                                        <div class="product-img-action-wrap">
                                            <div class="product-img product-img-zoom">
                                                <a href="/user/product/${product._id}"> 
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
                                            <h2><a href="/user/product/${product._id}">${product.productName}</a></h2>
                                            <div class="product-price">
                                                <span>$${product.variants[0].salePrice}</span>
                                                <span class="old-price">$${product.variants[0].price}</span>
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
                    } else {
                        products.innerHTML = "<p>No products found based on your criteria.</p>";
                    }
                } else {
                    products.innerHTML = "<p>Error fetching products. Please try again later.</p>";
                }
            } catch (error) {
                console.error("Error fetching sorted products:", error);
                products.innerHTML = "<p>There was an error fetching the products. Please try again later.</p>";
            }
        }
    });
});