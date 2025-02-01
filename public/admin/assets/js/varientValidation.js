console.log("Variant Validation")
let selectedImages = []; // Store selected files for upload
    let cropper;
    let selectedImage; // To hold the selected image for cropping

    const imageInput = document.getElementById('imageInput');
    const imagePreview = document.getElementById('imagePreview');
    const cropperModalElement = document.getElementById('cropperModal');
    const cropperModal = new bootstrap.Modal(cropperModalElement); // Modal initialization
    const cropperCanvas = document.getElementById('cropperCanvas');
    const cropButton = document.getElementById('cropButton');

    // Handle the image selection
    imageInput.addEventListener('change', function(event) {
        const files = event.target.files;
        console.log(files)
        if (files.length === 0) {
            document.getElementById('image_error').style.display = 'block';
            return;
        }

        document.getElementById('image_error').style.display = 'none';
        imagePreview.innerHTML = ''; // Clear previous images
        selectedImages = []; // Clear previously selected images

        // Loop through files and create image previews
        Array.from(files).forEach(file => {
            console.log("File is ",file)
            const reader = new FileReader();
            reader.onload = function(e) {
                const imgElement = document.createElement('img');
                imgElement.src = e.target.result;
                imgElement.classList.add('img-thumbnail');
                
                // Create a remove button
                const removeButton = document.createElement('button');
                removeButton.textContent = 'X';
                removeButton.classList.add('remove-btn');
                removeButton.onclick = function() {
                    removeImage(imgElement);
                };

                // Container for the image and button
                const imgContainer = document.createElement('div');
                imgContainer.classList.add('img-thumbnail-container');
                imgContainer.style.width = "200px";
                imgContainer.style.height = "250px"
                imgContainer.appendChild(removeButton);
                imgContainer.appendChild(imgElement);

                // Add image container to the preview section
                imagePreview.appendChild(imgContainer);

                // Add file to selectedImages array
                selectedImages.push(file);

                // Add click event for opening the crop modal
                imgElement.onclick = function() {
                    openCropperModal(imgElement);
                };
            };
            reader.readAsDataURL(file);
        });
    });

    // Remove the selected image from preview
    function removeImage(imgElement) {
        imgElement.parentElement.remove();
        const index = selectedImages.findIndex(image => image.name === imgElement.dataset.filename);
        if (index > -1) {
            selectedImages.splice(index, 1);
        }
    }

    // Open the modal with the selected image
    function openCropperModal(imgElement) {
        selectedImage = imgElement;
        const img = new Image();
        img.src = selectedImage.src;
        img.onload = function() {
            cropperCanvas.width = img.width;
            cropperCanvas.height = img.height;

            const ctx = cropperCanvas.getContext('2d');
            ctx.clearRect(0, 0, cropperCanvas.width, cropperCanvas.height); // Clear canvas before drawing
            ctx.drawImage(img, 0, 0); // Draw the image to the canvas

            // Initialize the cropper after the image is drawn on the canvas
            cropper = new Cropper(cropperCanvas, {
                aspectRatio: 1, // 1:1 aspect ratio
                minContainerHeight: 300,  // Minimum container height for cropping
                minContainerWidth: 300,  // Minimum container width for cropping
                dragMode: 'move', // Allow moving the image when cropping
                viewMode: 1, // This keeps the crop box inside the canvas and the image visible
            });

            // Show the modal after cropper is initialized
            cropperModal.show();
        };
    }

    // Crop the image and update the preview
    cropButton.addEventListener('click', function() {
        if (!cropper) return;

        const croppedCanvas = cropper.getCroppedCanvas({
            width: 500, // Increase the cropped image size (e.g., 500px)
            height: 500
        });

        const croppedImage = croppedCanvas.toDataURL('image/*'); // Get cropped image as Data URL
        selectedImage.src = croppedImage; // Update preview image

        // Close the modal
        cropperModal.hide();
        cropper.destroy(); // Destroy the cropper instance
    });