const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
    }
});

try {
    const cardBody = document.getElementById("card-body");

    // Delegate the event listener for delete buttons
    cardBody.addEventListener("click", async (e) => {
        if (e.target.classList.contains("delete-btn")) {
            const productId = e.target.getAttribute("data-id");

            // Show confirmation prompt
            let result = await Swal.fire({
                title: "Are you sure?",
                text: "You won't be able to revert this!",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "Yes, delete it!"
            });

            if (result.isConfirmed) {
                // Send DELETE request to the server
                const response = await fetch(`/admin/products/${productId}`, {
                    method: "DELETE"
                });

                const details = await response.json();
                console.log(details);

                if (response.ok) {
                    // Show success message
                    Toast.fire({
                        icon: "success",
                        title: details.message || "Product Deleted Successfully"
                    });

                    // Re-render the product list after deletion
                    const updatedProducts = details.product; // Assuming response contains updated product list
                    cardBody.innerHTML = ""; // Clear the existing products
                    let value = updatedProducts.find((item)=>{
                        return (!item.isDeleted);
                    })
                    console.log(value);
                    if(value)
                    {
                        // Dynamically render each product
                        updatedProducts.forEach((element) => {
                            if (!element.isDeleted) {
                                const itemList = document.createElement("article");
                                itemList.classList.add("itemlist");
                                itemList.innerHTML = `
                                    <div class="row align-items-center">
                                        <div class="col-lg-4 col-sm-4 col-8 flex-grow-1 col-name">
                                            <a class="itemside" href="#">
                                                <div class="left">
                                                    <img src="/${element.productImages[0]}" class="img-sm img-thumbnail" alt="Item">
                                                </div>
                                                <div class="info">
                                                    <h6 class="mb-0">${element.productName}</h6>
                                                </div>
                                            </a>
                                        </div>
                                        <div class="col-lg-2 col-sm-2 col-4 col-price">
                                            <span>$${element.salePrice}</span>
                                        </div>
                                        <div class="col-lg-1 col-sm-2 col-4 col-date">
                                            <span>${new Date(element.createdAt).toLocaleDateString('en-GB')}</span>
                                        </div>
                                        <div class="col-lg-2 col-sm-2 col-4 col-action text-end">
                                            <a href="/admin/product/edit/${element._id}" class="btn btn-sm font-sm rounded btn-brand">Edit</a>
                                            <a class="btn btn-sm font-sm btn-light rounded delete-btn" data-id="${element._id}">Delete</a>
                                        </div>
                                    </div>
                                `;
                                cardBody.appendChild(itemList);
                            }
                        });
                    }
                    else
                    {
                        cardBody.innerHTML = `<p>No Products Found</p>`
                    }
                } else {
                    // Show error message
                    Toast.fire({
                        icon: "error",
                        title: details.message || "Internal Server Error"
                    });
                }
            }
        }
    });

} catch (error) {
    console.log("Error in Product Deletion and rendering", error);
}