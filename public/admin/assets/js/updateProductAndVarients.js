// const e = require("express");

let cropper;
//I should add all image elements to this at first so that when removing i would be able to know images are removed and all....
let selectedFiles = [];
let currentFileIndex = 0; // Track which image is being cropped
let variants = []; // Store the variants
let oldVariantDetals = {};
let oldProductDetails = {};
let newVariant = {};


oldProductDetails.title = document.querySelector("#product_title").value;
oldProductDetails.offer = document.querySelector("#product_offer").value;
oldProductDetails.category = document.querySelector("#product_category").value
oldProductDetails.description = document.querySelector("#product_description").innerHTML


console.log(oldProductDetails);

JSON.parse(document.querySelector("#variantsPreview").getAttribute("data-variants")).forEach(elm => {
    
    variants.push(elm)
})

/*
    What we will do for the selected Images...
    first we will fil all the images with the selected image then and thir image element 
    when clicking on the get cropped modal we will change the thhe src based on the image id and at last before sending this to the backed we 
    wil convert this to blob and send the data to the backend 
*/


//Add images to selected files
// document.querySelectorAll(".imageelm").forEach((elm)=>{
//     // console.log("Images",elm)

//     selectedFiles.push(elm);
// })

document.querySelectorAll(".imageelm").forEach((elm) => {
    // console.log("Images", elm);

    // Get the image source (URL)
    const imgSrc = elm.src;

    // Fetch the image data as a Blob (binary large object)
    fetch(imgSrc)
        .then(response => response.blob()) // Convert image to blob
        .then(blob => {
            // Create a File object from the blob (you can modify the name and type)
            const file = new File([blob], `image_${Date.now()}.jpg`, { type: blob.type });

            // Create a FileReader to read the file content (if needed for preview or something else)
            const reader = new FileReader();
            reader.onload = function (e) {
                // console.log("FileReader Result: ", e.target.result);
                // You can now work with the file data (e.g., base64 encoded string)
            };

            reader.readAsDataURL(file); // Read the image file as a data URL (base64 string)
            
            // Push the file to your selected files array
            selectedFiles.push(file);
            // console.log("Selected Files: ", selectedFiles);
        })
        .catch(error => {
            console.error("Error loading image:", error);
        });
});


console.log(selectedFiles)

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

// console.log("selected Image",selectedFiles);

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
    
    newVariant._id = data.querySelector('#size').getAttribute("data-id");
    
    oldVariantDetals.id = data.querySelector('#size').getAttribute("data-id");
    oldVariantDetals.size = data.querySelector('#size').innerText 
    oldVariantDetals.color = data.querySelector("#color").innerText
    oldVariantDetals.status = data.querySelector("#status").innerText
    oldVariantDetals.price = Number(data.querySelector("#salePrice").innerText)
    oldVariantDetals.quantity = Number(data.querySelector("#quantity").innerText)

    // console.log( oldVariantDetals )
    
}

addVariantBtn.addEventListener("click", () => {
    myModal.show();
});

document.querySelectorAll(".imageContainer").forEach((element)=>{
    element.addEventListener("click",(e)=>{
        // console.log(e.target);
        openCropperModal(e.target)
    })
})



function removeImage(imgElement) {
    // console.log(selectedFiles);
    const index = selectedFiles.findIndex(file => file.name === imgElement.dataset.name);
    if (index > -1) {
        selectedFiles.splice(index, 1); // Remove the file from the array
        imgElement.parentNode.remove(); // Remove the image from the preview
    }
}

function openCropperModal(imgElement) {
    console.log("Image Element from Cropper modal",imgElement)
    cropImage.src = imgElement.src;
    cropImage.id = imgElement.id;
    cropImage.classList = imgElement.classList
    cropImage.dataId =imgElement.getAttribute("data-id");

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

    // document.querySelector('.cropper-modal');
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

        // console.log(cropImage.dataId)

        // console.log("Before Cropping ",selectedFiles);
        // console.log("Croped Image",croppedFile);
        // Replace the selected image with the cropped one
        selectedFiles[cropImage.dataId] = croppedFile
        

        // console.log("After Cropping",selectedFiles);

        // Update the image preview
        // console.log(cropImage)
        // console.log("Cropped Image",URL.createObjectURL(croppedFile))
        document.getElementById(cropImage.id).src = URL.createObjectURL(croppedFile);

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

                // console.log(selectedFiles);

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


document.querySelector("#saveVariantBtn").addEventListener("click",()=>{
    
   
    newVariant.size = variantModal.querySelector("#variant_size").value || variantModal.querySelector("#selectedSize").innerText 
    newVariant.color =variantModal.querySelector("#variant_color").value 
    newVariant.status =  variantModal.querySelector("#variant_status").value 
    newVariant.price = Number(variantModal.querySelector("#variant_price").value) 
    newVariant.quantity = Number(variantModal.querySelector("#variant_quantity").value) 

// console.log("helo")

    // console.log(
    //     !(newVariant.size == oldVariantDetals.size &&
    //         newVariant.color == oldVariantDetals.color &&
    //         newVariant.status == oldVariantDetals.status &&
    //         newVariant.price == oldVariantDetals.price &&
    //         newVariant.quantity == oldVariantDetals.quantity )
    // )
    

    if (
        !(newVariant.size == oldVariantDetals.size &&
        newVariant.color == oldVariantDetals.color &&
        newVariant.status == oldVariantDetals.status &&
        newVariant.price == oldVariantDetals.price &&
        newVariant.quantity == oldVariantDetals.quantity )
    )
    {
        console.log("Before Updating",newVariant)
        //Change the details in the varaiats array..
        variants.forEach((item,index) => {
            if(item._id == newVariant._id)
            {
                console.log(variants[index])
                variants[index] = newVariant;
                // console.log(variants)
            }       
        })

        console.log("After Updating",variants);

    }

    myModal.hide()
})


// document.querySelector("#publishBtn").addEventListener("click", async (e) => {
//     try {
//         e.preventDefault();

//         let isVariantChanged = false;  // Flag to check if the variant has changed
//         let isProductChanged = false;  // Flag to check if the product details have changed

//         // Check if the variant has changed
//         if (
//             newVariant.size !== oldVariantDetals.size ||
//             newVariant.color !== oldVariantDetals.color ||
//             newVariant.status !== oldVariantDetals.status ||
//             newVariant.price !== oldVariantDetals.price ||
//             newVariant.quantity !== oldVariantDetals.quantity
//         ) {
//             isVariantChanged = true;
//         }

//         // Check if the product details have changed
//         if (
//             oldProductDetails.title !== document.querySelector("#product_title").value ||
//             oldProductDetails.offer !== document.querySelector("#product_offer").value ||
//             oldProductDetails.category !== document.querySelector("#test").innerText ||
//             oldProductDetails.description !== document.querySelector("#product_description").innerHTML
//         ) {
//             isProductChanged = true;
//         }

//         // If no changes in variants or product details, show an error message
//         if (!isVariantChanged && !isProductChanged) {
//             Toast.fire({
//                 icon: "error",
//                 title: "No changes detected. Please update something before submitting."
//             });
//         } else {
//             // Create a new FormData object
//             let formData = new FormData();

//             // Append product details
//             formData.append("product_id",document.querySelector("#product_title").getAttribute("data-id"))
//             formData.append("product_title", document.querySelector("#product_title").value);
//             formData.append("product_offer", document.querySelector("#product_offer").value);
//             formData.append("product_category", document.querySelector("#test").value || document.getElementById('product_category').value);
//             formData.append("product_description", document.querySelector("#product_description").innerHTML);

//             // Append variant details (in case variants were changed)
//             formData.append("variants", JSON.stringify(variants));  // You can send this as JSON string or as individual form fields

//             // Append selected image files
//             selectedFiles.forEach((file, index) => {
//                 console.log(file);
//                 formData.append(`image_${index+1}`, file);  // Append each image with a unique name (e.g., image_0, image_1, etc.)
//             });

//             // Proceed with sending the FormData to the backend
//             let response = await fetch("/admin/products/edit", {
//                 method: "POST",
//                 body: formData  // Send the FormData object
//             });

//             let details = await response.json();

//             if (details.success) {
//                 // Handle success (e.g., show a success message)
//                 Toast.fire({
//                     icon: "success",
//                     title: "Product and variants updated successfully!"
//                 });
//             } else {
//                 // Handle failure (e.g., show an error message)
//                 Toast.fire({
//                     icon: "error",
//                     title: "Failed to update the product and variants."
//                 });
//             }
//         }

//     } catch (err) {
//         console.error('Error occurred during the update:', err);
//     }
// });

document.querySelector("#publishBtn").addEventListener("click", async (e) => {
    try {
        e.preventDefault();
        const productCard = document.getElementById("productCard");
        
        console.log(document.querySelector("#test").value )
        console.log(document.getElementById('product_category').value)

        let isVariantChanged = false;  // Flag to check if the variant has changed
        let isProductChanged = false;  // Flag to check if the product details have changed

        // Validate Product Details
        const title = document.querySelector("#product_title").value;
        const offer = document.querySelector("#product_offer").value;
        const category = document.getElementById('product_category').value;
        const description = document.querySelector("#product_description").innerHTML;

        // Check for missing required fields (Example: title, offer, category, description)
        if (!title || !offer || !category || !description) {
            Toast.fire({
                icon: "error",
                title: "All product details fields must be filled."
            });
            return; // Stop submission if validation fails
        }

        // Check if the product details have changed
        if (
            oldProductDetails.title !== title ||
            oldProductDetails.offer !== offer ||
            oldProductDetails.category !==  category ||
            oldProductDetails.description !== description
        ) {
            isProductChanged = true;
        }

        // Validate Variant Details
        if (
            newVariant.size !== oldVariantDetals.size ||
            newVariant.color !== oldVariantDetals.color ||
            newVariant.status !== oldVariantDetals.status ||
            newVariant.price !== oldVariantDetals.price ||
            newVariant.quantity !== oldVariantDetals.quantity
        ) {
            isVariantChanged = true;
        }

        // If no changes in variants or product details, show an error message
        if (!isVariantChanged && !isProductChanged) {
            Toast.fire({
                icon: "error",
                title: "No changes detected. Please update something before submitting."
            });
        } else {
            // Create a new FormData object
            let formData = new FormData();

            // Append product details
            formData.append("product_id", document.querySelector("#product_title").getAttribute("data-id"));
            formData.append("product_title", title);
            formData.append("product_offer", offer);
            formData.append("product_category",  category );
            formData.append("product_description", description);

            // Append variant details (in case variants were changed)
            formData.append("variants", JSON.stringify(variants));  // You can send this as JSON string or as individual form fields

            // Append selected image files
            selectedFiles.forEach((file, index) => {
                formData.append(`image_${index + 1}`, file);  // Append each image with a unique name (e.g., image_0, image_1, etc.)
            });

            // Proceed with sending the FormData to the backend
            let response = await fetch("/admin/products/edit", {
                method: "POST",
                body: formData  // Send the FormData object
            });

            let details = await response.json();

            if (details.success) {
                // Handle success (e.g., show a success message)
                Toast.fire({
                    icon: "success",
                    title: "Product and variants updated successfully!"
                });
            //     productCard.innerHTML = `
            //         <div class="card-body" id="card-body">
            //             <form id="productForm" enctype="multipart/form-data">
            //                 <div class="row">
            //                     <!-- Product Title -->
            //                     <div class="col-md-6">
            //                         <label for="product_title" class="form-label">Product Title</label>
            //                         <input type="text" id="product_title" name="product_title" class="form-control" value="${details.updatedProduct.productName}" data-id="${details.updatedProduct._id}">
            //                         <small id="product_title_error" class="text-danger" style="display: none;">Product title is required.</small>
            //                     </div>
            //                     <!-- Product Price -->
            //                     <div class="col-md-6">
            //                         <label for="product_offer" class="form-label">Product Offer</label>
            //                         <input type="number" id="product_offer" name="product_offer" class="form-control" min="0" max="90" value="${details.updatedProduct.productOffer}">
            //                         <small id="product_offer_error" class="text-danger" style="display: none;">Product Offer is required.</small>
            //                     </div>
            //                     <!-- Image -->
            //                     <div class="col-md-6">
            //                         <label class="form-label">Image</label>
            //                         <input type="file" id="imagesInput" class="form-control" accept="image/*" multiple>
            //                     </div>
            //                     <!-- Product Category -->
            //                     <div class="col-md-6">
            //                         <label for="product_category" class="form-label">Product Category</label>
            //                         <select id="product_category" name="product_category" class="form-select">
            //                             <option id="test" value="${details.updatedProduct.category._id}">${details.updatedProduct.category.name}</option>
            //                             ${details.updatedProduct.categories.map(category => {
            //                                 if (category.isListed) {
            //                                     return `<option value="${category._id}">${category.name}</option>`;
            //                                 }
            //                                 return '';
            //                             }).join('')}
            //                         </select>
            //                         <small id="product_category_error" class="text-danger" style="display: none;">Product category is required.</small>
            //                     </div>
            //                 </div>

            //                 <div class="row">
            //                     <!-- Product Description -->
            //                     <div class="col-md-12">
            //                         <label for="product_description" class="form-label">Product Description</label>
            //                         <textarea id="product_description" name="product_description" class="form-control" rows="4">${details.updatedProduct.description}</textarea>
            //                         <small id="product_description_error" class="text-danger" style="display: none;">Product Description is required.</small>
            //                     </div>
            //                 </div>
            //                 <div class="row mt-2">
            //                     <div class="col-md-6 row">
            //                         ${details.updatedProduct.productImages.map((image, index) => {
            //                             return `
            //                                 <div id="imagePreview" class="col">
            //                                     <!-- Images Will be displayed Here -->
            //                                     <div class="img-thumbnail-container" data-id="${index + 1}">
            //                                         <button class="remove-btn">X</button>
            //                                         <img src="/${image}" data-id="${index + 1}" class="imageelm imageContainer" id="image_${index + 1}">
            //                                     </div>
            //                                 </div>
            //                             `;
            //                         }).join('')}
            //                     </div>
            //                 </div>
            //                 <!-- Add Variant Button -->
            //                 <div class="col-md-12 mt-4">
            //                     <button type="button" class="btn btn-secondary mt-4" id="addVariantBtn">Add Variant</button>
            //                 </div>

            //                 <!-- Variants Preview Section -->
            //                 <div id="variantsPreview" class="mt-4 row" data-variants="${JSON.stringify(details.updatedProduct.variants)}">
            //                     ${details.updatedProduct.variants.map((variant, index) => {
            //                         return `
            //                             <div id="variantsContainer">
            //                                 <div class="col-md-4 mb-3">
            //                                     <div class="card p-2">
            //                                         <h6>Variant ${index + 1}</h6>
            //                                         <p><strong>Size:</strong> <span id="size" data-id="${variant._id}">${variant.size}</span></p>
            //                                         <p><strong>Color:</strong> <span id="color">${variant.color}</span></p>
            //                                         <p><strong>Status:</strong> <span id="status">${variant.status}</span></p>
            //                                         <p><strong>Price:</strong> $<span id="salePrice">${variant.salePrice}</span></p>
            //                                         <p><strong>Quantity:</strong> <span id="quantity">${variant.quantity}</span></p>
            //                                         <div class="buttons row gap-4 p-4">
            //                                             <button class="btn btn-success btn-sm col edit-btn">Edit</button>
            //                                             <button class="btn btn-danger btn-sm col" onclick="removeVariant()">Remove</button>
            //                                         </div>
            //                                     </div>
            //                                 </div>
            //                             </div>
            //                         `;
            //                     }).join('')}
            //                 </div>

            //                 <!-- Submit Button -->
            //                 <button type="button" id="publishBtn" class="btn btn-primary mt-4">Update Product</button>
            //             </form>
            //         </div>
            // `;

                window.location.reload();

            } else {
                // Handle failure (e.g., show an error message)
                Toast.fire({
                    icon: "error",
                    title: "Failed to update the product and variants."
                });
            }
        }

    } catch (err) {
        console.error('Error occurred during the update:', err);
    }
});






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