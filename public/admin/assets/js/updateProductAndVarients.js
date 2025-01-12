console.log("hi");
document.addEventListener("DOMContentLoaded", () => {
    const addVariantBtn = document.getElementById("addVariantBtn");
    const variantModal = new bootstrap.Modal(document.getElementById("variantModal"));
    const saveVariantBtn = document.getElementById("saveVariantBtn");

    const variantsContainer = document.getElementById("variantsContainer");
    const productForm = document.getElementById("productForm");

    let variants = [];

    // Show the modal when the Add Variant button is clicked
    addVariantBtn.addEventListener("click", () => {
        variantModal.show();
    });

    // Handle saving variant details
    saveVariantBtn.addEventListener("click", () => {
        const size = document.getElementById("variant_size").value;
        const color = document.getElementById("variant_color").value;
        const sku = document.getElementById("variant_sku").value;
        const price = document.getElementById("variant_price").value;
        const quantity = document.getElementById("variant_quantity").value;

        // Basic validation to ensure all fields are filled
        if (size && color && sku && price && quantity) {
            // Save the variant
            const variant = { size, color, sku, price, quantity };

            // Add to the variants array
            variants.push(variant);

            // Close the modal
            variantModal.hide();

            // Reset the form fields
            document.getElementById("variant_size").value = "";
            document.getElementById("variant_color").value = "";
            document.getElementById("variant_sku").value = "";
            document.getElementById("variant_price").value = "";
            document.getElementById("variant_quantity").value = "";

            // Update the preview
            updateVariantsPreview();
        } else {
            Swal.fire({
                title: "Error",
                text: "All fields are required for the variant.",
                icon: "error"
            });
        }
    });

    // Function to update the preview section with the list of variants
    function updateVariantsPreview() {
        variantsContainer.innerHTML = "";
        variants.forEach((variant, index) => {
            const variantElement = document.createElement("div");
            variantElement.classList.add("variant-preview", "mb-2", "p-2", "border");

            variantElement.innerHTML = `
                <strong>Variant ${index + 1}</strong>
                <p><strong>Size:</strong> ${variant.size}</p>
                <p><strong>Color:</strong> ${variant.color}</p>
                <p><strong>SKU:</strong> ${variant.sku}</p>
                <p><strong>Price:</strong> ${variant.price}</p>
                <p><strong>Quantity:</strong> ${variant.quantity}</p>
            `;

            variantsContainer.appendChild(variantElement);
        });
    }

    // On form submission, you can send the variants along with the rest of the form data
    productForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const data = new FormData(productForm);
        data.append("variants", JSON.stringify(variants)); // Append variants to the form data

        fetch("/admin/products/add", {
            method: "POST",
            body: data,
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                Swal.fire({
                    title: "Success",
                    text: "Product added successfully with variants!",
                    icon: "success",
                });
            } else {
                Swal.fire({
                    title: "Error",
                    text: "Failed to add product.",
                    icon: "error",
                });
            }
        });
    });
});