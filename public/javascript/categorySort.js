document.addEventListener("DOMContentLoaded", () => {
    let currentPage = 1; // Default page
    const productsContainer = document.getElementById("shop-products");
    const paginationContainer = document.querySelector(".pagination");
    

    // Function to load products based on the selected page
    async function loadProducts(catType, page) {
        try {
            // Fetch products for the selected category and page
            const response = await fetch(`/user/shop/category?catType=${catType}&page=${page}`);
            const details = await response.json();

            if (details.success) {
                // Clear previous product listings
                productsContainer.innerHTML = "";

                // Render the products
                if (details.products.length > 0) {
                    const div = document.createElement("div");
                    div.classList.add("row");

                    div.innerHTML = details.products.reduce((acc, product) => {
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

                    productsContainer.appendChild(div);
                } else {
                    productsContainer.innerHTML = "<p>No products found in this category.</p>";
                }

                // Update pagination
                updatePagination(details.currentPage, details.totalPages);
            } else {
                productsContainer.innerHTML = "<p>Error fetching products. Please try again later.</p>";
            }
        } catch (error) {
            console.error("Error fetching category products:", error);
            productsContainer.innerHTML = "<p>There was an error fetching the products. Please try again later.</p>";
        }
    }

    // Function to update pagination UI
    function updatePagination(currentPage, totalPages) {
        paginationContainer.innerHTML = "";

        // Add "Previous" button
        const prevPage = document.createElement("li");
        prevPage.classList.add("page-item", currentPage === 1 ? "disabled" : "");
        prevPage.innerHTML = `<a class="page-link" href="#">‹</a>`;
        prevPage.addEventListener("click", (e) => {
            if (currentPage > 1) {
                loadProducts(catType, currentPage - 1); // Update with the correct category name
            }
        });

        paginationContainer.appendChild(prevPage);

        // Add page numbers dynamically
        for (let i = 1; i <= totalPages; i++) {
            const pageItem = document.createElement("li");
            pageItem.classList.add("page-item", i === currentPage ? "active" : "");
            pageItem.innerHTML = `<a class="page-link" href="#">${i}</a>`;
            pageItem.addEventListener("click", (e) => {
                e.preventDefault();
                loadProducts(catType, i); // Update with the correct category name
            });
            paginationContainer.appendChild(pageItem);
        }

        // Add "Next" button
        const nextPage = document.createElement("li");
        nextPage.classList.add("page-item", currentPage === totalPages ? "disabled" : "");
        nextPage.innerHTML = `<a class="page-link" href="#">›</a>`;
        nextPage.addEventListener("click", (e) => {
            if (currentPage < totalPages) {
                loadProducts(catType, currentPage + 1); // Update with the correct category name
            }
        });

        paginationContainer.appendChild(nextPage);
    }
    document.querySelectorAll(".catgo-items").forEach((item)=>{
        item.addEventListener("click",async (e)=>{
            e.preventDefault();
            const catType = e.target.textContent;
            loadProducts(catType, currentPage); 
        })
    })
    // const catType = "Hoddie"; // Default category; Update this dynamically based on user selection

    // Initially load the products for the default category and page 1
    // You can replace "Hoodie" with the default category

});