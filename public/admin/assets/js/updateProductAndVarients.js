

document.addEventListener("DOMContentLoaded",async (e)=>{

    const imagePreview = document.getElementById("imagePreview");
    const productDetails = JSON.parse(document.querySelector("#productCard").getAttribute("data-details"));
    const cropperModal = new bootstrap.Modal(document.getElementById("cropperModal"));
    let cropImage = document.getElementById("cropImage");
    const cropButton = document.getElementById("cropButton");
    let cropper;
    let selectedFiles = [];
    let currentFileIndex = 0; // Track which image is being cropped
    let variants =  productDetails.variants;
    renderVariants();

    productDetails.productImages.forEach((path, index) => {
        const imgElement = document.createElement('img');
        imgElement.src = "/" + path;
        imgElement.classList.add('img-thumbnail');
        imgElement.id = `img-${index}`;  // Modified to use a unique ID
        imgElement.style.width = "200px";  // Set width
        imgElement.style.height = "250px"; // Set height
        imgElement.style.objectFit = "cover"; // Maintain aspect ratio
    
        const removeButton = document.createElement('button');
        removeButton.textContent = 'X';
        removeButton.classList.add('remove-btn');
        removeButton.onclick = function (e) {
            e.preventDefault();
            removeImage(imgContainer);
        };
    
        const imgContainer = document.createElement('div');
        imgContainer.classList.add('img-thumbnail-container');
        imgContainer.classList.add('col')
        imgContainer.appendChild(removeButton);
        imgContainer.appendChild(imgElement);
    
        imagePreview.appendChild(imgContainer);
        selectedFiles.push(path);
    
        imgElement.onclick = function (e) {
            e.preventDefault();
            openCropperModal(imgElement);
            currentFileIndex = index; // Set currentFileIndex when the image is clicked
        };
    });
    

    function removeImage(imgContainer) {
        // Remove the image path from selectedFiles
        const index = Array.from(imgContainer.parentNode.children).indexOf(imgContainer); // Get the index of the container
        selectedFiles.splice(index, 1); // Remove from the array based on the index
    
        // Remove the image container from the DOM
        imgContainer.remove();
    
        console.log(selectedFiles);
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
                <button class="btn btn-info btn-sm mb-1 editBtn" data-index="${index}">Edit</button>
                <button class="btn btn-danger btn-sm removeBtn" data-index="${index}">Remove</button>
            </div>
        `;
        variantsContainer.appendChild(variantDiv);
    });

    // Reattach event listeners after rendering
    document.querySelectorAll(".editBtn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            const index = parseInt(e.target.getAttribute("data-index"));
            showUpdateVariantModal(index);
        });
    });

    window.removeVariant = (index) => {
        variants.splice(index, 1); // Remove the variant from the array
        renderVariants(); // Re-render the variants
    };

    document.querySelectorAll(".removeBtn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            const index = parseInt(e.target.getAttribute("data-index"));
            removeVariant(index);
        });
    });
}


    const variantsPreview = document.getElementById("variantsContainer");
    variantsPreview.querySelectorAll(".editBtn").forEach((btn)=>{
        btn.addEventListener("click",(e)=>{
            e.preventDefault();
            // console.log("click")
        })
    })

    function showUpdateVariantModal(index) {
        const variant = variants[index]; // Get the selected variant
    
        const variantModalContent = document.getElementById('variantModalContent');
        variantModalContent.innerHTML = `
            <div class="row">
                <div class="col-md-6">
                    <label for="variant_size" class="form-label">Size</label>
                    <select id="variant_size" class="form-control">
                        <option value="XS" ${variant.size === 'XS' ? 'selected' : ''}>XS</option>
                        <option value="S" ${variant.size === 'S' ? 'selected' : ''}>S</option>
                        <option value="M" ${variant.size === 'M' ? 'selected' : ''}>M</option>
                        <option value="L" ${variant.size === 'L' ? 'selected' : ''}>L</option>
                        <option value="XL" ${variant.size === 'XL' ? 'selected' : ''}>XL</option>
                        <option value="XXL" ${variant.size === 'XXL' ? 'selected' : ''}>XXL</option>
                        <option value="3XL" ${variant.size === '3XL' ? 'selected' : ''}>3XL</option>
                        <option value="4XL" ${variant.size === '4XL' ? 'selected' : ''}>4XL</option>
                        <option value="5XL" ${variant.size === '5XL' ? 'selected' : ''}>5XL</option>
                    </select>
                </div>                    
                <div class="col-md-6">
                    <label for="variant_color" class="form-label">Color</label>
                    <input type="text" id="variant_color" class="form-control" value="${variant.color}">
                </div>
            </div>
            <div class="row mt-2">
                <div class="col-md-6">
                    <label for="variant_status" class="form-label">Status</label>
                    <select id="variant_status" class="form-control">
                        <option value="Available" ${variant.status === 'Available' ? 'selected' : ''}>Available</option>
                        <option value="OutOfStock" ${variant.status === 'OutOfStock' ? 'selected' : ''}>Out of Stock</option>
                        <option value="Discontinued" ${variant.status === 'Discontinued' ? 'selected' : ''}>Discontinued</option>
                    </select>
                </div>
                <div class="col-md-6">
                    <label for="variant_price" class="form-label">Price</label>
                    <input type="number" id="variant_price" class="form-control" value="${variant.price}">
                </div>
            </div>
            <div class="row mt-2">
                <div class="col-md-6">
                    <label for="variant_quantity" class="form-label">Quantity</label>
                    <input type="number" id="variant_quantity" class="form-control" value="${variant.quantity}">
                </div>
            </div>
           
        `;
    
        // Set modal title
        document.getElementById('variantModalLabel').textContent = 'Edit Variant';
        
        // Show modal
        const variantModal = new bootstrap.Modal(document.getElementById('variantModal'));
        variantModal.show();
    
        // Attach event listener to update button
        document.getElementById("updateVariantBtn").addEventListener("click", function () {
            updateVariant(index, variantModal);
        });
    }

    function updateVariant(index, variantModal) {
        variants[index] = {
            size: document.getElementById("variant_size").value,
            color: document.getElementById("variant_color").value,
            status: document.getElementById("variant_status").value,
            price: parseFloat(document.getElementById("variant_price").value),
            quantity: parseInt(document.getElementById("variant_quantity").value),
        };
    
        console.log("Updated Variants:", variants);
    
        renderVariants(); // Re-render variants
        variantModal.hide(); // Close modal
    }

    // Select the Add Variant button
document.getElementById("addVariantBtn").addEventListener("click", function () {
    showAddVariantModal();
});

function showAddVariantModal() {
    const variantModalContent = document.getElementById('variantModalContent');
    variantModalContent.innerHTML = `
        <div class="row">
            <div class="col-md-6">
                <label for="new_variant_size" class="form-label">Size</label>
                <select value = "" id="new_variant_size" class="form-control">
                    <option value="XS">XS</option>
                    <option value="S">S</option>
                    <option value="M">M</option>
                    <option value="L">L</option>
                    <option value="XL">XL</option>
                    <option value="XXL">XXL</option>
                    <option value="3XL">3XL</option>
                    <option value="4XL">4XL</option>
                    <option value="5XL">5XL</option>
                </select>
            </div>                    
            <div class="col-md-6">
                <label for="new_variant_color" class="form-label">Color</label>
                <input type="text" id="new_variant_color" class="form-control">
            </div>
        </div>
        <div class="row mt-2">
            <div class="col-md-6">
                <label for="new_variant_status" class="form-label">Status</label>
                <select id="new_variant_status" class="form-control">
                    <option value="Available">Available</option>
                    <option value="OutOfStock">Out of Stock</option>
                    <option value="Discontinued">Discontinued</option>
                </select>
            </div>
            <div class="col-md-6">
                <label for="new_variant_price" class="form-label">Price</label>
                <input type="number" id="new_variant_price" class="form-control">
            </div>
        </div>
        <div class="row mt-2">
            <div class="col-md-6">
                <label for="new_variant_quantity" class="form-label">Quantity</label>
                <input type="number" id="new_variant_quantity" class="form-control">
            </div>
        </div>
    `;

    // Set modal title
    document.getElementById('variantModalLabel').textContent = 'Add Variant';

    // Show modal
    const variantModal = new bootstrap.Modal(document.getElementById('variantModal'));
    variantModal.show();

    // Attach event listener for adding the new variant
    // document.getElementById("updateVariantBtn").textContent = "Add Variant";
    document.getElementById("saveVariantBtn").onclick = function () {
        addVariant(variantModal);
    };
}

function addVariant(variantModal) {
    const newVariant = {
        size: document.getElementById("new_variant_size").value,
        color: document.getElementById("new_variant_color").value,
        status: document.getElementById("new_variant_status").value,
        price: parseFloat(document.getElementById("new_variant_price").value),
        quantity: parseInt(document.getElementById("new_variant_quantity").value),
    };

    // Add to the variants array
    variants.push(newVariant);
    console.log("New Variant Added:", newVariant);

    // Re-render variants
    renderVariants();

    // Close the modal
    variantModal.hide();
}

// document.getElementById("saveVariantBtn").addEventListener("click",(e)=>{
//     console.log(e)
// })

    
    
})