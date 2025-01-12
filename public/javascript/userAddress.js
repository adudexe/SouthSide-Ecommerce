// Show the modal when "Add Address" button is clicked
document.querySelector("#addAddressBtn").addEventListener("click", function() {
    new bootstrap.Modal(document.getElementById('createAddressModal')).show();
});

// Handle the form submission to save the new address
document.querySelector("#submitButton").addEventListener("click", async function(event) {
    try {
        event.preventDefault();  // Prevent form from submitting the default way
        const modalform = document.getElementById('createAddressForm');
        // Collect the form data
        const addressData = {
            name: document.getElementById("name").value.trim(),
            street:document.getElementById("street").value.trim(),
            city: document.getElementById("city").value.trim(),
            state: document.getElementById("state").value.trim(),
            postalCode: document.getElementById("postalCode").value.trim(),
            phone: document.getElementById("phone").value.trim(),
            country:document.getElementById("country").value.trim(),
            addressNumber: document.getElementById("addressNumber").getAttribute("data-address-number"),  // Updated to addressNumber
            isPrimary: document.getElementById("isPrimary").checked
        };
        console.log(addressData.addressNumber);
        // Basic validation: Check if all fields are filled
        if (!addressData.name) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Name is required.'
            });
            return;
        }

        if (!addressData.city) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'City is required.'
            });
            return;
        }

        if (!addressData.state) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'State is required.'
            });
            return;
        }

        if (!addressData.postalCode) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Postal Code is required.'
            });
            return;
        }

        if(!addressData.country)
        {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Country is required.'
            });
            return;
        }


        if(!addressData.phone) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Phone number is required.'
            });
            return;
        }

        if (!addressData.addressNumber) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Address Number is required.'
            });
            return;
        }

        // Validate phone number (10 digits)
        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(addressData.phone)) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Please enter a valid 10-digit phone number.'
            });
            return;
        }

        // Validate postal code (6 digits)
        const postalCodeRegex = /^[0-9]{6}$/;
        if (!postalCodeRegex.test(addressData.postalCode)) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Please enter a valid 6-digit postal code.'
            });
            return;
        }

        // Send the data to the server using fetch
        const response = await fetch("/user/myAccount/Address", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(addressData)
        });

        const data = await response.json();  // Await the JSON data from the response

        if (data.success) {  // Assuming 'success' is the property returned from the backend
            // Close the modal after success
            const myModal = bootstrap.Modal.getInstance(document.getElementById('createAddressModal'));
            modalform.reset()
            myModal.hide();
            address = data.address;
            // Success alert using SweetAlert2
            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: 'Address successfully added!'
            });
            const cardDiv = document.getElementById("cardDiv");
            const card = document.createElement("div");
            card.classList.add("col-lg-6");
            
            card.innerHTML = `
                <div class="card mt-3" id="address-card-${address.addressNumber}">
                    <div class="card-header">
                        <h5 class="mb-0">Address ${address.addressNumber}</h5>
                        </div>
                        <div class="card-body">
                        <address id="address-${address.addressNumber}">
                            <p>${address.name}</p>
                            <p>${address.street}, ${ address.city}, ${address.state} ${ address.postalCode} </p>
                            <p>${address.country}</p>
                        </address>
                        <p>Phone: ${address.phone}</p>
                        <button class="btn btn-sm  editButton" data-address-id="${address._id}">Edit</button>
                        <button  class="btn btn-sm  ms-3 deleteBtn" data-address-id="${address._id}">Delete</button>
                </div>
            </div>
            `
            cardDiv.appendChild(card);
        } else {
            // Handle error if data.success is false
            Swal.fire({
                icon: 'error',
                title: 'Failed!',
                text: 'Failed to add address. Please try again.'
            });
        }
    } catch (err) {
        console.error("Error in submitting data:", err);
        Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: 'An error occurred while submitting the data.'
        });
    }
});
