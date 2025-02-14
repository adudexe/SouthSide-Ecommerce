// document.addEventListener("DOMContentLoaded", () => {
//     let currentPage = 1; // Default page
//     const productsContainer = document.getElementById("shop-products");
//     const paginationContainer = document.querySelector(".pagination");
    

//     // Function to load products based on the selected page
//     async function loadProducts(catType, page) {
//         try {
//             // Fetch products for the selected category and page
//             const response = await fetch(`/user/shop/category?catType=${catType}&page=${page}`);
//             const details = await response.json();

//             if (details.success) {
//                 // Clear previous product listings
//                 productsContainer.innerHTML = "";

//                 // Render the products
//                 if (details.products.length > 0) {
//                     const div = document.createElement("div");
//                     div.classList.add("row");

//                     div.innerHTML = details.products.reduce((acc, product) => {
//                         if (!product.isDeleted && !product.isBlocked) {
//                             return acc + `
//                                 <div class="col-lg-4 col-md-6 col-sm-12 mb-30">
//                                     <div class="product-cart-wrap">
//                                         <div class="product-img-action-wrap">
//                                             <div class="product-img product-img-zoom">
//                                                 <a href="/user/product/${product._id}">
//                                                     <img class="default-img" src="/${product.productImages[0]}" alt="">
//                                                     <img class="hover-img" src="/${product.productImages[1]}" alt="">
//                                                 </a>
//                                             </div>
//                                             <div class="product-action-1">
//                                                 <a aria-label="Add To Wishlist" class="action-btn hover-up ">
//                                                     <i class="fi-rs-heart add-to-wishlist" data-id="${product._id}" data-variantId="${product.variants[0]._id}"></i>
//                                                 </a>
//                                             </div>
//                                         </div>
//                                         <div class="product-content-wrap">
//                                             <h2><a href="/user/product/${product._id}">${product.productName}</a></h2>
//                                             <div class="product-price">
//                                                 <span>$${product.variants[0].salePrice}</span>
//                                                 <span class="old-price">$${product.variants[0].price}</span>
//                                             </div>
//                                             <div class="product-action-1 show">
//                                                 <a aria-label="Add To Cart" class="action-btn hover-up" href="shop-cart.html">
//                                                     <i class="fi-rs-shopping-bag-add"></i>
//                                                 </a>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 </div>
//                             `;
//                         }
//                         return acc;
//                     }, "");
                    

//                     productsContainer.appendChild(div);
//                 } else {
//                     productsContainer.innerHTML = "<p>No products found in this category.</p>";
//                 }

//                 // Update pagination
//                 updatePagination(details.currentPage, details.totalPages);
//             } else {
//                 productsContainer.innerHTML = "<p>Error fetching products. Please try again later.</p>";
//             }
//         } catch (error) {
//             console.error("Error fetching category products:", error);
//             productsContainer.innerHTML = "<p>There was an error fetching the products. Please try again later.</p>";
//         }
//     }

//     // Function to update pagination UI
//     function updatePagination(currentPage, totalPages) {
//         paginationContainer.innerHTML = "";

//         // Add "Previous" button
//         const prevPage = document.createElement("li");
//         prevPage.classList.add("page-item", currentPage === 1 ? "disabled" : "");
//         prevPage.innerHTML = `<a class="page-link" href="#">‹</a>`;
//         prevPage.addEventListener("click", (e) => {
//             if (currentPage > 1) {
//                 loadProducts(catType, currentPage - 1); // Update with the correct category name
//             }
//         });

//         paginationContainer.appendChild(prevPage);

//         // Add page numbers dynamically
//         for (let i = 1; i <= totalPages; i++) {
//             const pageItem = document.createElement("li");
//             pageItem.classList.add("page-item", i === currentPage ? "active" : "");
//             pageItem.innerHTML = `<a class="page-link" href="#">${i}</a>`;
//             pageItem.addEventListener("click", (e) => {
//                 e.preventDefault();
//                 loadProducts(catType, i); // Update with the correct category name
//             });
//             paginationContainer.appendChild(pageItem);
//         }

//         // Add "Next" button
//         const nextPage = document.createElement("li");
//         nextPage.classList.add("page-item", currentPage === totalPages ? "disabled" : "");
//         nextPage.innerHTML = `<a class="page-link" href="#">›</a>`;
//         nextPage.addEventListener("click", (e) => {
//             if (currentPage < totalPages) {
//                 loadProducts(catType, currentPage + 1); // Update with the correct category name
//             }
//         });

//         paginationContainer.appendChild(nextPage);
//     }
//     document.querySelectorAll(".catgo-items").forEach((item)=>{
//         item.addEventListener("click",async (e)=>{
//             e.preventDefault();
//             const catType = e.target.textContent;
//             loadProducts(catType, currentPage); 
//         })
//     })
//     // const catType = "Hoddie"; // Default category; Update this dynamically based on user selection

//     // Initially load the products for the default category and page 1
//     // You can replace "Hoodie" with the default category

// });

const products = document.getElementById("shop-products");
const sortDropdown = document.getElementById("sort-dropdown");
const sortCover = document.querySelector(".sort-by-cover");

// Define an array for storing the filtering elements
let filter = [];
let sortTyp = "productName";
let debounceTimeout;

// Handle filter checkboxes
document.querySelectorAll(".filterCheck").forEach((item) => {
    item.addEventListener("click", (e) => {
        if (e.target.checked) {
            filter.push(e.target.value);
        } else {
            filter.splice(filter.indexOf(e.target.value), 1);
        }
    });
});

// Handle sorting dropdown
sortDropdown.addEventListener("click", (e) => {
    if (e.target.tagName === "A") {
        sortTyp = e.target.getAttribute("data-value");
        const newValue = e.target.innerHTML;

        // Update the selected sort option displayed
        const span = document.createElement("span");
        span.innerHTML = `${newValue} <i class="fi-rs-angle-small-down"></i>`;
        const sortBy = document.getElementById("sortBy");
        sortBy.innerHTML = ''; // Clear the current text
        sortBy.appendChild(span);

        // Close the dropdown
        sortDropdown.parentElement.classList.remove("show");
        sortCover.classList.remove("show");
    }
});

// Apply filter with debounce
document.getElementById("apply-filter-btn").addEventListener("click", async (e) => {
    e.preventDefault();
    debounce(500);  // You can set debounce delay time here
});

function debounce(time) {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
        filterFunction();
    }, time);
}

async function filterFunction() {
    try {
        console.log("Filters:", filter);
        console.log("Sort Type:", sortTyp);

        // Show loading indicator while fetching
        products.innerHTML = '<p>Loading...</p>';

        const response = await fetch(`/user/shop/filter?filters=${filter.join(",")}&sortType=${sortTyp}`, {
            method: "POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({filter})
        });

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
                                        <span>$${product.variants[0].salePrice}</span>
                                        <span class="old-price">$${product.variants[0].price}</span>
                                    </div>
                                    <div class="product-action-1 show">
                                        <a aria-label="Add To Cart" class="action-btn hover-up add-to-wishlist" onClick="(event)=>{event.preventDefault()}">
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
    } catch (err) {
        console.log("Error in filterFunction", err);
        products.innerHTML = "<p>Error fetching products. Please try again later.</p>";
    }
}

// Clear all filters
document.getElementById("clear-filter-btn").addEventListener("click", (e) => {
    document.querySelectorAll(".filterCheck").forEach((item) => {
        item.checked = false;
    });
    filter = [];
    console.log("Filters cleared:", filter);

    // Reset the product display (fetch default products)
    filterFunction();
});
