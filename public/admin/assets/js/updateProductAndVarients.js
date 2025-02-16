// document.addEventListener("DOMContentLoaded",async (e)=>{

//     const imagePreview = document.getElementById("imagePreview");
//     const productDetails = JSON.parse(document.querySelector("#productCard").getAttribute("data-details"));
//     const cropperModal = document.getElementById("cropperModal");
//     const cropImage = document.getElementById("cropImage");
//     const cropButton = document.getElementById("cropButton");
//     let cropper = null;
//     let selectedFiles = [];
//     let currentFileIndex = 0; // Track which image is being cropped
//     let variants =  productDetails.variants;
//     renderVariants();

//     // Initialize Bootstrap modal
//     const cropperModalInstance = new bootstrap.Modal(cropperModal);

//     // Function to destroy cropper instance
//     function destroyCropper() {
//         if (cropper) {
//             cropper.destroy();
//             cropper = null;
//         }
//     }

//     // Handle modal close - destroy cropper instance
//     cropperModal.addEventListener('hidden.bs.modal', function () {
//         destroyCropper();
//     });

//     productDetails.productImages.forEach((path, index) => {
//         const imgElement = document.createElement('img');
//         imgElement.src = "/" + path;
//         imgElement.classList.add('img-thumbnail');
//         imgElement.id = `img-${index}`;  // Modified to use a unique ID
//         imgElement.style.width = "200px";  // Set width
//         imgElement.style.height = "250px"; // Set height
//         imgElement.style.objectFit = "cover"; // Maintain aspect ratio
    
//         const removeButton = document.createElement('button');
//         removeButton.textContent = 'X';
//         removeButton.classList.add('remove-btn');
//         removeButton.onclick = function (e) {
//             e.preventDefault();
//             removeImage(imgContainer);
//         };
    
//         const imgContainer = document.createElement('div');
//         imgContainer.classList.add('img-thumbnail-container');
//         imgContainer.classList.add('col')
//         imgContainer.appendChild(removeButton);
//         imgContainer.appendChild(imgElement);
    
//         imagePreview.appendChild(imgContainer);
//         selectedFiles.push(path);
    
//         imgElement.onclick = function (e) {
//             e.preventDefault();
//             openCropperModal(imgElement);
//             currentFileIndex = index; // Set currentFileIndex when the image is clicked
//         };
//     });

//     // Handle new image uploads with size validation and loading indicator
//     document.getElementById('imagesInput').addEventListener('change', function(e) {
//         const files = Array.from(e.target.files);
//         const maxFileSize = 5 * 1024 * 1024; // 5MB
        
//         files.forEach((file, index) => {
//             if (file.type.startsWith('image/')) {
//                 if (file.size > maxFileSize) {
//                     alert(`File ${file.name} is too large. Maximum size is 5MB`);
//                     return;
//                 }

//                 const reader = new FileReader();
//                 const loadingDiv = document.createElement('div');
//                 loadingDiv.classList.add('img-thumbnail-container', 'col');
//                 loadingDiv.innerHTML = `
//                     <div class="text-center p-3">
//                         <div class="spinner-border text-primary" role="status">
//                             <span class="visually-hidden">Loading...</span>
//                         </div>
//                         <p class="mt-2">Loading image...</p>
//                     </div>
//                 `;
//                 imagePreview.appendChild(loadingDiv);
                
//                 reader.onload = function(e) {
//                     // Create a temporary image to get dimensions
//                     const img = new Image();
//                     img.onload = function() {
//                         // Remove loading indicator
//                         loadingDiv.remove();
                        
//                         const imgElement = document.createElement('img');
//                         imgElement.src = e.target.result;
//                         imgElement.classList.add('img-thumbnail');
//                         imgElement.id = `new-img-${Date.now()}-${index}`;
//                         imgElement.style.width = "200px";
//                         imgElement.style.height = "250px";
//                         imgElement.style.objectFit = "cover";
                        
//                         const removeButton = document.createElement('button');
//                         removeButton.textContent = 'X';
//                         removeButton.classList.add('remove-btn');
                        
//                         const imgContainer = document.createElement('div');
//                         imgContainer.classList.add('img-thumbnail-container', 'col');
//                         imgContainer.appendChild(removeButton);
//                         imgContainer.appendChild(imgElement);
                        
//                         imagePreview.appendChild(imgContainer);
                        
//                         // Create a compressed version of the image before adding to selectedFiles
//                         const canvas = document.createElement('canvas');
//                         const ctx = canvas.getContext('2d');
//                         const MAX_WIDTH = 1200;
//                         const MAX_HEIGHT = 1500;
//                         let width = img.width;
//                         let height = img.height;
                        
//                         // Calculate new dimensions
//                         if (width > height) {
//                             if (width > MAX_WIDTH) {
//                                 height *= MAX_WIDTH / width;
//                                 width = MAX_WIDTH;
//                             }
//                         } else {
//                             if (height > MAX_HEIGHT) {
//                                 width *= MAX_HEIGHT / height;
//                                 height = MAX_HEIGHT;
//                             }
//                         }
                        
//                         canvas.width = width;
//                         canvas.height = height;
//                         ctx.drawImage(img, 0, 0, width, height);
                        
//                         // Convert canvas to blob
//                         canvas.toBlob(function(blob) {
//                             const compressedFile = new File([blob], file.name, {
//                                 type: 'image/jpeg',
//                                 lastModified: Date.now()
//                             });
//                             selectedFiles.push(compressedFile);
//                         }, 'image/jpeg', 0.7);
                        
//                         removeButton.onclick = function(e) {
//                             e.preventDefault();
//                             removeImage(imgContainer);
//                         };
                        
//                         imgElement.onclick = function(e) {
//                             e.preventDefault();
//                             openCropperModal(imgElement);
//                             currentFileIndex = selectedFiles.length - 1;
//                         };
//                     };
//                     img.src = e.target.result;
//                 };
                
//                 reader.readAsDataURL(file);
//             }
//         });
//     });

//     function removeImage(imgContainer) {
//         // Remove the image path from selectedFiles
//         const index = Array.from(imgContainer.parentNode.children).indexOf(imgContainer); // Get the index of the container
//         selectedFiles.splice(index, 1); // Remove from the array based on the index
    
//         // Remove the image container from the DOM
//         imgContainer.remove();
    
//         console.log(selectedFiles);
//     }

//     function openCropperModal(imgElement) {
//         // Show loading indicator in modal
//         const modalBody = document.querySelector('#cropperModal .modal-body');
//         modalBody.innerHTML = `
//             <div class="text-center p-3">
//                 <div class="spinner-border text-primary" role="status">
//                     <span class="visually-hidden">Loading...</span>
//                 </div>
//                 <p class="mt-2">Preparing image...</p>
//             </div>
//         `;
        
//         // Show modal first
//         cropperModalInstance.show();
        
//         // Create new image element
//         const img = new Image();
//         img.onload = function() {
//             modalBody.innerHTML = `
//                 <div class="img-container">
//                     <img src="${imgElement.src}" alt="Image to crop" id="cropImage" class="img-fluid">
//                 </div>
//             `;
            
//             const cropImage = document.getElementById('cropImage');
            
//             // Initialize cropper with optimized settings
//             destroyCropper();
//             cropper = new Cropper(cropImage, {
//                 aspectRatio: 4/5,
//                 viewMode: 2,
//                 dragMode: 'move',
//                 autoCropArea: 0.8,
//                 restore: false,
//                 guides: true,
//                 center: true,
//                 highlight: false,
//                 cropBoxMovable: true,
//                 cropBoxResizable: true,
//                 toggleDragModeOnDblclick: false,
//                 responsive: true,
//                 checkOrientation: true,
//                 minContainerWidth: 200,
//                 minContainerHeight: 200,
//                 ready: function() {
//                     this.cropper.crop();
//                 }
//             });
//         };
//         img.src = imgElement.src;
//     }

//     cropButton.addEventListener('click', function() {
//         if (!cropper) {
//             console.error("Cropper is not initialized.");
//             return;
//         }

//         // Show loading indicator
//         const modalBody = document.querySelector('#cropperModal .modal-body');
//         modalBody.innerHTML += `
//             <div class="position-absolute top-50 start-50 translate-middle bg-white p-3 rounded shadow">
//                 <div class="spinner-border text-primary" role="status">
//                     <span class="visually-hidden">Processing...</span>
//                 </div>
//                 <p class="mt-2">Processing image...</p>
//             </div>
//         `;

//         cropper.getCroppedCanvas({
//             width: 800,
//             height: 1000,
//             imageSmoothingEnabled: true,
//             imageSmoothingQuality: 'high'
//         }).toBlob((blob) => {
//             if (!blob) {
//                 console.error("Failed to create blob from cropped image.");
//                 return;
//             }

//             const croppedFile = new File([blob], `cropped_image_${Date.now()}.jpg`, {
//                 type: 'image/jpeg',
//                 lastModified: new Date().getTime()
//             });

//             // Update the selected files array
//             selectedFiles[currentFileIndex] = croppedFile;

//             // Update the image preview
//             const imgElement = document.getElementById(cropImage.id);
//             if (imgElement) {
//                 imgElement.src = URL.createObjectURL(croppedFile);
//             }

//             // Hide modal and destroy cropper
//             cropperModalInstance.hide();
//         }, 'image/jpeg', 0.8); // Slightly reduced quality for better performance
//     });

//     function renderVariants() {
//         variantsContainer.innerHTML = ''; // Clear previous variants

//         variants.forEach((variant, index) => {
//             const variantDiv = document.createElement('div');
//             variantDiv.classList.add('col-md-4', 'mb-3');
//             variantDiv.innerHTML = `
//                 <div class="card p-2">
//                     <h6>Variant ${index + 1}</h6>
//                     <p><strong>Size:</strong> ${variant.size}</p>
//                     <p><strong>Color:</strong> ${variant.color}</p>
//                     <p><strong>Status:</strong> ${variant.status}</p>
//                     <p><strong>Price:</strong> $${variant.price}</p>
//                     <p><strong>Quantity:</strong> ${variant.quantity}</p>
//                     <button class="btn btn-info btn-sm mb-1 editBtn" data-index="${index}">Edit</button>
//                     <button class="btn btn-danger btn-sm removeBtn" data-index="${index}">Remove</button>
//                 </div>
//             `;
//             variantsContainer.appendChild(variantDiv);
//         });

//         // Reattach event listeners after rendering
//         document.querySelectorAll(".editBtn").forEach((btn) => {
//             btn.addEventListener("click", (e) => {
//                 e.preventDefault();
//                 const index = parseInt(e.target.getAttribute("data-index"));
//                 showUpdateVariantModal(index);
//             });
//         });

//         window.removeVariant = (index) => {
//             variants.splice(index, 1); // Remove the variant from the array
//             renderVariants(); // Re-render the variants
//         };

//         document.querySelectorAll(".removeBtn").forEach((btn) => {
//             btn.addEventListener("click", (e) => {
//                 e.preventDefault();
//                 const index = parseInt(e.target.getAttribute("data-index"));
//                 removeVariant(index);
//             });
//         });
//     }

//     const variantsPreview = document.getElementById("variantsContainer");
//     variantsPreview.querySelectorAll(".editBtn").forEach((btn)=>{
//         btn.addEventListener("click",(e)=>{
//             e.preventDefault();
//             // console.log("click")
//         })
//     })

//     function showUpdateVariantModal(index) {
//         const variant = variants[index]; // Get the selected variant
    
//         const variantModalContent = document.getElementById('variantModalContent');
//         variantModalContent.innerHTML = `
//             <div class="row">
//                 <div class="col-md-6">
//                     <label for="variant_size" class="form-label">Size</label>
//                     <select id="variant_size" class="form-control">
//                         <option value="XS" ${variant.size === 'XS' ? 'selected' : ''}>XS</option>
//                         <option value="S" ${variant.size === 'S' ? 'selected' : ''}>S</option>
//                         <option value="M" ${variant.size === 'M' ? 'selected' : ''}>M</option>
//                         <option value="L" ${variant.size === 'L' ? 'selected' : ''}>L</option>
//                         <option value="XL" ${variant.size === 'XL' ? 'selected' : ''}>XL</option>
//                         <option value="XXL" ${variant.size === 'XXL' ? 'selected' : ''}>XXL</option>
//                         <option value="3XL" ${variant.size === '3XL' ? 'selected' : ''}>3XL</option>
//                         <option value="4XL" ${variant.size === '4XL' ? 'selected' : ''}>4XL</option>
//                         <option value="5XL" ${variant.size === '5XL' ? 'selected' : ''}>5XL</option>
//                     </select>
//                 </div>                    
//                 <div class="col-md-6">
//                     <label for="variant_color" class="form-label">Color</label>
//                     <input type="text" id="variant_color" class="form-control" value="${variant.color}">
//                 </div>
//             </div>
//             <div class="row mt-2">
//                 <div class="col-md-6">
//                     <label for="variant_status" class="form-label">Status</label>
//                     <select id="variant_status" class="form-control">
//                         <option value="Available" ${variant.status === 'Available' ? 'selected' : ''}>Available</option>
//                         <option value="OutOfStock" ${variant.status === 'OutOfStock' ? 'selected' : ''}>Out of Stock</option>
//                         <option value="Discontinued" ${variant.status === 'Discontinued' ? 'selected' : ''}>Discontinued</option>
//                     </select>
//                 </div>
//                 <div class="col-md-6">
//                     <label for="variant_price" class="form-label">Price</label>
//                     <input type="number" id="variant_price" class="form-control" value="${variant.price}">
//                 </div>
//             </div>
//             <div class="row mt-2">
//                 <div class="col-md-6">
//                     <label for="variant_quantity" class="form-label">Quantity</label>
//                     <input type="number" id="variant_quantity" class="form-control" value="${variant.quantity}">
//                 </div>
//             </div>
           
//         `;
    
//         // Set modal title
//         document.getElementById('variantModalLabel').textContent = 'Edit Variant';
        
//         // Show modal
//         const variantModal = new bootstrap.Modal(document.getElementById('variantModal'));
//         variantModal.show();
    
//         // Attach event listener to update button
//         document.getElementById("updateVariantBtn").addEventListener("click", function () {
//             updateVariant(index, variantModal);
//         });
//     }

//     function updateVariant(index, variantModal) {
//         variants[index] = {
//             size: document.getElementById("variant_size").value,
//             color: document.getElementById("variant_color").value,
//             status: document.getElementById("variant_status").value,
//             price: parseFloat(document.getElementById("variant_price").value),
//             quantity: parseInt(document.getElementById("variant_quantity").value),
//         };
    
//         console.log("Updated Variants:", variants);
    
//         renderVariants(); // Re-render variants
//         variantModal.hide(); // Close modal
//     }

//     // Select the Add Variant button
// document.getElementById("addVariantBtn").addEventListener("click", function () {
//     showAddVariantModal();
// });

// function showAddVariantModal() {
//     const variantModalContent = document.getElementById('variantModalContent');
//     variantModalContent.innerHTML = `
//         <div class="row">
//             <div class="col-md-6">
//                 <label for="new_variant_size" class="form-label">Size</label>
//                 <select value = "" id="new_variant_size" class="form-control">
//                     <option value="XS">XS</option>
//                     <option value="S">S</option>
//                     <option value="M">M</option>
//                     <option value="L">L</option>
//                     <option value="XL">XL</option>
//                     <option value="XXL">XXL</option>
//                     <option value="3XL">3XL</option>
//                     <option value="4XL">4XL</option>
//                     <option value="5XL">5XL</option>
//                 </select>
//             </div>                    
//             <div class="col-md-6">
//                 <label for="new_variant_color" class="form-label">Color</label>
//                 <input type="text" id="new_variant_color" class="form-control">
//             </div>
//         </div>
//         <div class="row mt-2">
//             <div class="col-md-6">
//                 <label for="new_variant_status" class="form-label">Status</label>
//                 <select id="new_variant_status" class="form-control">
//                     <option value="Available">Available</option>
//                     <option value="OutOfStock">Out of Stock</option>
//                     <option value="Discontinued">Discontinued</option>
//                 </select>
//             </div>
//             <div class="col-md-6">
//                 <label for="new_variant_price" class="form-label">Price</label>
//                 <input type="number" id="new_variant_price" class="form-control">
//             </div>
//         </div>
//         <div class="row mt-2">
//             <div class="col-md-6">
//                 <label for="new_variant_quantity" class="form-label">Quantity</label>
//                 <input type="number" id="new_variant_quantity" class="form-control">
//             </div>
//         </div>
//     `;

//     // Set modal title
//     document.getElementById('variantModalLabel').textContent = 'Add Variant';

//     // Show modal
//     const variantModal = new bootstrap.Modal(document.getElementById('variantModal'));
//     variantModal.show();

//     // Attach event listener for adding the new variant
//     // document.getElementById("updateVariantBtn").textContent = "Add Variant";
//     document.getElementById("saveVariantBtn").onclick = function () {
//         addVariant(variantModal);
//     };
// }

// function addVariant(variantModal) {
//     const newVariant = {
//         size: document.getElementById("new_variant_size").value,
//         color: document.getElementById("new_variant_color").value,
//         status: document.getElementById("new_variant_status").value,
//         price: parseFloat(document.getElementById("new_variant_price").value),
//         quantity: parseInt(document.getElementById("new_variant_quantity").value),
//     };

//     // Add to the variants array
//     variants.push(newVariant);
//     console.log("New Variant Added:", newVariant);

//     // Re-render variants
//     renderVariants();

//     // Close the modal
//     variantModal.hide();
// }

// // Add update button handler
// document.getElementById("updateBtn").addEventListener("click", async function(e) {
//     e.preventDefault();
    
//     // Get form data
//     const formData = new FormData();
    
//     // Get product details
//     const productId = productDetails._id;
//     const title = document.getElementById("product_title").value;
//     const description = document.getElementById("product_description").value;
//     const category = document.getElementById("product_category").value;
//     const offer = document.getElementById("product_offer").value;
    
//     // Validate required fields
//     if (!title || !category) {
//         alert("Please fill in all required fields");
//         return;
//     }
    
//     // Add product data to formData
//     formData.append("id", productId);
//     formData.append("name", title);
//     formData.append("description", description);
//     formData.append("category", category);
//     formData.append("productOffer", offer);
    
//     // Add variants
//     formData.append("variants", JSON.stringify(variants));
    
//     // Add images
//     selectedFiles.forEach((file, index) => {
//         if (file instanceof File) {
//             formData.append(`image_${index + 1}`, file);
//         } else {
//             formData.append(`existingImage_${index + 1}`, file);
//         }
//     });
    
//     try {
//         console.log("Form Data is",formData)
//         const response = await fetch("/admin/products/edit", {
//             method: "PUT",
//             body: formData
//         });
        
//         const data = await response.json();
        
//         if (data.success) {
//             alert("Product updated successfully!");
//             window.location.href = "/admin/productManagement";
//         } else {
//             alert(data.message || "Failed to update product");
//         }
//     } catch (error) {
//         console.error("Error updating product:", error);
//         alert("An error occurred while updating the product");
//     }
// });

// // document.getElementById("saveVariantBtn").addEventListener("click",(e)=>{
// //     console.log(e)
// // })

    
    
// })

// console.log("HI");

let cropper;
//I should add all image elements to this at first so that when removing i would be able to know images are removed and all....
let selectedFiles = [];
let currentFileIndex = 0; // Track which image is being cropped
let variants = []; // Store the variants
document.querySelectorAll(".imageelm").forEach((elm)=>{
    selectedFiles.push(elm.src);
})

document.querySelectorAll(".remove-btn").forEach((btn)=>{
    btn.addEventListener("click",(e)=>{
        e.preventDefault();
        removeImage(e.target);
    })
})



const imageInput = document.getElementById("imagesInput");
const variantPreview = document.getElementById("variantsPreview");
let cropImage = document.getElementById("cropImage");
const cropperModal = new bootstrap.Modal(document.getElementById("cropperModal"));
// console.log(variantPreview)
const addVariantBtn = document.querySelector("#addVariantBtn");
const size = variantPreview.querySelector("#size");
const variantModal = document.getElementById('variantModal')
var myModal = new bootstrap.Modal(document.getElementById('variantModal'));

console.log("selected Image",selectedFiles);

variantPreview.querySelectorAll(".edit-btn").forEach((button)=>{
    button.addEventListener("click",(e)=>{
        e.preventDefault()
        showVariantModal(e.target.parentElement.parentElement);
    })
})

function showVariantModal(data)
{
    myModal.show();
    variantModal.querySelector("#selectedSize").innerText = data.querySelector('#size').innerText 
    variantModal.querySelector("#variant_color").value = data.querySelector("#color").innerText
    variantModal.querySelector("#variant_status").value =  data.querySelector("#status").innerText
    variantModal.querySelector("#variant_price").value = Number(data.querySelector("#salePrice").innerText)
    variantModal.querySelector("#variant_quantity").value = Number(data.querySelector("#quantity").innerText)

}

addVariantBtn.addEventListener("click", () => {
    myModal.show();
});

document.querySelectorAll(".imageContainer").forEach((element)=>{
    element.addEventListener("click",(e)=>{
        console.log(e.target);
        // openCropperModal(e.target)
    })
})



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

    document.querySelector('.cropper-modal');
}

cropButton.addEventListener('click', function () {
    if (!cropper) {
        console.error("Cropper is not initialized.");
        return; // Exit if cropper is not initialized
    }

    // Get the cropped canvas with desired dimensions
    cropper.getCroppedCanvas({
        width: 100,
        height: 200,
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

        console.log(croppedFile);
        console.log(currentFileIndex);
        
        // Replace the selected image with the cropped one
        selectedFiles[currentFileIndex] = croppedFile;
        
        // croppedFile

        // Update the image preview
        cropImage.src = "";
        // document.getElementById(cropImage.id).src = URL.createObjectURL(croppedFile);

        // Hide the cropper modal and destroy the cropper instance
        cropperModal.hide();
        cropper.destroy(); // Destroy the cropper instance when done
    }, 'image/jpeg', 0.9);
});


//For Reading new image inputs
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

                console.log(selectedFiles);

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


//variant details....




