document.addEventListener("DOMContentLoaded", (e) => {
    try {
        let cropper;
        let selectedFiles = [];
        let currentFileIndex = 0; // Track which image is being cropped
        let variants = []; // Store the variants

        const imageInput = document.getElementById("imagesInput");
        const addVariantBtn = document.getElementById("addVariantBtn");
        const variantModal = new bootstrap.Modal(document.getElementById("variantModal"));
        const cropperModal = new bootstrap.Modal(document.getElementById("cropperModal"));
        let cropImage = document.getElementById("cropImage");
        const cropButton = document.getElementById("cropButton");
        const imagePreview = document.getElementById("imagePreview");
        const variantsContainer = document.getElementById("variantsContainer");
        const saveVariantBtn = document.getElementById("saveVariantBtn");

        // Show the modal when the Add Variant button is clicked
        addVariantBtn.addEventListener("click", () => {
            variantModal.show();
        });

        // Handle image selection for preview and cropping
        imageInput.addEventListener("change", (e) => {
            e.preventDefault();
            const files = e.target.files;
            if (files.length === 0) return;

            selectedFiles = []; // Clear previous selections
            imagePreview.innerHTML = ''; // Clear previous previews
            currentFileIndex = 0; // Reset index

            Array.from(files).forEach((file, index) => {
                
                
                if (!file.type.startsWith('image/')) {
                    Swal.fire({
                        title: "Error",
                        text: "Please Select an Image",
                        icon: "error"
                    });
                    return; // Skip this file
                }


                if (selectedFiles.length < 3) {
                    const reader = new FileReader();
                    reader.onload = function (e) {
                        const imgElement = document.createElement('img');
                        imgElement.src = e.target.result;
                        imgElement.classList.add('img-thumbnail');
                        imgElement.id = file.name;
                        imgElement.dataset.name = file.name;

                        const removeButton = document.createElement('button');
                        removeButton.textContent = 'X';
                        removeButton.classList.add('remove-btn');
                        removeButton.onclick = function () {
                            removeImage(imgElement);
                        };

                        const imgContainer = document.createElement('div');
                        imgContainer.classList.add('img-thumbnail-container');
                        imgContainer.appendChild(removeButton);
                        imgContainer.appendChild(imgElement);

                        imagePreview.appendChild(imgContainer);
                        selectedFiles.push(file);

                        // Open cropper when an image is clicked
                        imgElement.onclick = function () {
                            currentFileIndex = selectedFiles.findIndex(f => f.name === file.name); // Update current index
                            openCropperModal(imgElement);
                        };
                    };
                    reader.readAsDataURL(file);
                } else {
                    alert("You can only upload a maximum of 3 images.");
                }
            });
        });

        function removeImage(imgElement) {
            console.log(selectedFiles);
            const index = selectedFiles.findIndex(file => file.name === imgElement.dataset.name);
            if (index > -1) {
                selectedFiles.splice(index, 1); // Remove the file from the array
                imgElement.parentNode.remove(); // Remove the image from the preview
            }
        }

        function openCropperModal(imgElement) {
            cropImage.src = imgElement.src;
            cropImage.id = imgElement.id;

            // Initialize cropper only if it hasn't been initialized
            if (cropper) {
                cropper.destroy(); // Destroy previous instance if it exists
            }

            cropper = new Cropper(cropImage, {
                aspectRatio: 1, // 1:1 aspect ratio
                minContainerHeight: 500, // Minimum container height for cropping
                minContainerWidth: 500, // Minimum container width for cropping
                viewMode: 3, // Keep the crop box inside the canvas
            });

            cropperModal.show();
        }

        cropButton.addEventListener('click', function () {
            if (!cropper) {
                console.error("Cropper is not initialized.");
                return; // Exit if cropper is not initialized
            }

            // Get the cropped canvas with desired dimensions
            cropper.getCroppedCanvas({
                width: 800,
                height: 800,
                imageSmoothingEnabled: true,
                imageSmoothingQuality: 'high'
            }).toBlob((blob) => {
                if (!blob) {
                    console.error("Failed to create blob from cropped image.");
                    return;
                }

                const croppedFile = new File([blob], `cropped_image_${Date.now()}.jpg`, {
                    type: 'image/jpeg',
                    lastModified: new Date().getTime()
                });

                // Replace the selected image with the cropped one
                selectedFiles[currentFileIndex] = croppedFile;

                // Update the image preview
                document.getElementById(cropImage.id).src = URL.createObjectURL(croppedFile);

                // Hide the cropper modal and destroy the cropper instance
                cropperModal.hide();
                cropper.destroy(); // Destroy the cropper instance when done
            }, 'image/jpeg', 0.9);
        });

        // Handle the Add Variant form in the modal
        saveVariantBtn.addEventListener("click", () => {
            const variantSize = document.getElementById("variant_size").value;
            const variantColor = document.getElementById("variant_color").value;
            const variantStatus = document.getElementById("variant_status").value;
            const variantPrice = document.getElementById("variant_price").value;
            const variantQuantity = document.getElementById("variant_quantity").value;

            // Reset error messages
            resetVariantErrors();

            // Validation: Check if all fields are filled
            let valid = true;
            if (!variantSize) {
                document.getElementById("variant_size_error").style.display = "block";
                valid = false;
            }
            if (!variantColor) {
                document.getElementById("variant_color_error").style.display = "block";
                valid = false;
            }
            if (!variantStatus) {
                document.getElementById("variant_status_error").style.display = "block";
                valid = false;
            }
            if (!variantPrice) {
                document.getElementById("variant_price_error").style.display = "block";
                valid = false;
            }
            if (!variantQuantity) {
                document.getElementById("variant_quantity_error").style.display = "block";
                valid = false;
            }

            if (!valid) {
                Swal.fire({
                    title: "Error",
                    text: "Please fill in all fields correctly.",
                    icon: "error"
                });
                return;
            }

            // Create a new variant object
            const newVariant = {
                size: variantSize,
                color: variantColor,
                status: variantStatus,
                price: variantPrice,
                quantity: variantQuantity
            };

            // Add the variant to the variants array
            variants.push(newVariant);

            // Close the modal
            variantModal.hide();

            // Clear input fields
            clearVariantInputs();

            // Preview the newly added variant
            renderVariants();
        });

        // Function to reset error messages
        function resetVariantErrors() {
            document.getElementById("variant_size_error").style.display = "none";
            document.getElementById("variant_color_error").style.display = "none";
            document.getElementById("variant_status_error").style.display = "none";
            document.getElementById("variant_price_error").style.display = "none";
            document.getElementById("variant_quantity_error").style.display = "none";
        }

        // Function to clear input fields
        function clearVariantInputs() {
            document.getElementById("variant_size").value = '';
            document.getElementById("variant_color").value = '';
            document.getElementById("variant_status").value = 'Available';
            document.getElementById("variant_price").value = '';
            document.getElementById("variant_quantity").value = '';
        }

        // Function to render variants in the preview section
        function renderVariants() {
            variantsContainer.innerHTML = ''; // Clear previous variants
            variants.forEach((variant, index) => {
                const variantDiv = document.createElement('div');
                variantDiv.classList.add('col-md-4', 'mb-3');
                variantDiv.innerHTML = `
                    <div class="card p-2">
                        <h6>Variant ${index + 1}</h6>
                        <p><strong>Size:</strong> ${variant.size}</p>
                        <p><strong>Color:</strong> ${variant.color}</p>
                        <p><strong>Status:</strong> ${variant.status}</p>
                        <p><strong>Price:</strong> $${variant.price}</p>
                        <p><strong>Quantity:</strong> ${variant.quantity}</p>
                        <button class="btn btn-danger btn-sm" onclick="removeVariant(${index})">Remove</button>
                    </div>
                `;
                variantsContainer.appendChild(variantDiv);
            });
        }

        // Remove variant functionality
        window.removeVariant = (index) => {
            variants.splice(index, 1); // Remove the variant from the array
            renderVariants(); // Re-render the variants
        };

        // Handle form submission
        document.getElementById("publishBtn").addEventListener("click", async (e) => {
            e.preventDefault();

            // Variables to track validation
            let formValid = true;
            let errorMessage = "";

            // Retrieve form fields and error elements
            const formFields = [
                { element: document.getElementById("product_title"), errorElement: document.getElementById("product_title_error") },
                { element: document.getElementById("product_offer"), errorElement: document.getElementById("product_offer_error") },
                // { element: document.getElementById("product_brand"), errorElement: document.getElementById("product_brand_error") },
                { element: document.getElementById("product_category"), errorElement: document.getElementById("product_category_error") },
                { element: document.getElementById("product_description"), errorElement: document.getElementById("product_description_error") }
            ];

            // Validate form fields
            formFields.forEach((field) => {
                if (!field.element.value) {
                    field.errorElement.style.display = "block";
                    field.element.classList.add("border", "border-danger");
                    formValid = false;
                } else {
                    field.errorElement.style.display = "none";
                    field.element.classList.remove("border", "border-danger");
                }
            });

            // Image validation: Check if images are selected and within the limit
            if (selectedFiles.length === 0) {
                formValid = false;
                errorMessage = "At least one Image must be selected";
            } else if (selectedFiles.length > 3) {
                formValid = false;
                errorMessage = "You can add only a maximum of 3 images";
            }

            // Check if variants are added
            if (variants.length === 0) {
                formValid = false;
                errorMessage = "At least one variant should be added.";
            }

            // If form is not valid, show an error message
            if (!formValid) {
                Swal.fire({
                    title: "Error",
                    text: errorMessage || "Please fill in the required fields.",
                    icon: "error"
                });
                return;
            }

            // Create FormData object for submission
            const formData = new FormData();
            formData.append('productTitle', document.getElementById("product_title").value);
            formData.append('productOffer', document.getElementById("product_offer").value);
            // formData.append('productBrand', document.getElementById("product_brand").value);
            formData.append('productCategory', document.getElementById("product_category").value);
            formData.append('productDescription', document.getElementById("product_description").value);
            formData.append('variants', JSON.stringify(variants));

            // Append selected images (either base64 or file objects)
            selectedFiles.forEach((image, index) => {
                formData.append(`image_${index + 1}`, image);
            });

            // Submit the form data to the server
            try {
                const response = await fetch("/admin/products/add", {
                    method: "POST",
                    body: formData
                });

                const data = await response.json();

                if (data.success) {
                    Swal.fire({
                        title: "Success",
                        text: data.message || "Product Added Successfully",
                        icon: "success"
                    });

                    // Reset the form and clear images
                    resetForm();
                } else {
                    Swal.fire({
                        title: "Error",
                        text: data.message || "Failed to add product",
                        icon: "error"
                    });
                }
            } catch (error) {
                Swal.fire({
                    title: "Error",
                    text: "Something went wrong during the submission. Please try again.",
                    icon: "error"
                });
                console.error("Error submitting the form:", error);
            }
        });

        // Reset form fields and images
        function resetForm() {
            document.getElementById("imagePreview").innerHTML = ''; // Clear image previews
            document.getElementById("product_title").value = "";
            document.getElementById("product_offer").value = "";
            // document.getElementById("product_brand").value = "";
            document.getElementById("product_category").value = "";
            document.getElementById("product_description").value = "";
            selectedFiles = [];
            variants = [];
            document.getElementById("variantsPreview").innerHTML = "";
        }
    } catch (error) {
        console.log("Error in Product&VariantValidation", error);
    }
});
