    // Function to reinitialize change address button
    function initializeChangeAddressButton() {
        const changeAddressButton = document.querySelector('#change-address-btn');
        if (changeAddressButton) {
            changeAddressButton.addEventListener('click', function() {
                const changeAddressModal = new bootstrap.Modal(document.getElementById('changeAddressModal'));
                changeAddressModal.show();
            });
        }
    }
    
    // Function to update primary address display
    function updatePrimaryAddressDisplay(selectedAddress) {
        const primaryAddressHtml = `
            <div class="address-details">
                <div class="border-bottom pb-3 mb-3">
                    <p class="mb-1"><strong>${selectedAddress.name}</strong></p>
                    <p class="mb-1">${selectedAddress.street}</p>
                    <p class="mb-1">${selectedAddress.city}, ${selectedAddress.state}</p>
                    <p class="mb-1">${selectedAddress.postalCode}</p>
                    <p class="mb-1">Phone: ${selectedAddress.phone}</p>
                </div>
                <button class="btn btn-outline-primary btn-sm" id="change-address-btn">
                    Change Address
                </button>
            </div>
        `;
        
        document.getElementById('primary-address').innerHTML = primaryAddressHtml;
        initializeChangeAddressButton();
    }
    
    // Update the event listeners for address selection
    document.querySelectorAll('.list-group-item').forEach(function(addressItem) {
        addressItem.addEventListener('click', async function() {
            const selectedAddress = JSON.parse(this.getAttribute('data-address'));
            
            try {
                const response = await fetch(`/user/chekcout/address/set/${selectedAddress._id}`);
                const details = await response.json();
    
                if (details.success) {
                    updatePrimaryAddressDisplay(selectedAddress);
                    
                    Swal.fire({
                        icon: 'success',
                        title: 'Success!',
                        text: 'Address updated successfully',
                        showConfirmButton: false,
                        timer: 1500
                    });
    
                    // Close the change address modal
                    const changeAddressModal = bootstrap.Modal.getInstance(document.getElementById('changeAddressModal'));
                    if (changeAddressModal) {
                        changeAddressModal.hide();
                    }
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error!',
                        text: details.message || 'Failed to update address'
                    });
                }
            } catch (error) {
                console.error('Error updating address:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: 'An unexpected error occurred'
                });
            }
        });
    
        // Update address button handling
        const updateButton = addressItem.nextElementSibling;
        if (updateButton && updateButton.id === 'update-address-btn') {
            updateButton.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const addressData = JSON.parse(addressItem.getAttribute('data-address'));
                
                // Close the change address modal
                const changeAddressModal = bootstrap.Modal.getInstance(document.getElementById('changeAddressModal'));
                if (changeAddressModal) {
                    changeAddressModal.hide();
                }
                
                // Store the original address data and ID
                window.originalAddress = {
                    name: addressData.name || '',
                    street: addressData.street || '',
                    city: addressData.city || '',
                    state: addressData.state || '',
                    postalCode: addressData.postalCode || '',
                    phone: addressData.phone || '',
                    country: addressData.country || '',
                    isPrimary: addressData.isPrimary || false
                };
                window.currentAddressId = addressData._id;
                
                // Populate update form
                document.getElementById('updateName').value = window.originalAddress.name;
                document.getElementById('updateStreet').value = window.originalAddress.street;
                document.getElementById('updateCity').value = window.originalAddress.city;
                document.getElementById('updateState').value = window.originalAddress.state;
                document.getElementById('updatePostalCode').value = window.originalAddress.postalCode;
                document.getElementById('updatePhone').value = window.originalAddress.phone;
                document.getElementById('updateCountry').value = window.originalAddress.country;
                document.getElementById('updateIsPrimary').checked = window.originalAddress.isPrimary;
                
                // Show update modal
                const updateModal = new bootstrap.Modal(document.getElementById('updateAddressModal'));
                updateModal.show();
            });
        }
    });
    
    // Initialize change address button on page load
    document.addEventListener('DOMContentLoaded', function() {
        initializeChangeAddressButton();
    });
        // Handle adding a new address
        const addNewAddressButton = document.getElementById('add-new-address-btn');
        if(addNewAddressButton) {
            addNewAddressButton.addEventListener('click', function() {
                console.log("Add Address");
                var addAddressModal = new bootstrap.Modal(document.getElementById('addAddressModal'));
                addAddressModal.show();
            });
        }
    
        // Handle form submission for adding a new address
        document.getElementById('submitButton').addEventListener('click', async function(event) {
            event.preventDefault();
            
            const newAddress = {
                name: document.getElementById('name').value,
                street: document.getElementById('street').value,
                city: document.getElementById('city').value,
                state: document.getElementById('state').value,
                postalCode: document.getElementById('postalCode').value,
                phone: document.getElementById('phone').value,
                country: document.getElementById('country').value,
                isPrimary: document.getElementById('isPrimary').checked
            };
            
            if (!newAddress.name || !newAddress.street || !newAddress.city || !newAddress.state || !newAddress.postalCode || !newAddress.phone || !newAddress.country) {
                Swal.fire({
                    icon: 'error',
                    title: 'Validation Error',
                    text: 'Please fill all the required fields'
                });
                return;
            }
    
            try {
                const response = await fetch("/user/checkout/address/add", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(newAddress),
                });
                
                const details = await response.json();
                
                if (details.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Success!',
                        text: 'Address added successfully',
                        showConfirmButton: false,
                        timer: 1500
                    }).then(() => {
                        bootstrap.Modal.getInstance(document.getElementById('addAddressModal')).hide();
                        location.reload();
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error!',
                        text: details.message || 'Failed to add the address'
                    });
                }
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: 'An unexpected error occurred. Please try again.'
                });
            }
        });
    
        // Handle place order functionality
        function placeOrder() {
            const primaryAddress = document.querySelector('#primary-address .address-details');
            
            if (!primaryAddress) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Address Required',
                    text: 'Please select or add a delivery address before placing the order.'
                });
                return;
            }
    
            Swal.fire({
                title: 'Confirm Order',
                text: 'Are you sure you want to place this order?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, place order!',
                cancelButtonText: 'No, cancel'
            }).then(async (result) => {
                if (result.isConfirmed) {
                    try {
                        const response = await fetch('/user/place-order', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        });
                        
                        const details = await response.json();
                        
                        if (details.success) {
                            Swal.fire({
                                icon: 'success',
                                title: 'Order Placed Successfully!',
                                text: details.message || 'Your order has been placed successfully.',
                                showConfirmButton: false,
                                timer: 2000
                            }).then(() => {
                                window.location.href = '/user/orders';
                            });
                        } else {
                            Swal.fire({
                                icon: 'error',
                                title: 'Error!',
                                text: details.message || 'Failed to place the order'
                            });
                        }
                    } catch (error) {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error!',
                            text: 'An unexpected error occurred while placing your order'
                        });
                    }
                }
            });
        }
    
        document.getElementById("updateSubmitButton").addEventListener("click", async (e) => {
        e.preventDefault();
        
        const fields = { 
            name: document.getElementById("updateName").value,
            street: document.getElementById("updateStreet").value,
            city: document.getElementById("updateCity").value,
            state: document.getElementById("updateState").value,
            postalCode: document.getElementById("updatePostalCode").value,
            phone: document.getElementById("updatePhone").value,
            country: document.getElementById("updateCountry").value,
            isPrimary: document.getElementById("updateIsPrimary").checked
        };
    
        console.log(fields);
    
        let isChanged = false;
        for (let key in fields) {
            if(key !== 'addressId') { // Skip checking addressId for changes
                if((window.originalAddress)[key] != fields[key]) {
                    isChanged = true;
                    break;
                }
            }
        }
    
        // If nothing changed, show alert and return
        if (!isChanged) {
            Swal.fire({
                icon: 'warning',
                title: 'No Changes Detected',
                text: 'Please make some changes to the address before updating'
            });
            return;
        }
    
        // If we get here, validation passed, send data to the backend
        try {
            let response = await fetch(`/user/checkout/address/update/${window.currentAddressId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(fields)
            });
    
            const result = await response.json();
    
            if (response.ok) {
                // Success case: show success message and close modal
                Swal.fire({
                    icon: 'success',
                    title: 'Address Updated Successfully',
                    text: `Your address has been updated`,
                    showConfirmButton: false,
                    timer: 1500
                }).then(() => {
                    // Close the modal
                    const updateModal = bootstrap.Modal.getInstance(document.getElementById('updateAddressModal'));
                    if (updateModal) {
                        updateModal.hide();
                    }
                    // Reload the page to show updated address
                    location.reload();
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Update Failed',
                    text: result.message || 'There was an issue updating your address. Please try again.'
                });
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'An error occurred while updating your address. Please try again.'
            });
        }
    });
        