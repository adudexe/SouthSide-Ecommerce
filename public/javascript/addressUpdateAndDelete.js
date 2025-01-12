
// document.addEventListener("DOMContentLoaded",(e)=>{
//     console.log("hi")
    
//     document.querySelectorAll(".editButton").forEach((button) => {
//         button.addEventListener("click",async (e)=>{
//             console.log(e.target.getAttribute("data-address-id"))
//             const response = await fetch(`/myAccount/editAddress/${e.target.getAttribute("data-address-id")}`,{
//                 method:"get",
//                 headers:{
//                     "Content-Type":"application/json"
//                 },
//             })
//             const details = await response.json();
//             // console.log(details.address.name);
//             const {address} = details;
//             let updateAddress = {};            
//             // console.log(address);
//             if(details.success)
//             {
//                 new bootstrap.Modal(document.getElementById('createAddressModal')).show();
//                 const modalForm = document.getElementById("createAddressModal");
                
//                 modalForm.querySelector("#createAddressModalLabel").innerHTML = "Update Address";
//                 modalForm.querySelector("#submitButton").innerHTML = "Update Address";
//                 modalForm.querySelector("#addressNumber").innerHTML = `Address ${address.addressNumber}`;
//                 const name = modalForm.querySelector("#name").value = address.name;
//                 const street = modalForm.querySelector("#street").value = address.street;
//                 const city = modalForm.querySelector("#city").value = address.city;
//                 const state = modalForm.querySelector("#state").value = address.state;
//                 const postalCode = modalForm.querySelector("#postalCode").value = address.postalCode;
//                 const phone = modalForm.querySelector("#phone").value = address.phone;
//                 const country = modalForm.querySelector("#country").value = address.country;
//                 const isPrimary = modalForm.querySelector("#isPrimary").checked = address.isPrimary
//             }

//             modalForm.querySelector("#submitButton").addEventListener("click",(e)=>{
//                 console.log("Updated");
//             })

//         })
//     });
    
// })
let address;
let addressId;
let modal;
// Open the Update Address Modal and populate with current address data
document.querySelectorAll('.editButton').forEach(button => {
    button.addEventListener('click', async function(e) {
        // Get the address ID or any unique identifier from the button
        addressId = e.target.getAttribute('data-address-id');
        
        // Fetch the address data from the server
        const response = await fetch(`/user/myAccount/editAddress/${addressId}`);
        const data = await response.json();
        if (data.success) {
            address = data.address;
            // new bootstrap.Modal(document.getElementById('createAddressModal')).show();
            const modalForm = document.getElementById("updateAddressModal");

            modalForm.querySelector("#addressNumberLabel").innerHTML = `${address.addressNumber}`;
            const name = modalForm.querySelector("#updateName").value = address.name;
            const street = modalForm.querySelector("#updateStreet").value = address.street;
            const city = modalForm.querySelector("#updateCity").value = address.city;
            const state = modalForm.querySelector("#updateState").value = address.state;
            const postalCode = modalForm.querySelector("#updatePostalCode").value = address.postalCode;
            const phone = modalForm.querySelector("#updatePhone").value = address.phone;
            const country = modalForm.querySelector("#updateCountry").value = address.country;
            const isPrimary = modalForm.querySelector("#updateIsPrimary").checked = address.isPrimary
            // Populate the form with the current address data
            // document.getElementById('addressNumberLabel').innerText = address.addressNumber;
            // document.getElementById('updateName').value = address.name;
            // document.getElementById('updateStreet').value = address.street;
            // document.getElementById('updateCity').value = address.city;
            // document.getElementById('updateState').value = address.state;
            // document.getElementById('updatePostalCode').value = address.postalCode;
            // document.getElementById('updatePhone').value = address.phone;
            // document.getElementById('updateCountry').value = address.country;
            // document.getElementById('updateIsPrimary').checked = address.isPrimary;

            // Store the original values to check for changes
            address.originalValues = { ...address };
            // console.log("address.orginlaValues",address.originalValues);
            // Show the modal
            modal = new bootstrap.Modal(document.getElementById('updateAddressModal'));
            modal.show();
        } else {
            alert('Failed to load address data');
        }
    });
});

// Handle form submission for updating address
document.getElementById('updateAddressForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    // Get the updated values from the form
    const updatedAddress = {
        name: document.getElementById('updateName').value.trim(),
        street: document.getElementById('updateStreet').value.trim(),
        city: document.getElementById('updateCity').value.trim(),
        state: document.getElementById('updateState').value.trim(),
        postalCode: document.getElementById('updatePostalCode').value.trim(),
        phone: document.getElementById('updatePhone').value.trim(),
        country: document.getElementById('updateCountry').value.trim(),
        isPrimary: document.getElementById('updateIsPrimary').checked,
    };

    // Get the original values stored when the modal was opened
    const originalAddress = address.originalValues;
    // console.log('Orginale',originalAddress);
    console.log("address.orginlaValues",address.originalValues);
    console.log(updatedAddress);

    // Check if any changes have been made
    const isChanged = Object.keys(updatedAddress).some(key => updatedAddress[key] !== originalAddress[key]);

    if (!isChanged) {
        Swal.fire({
            icon: 'info',
            title: 'No Changes Detected',
            text: 'No changes were made to the address.'
        });
        return;
    }

    // Basic validation: Check if all fields are filled
    if (!updatedAddress.name) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Name is required.'
        });
        return;
    }

    if (!updatedAddress.street) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Street is required.'
        });
        return;
    }

    if (!updatedAddress.city) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'City is required.'
        });
        return;
    }

    if (!updatedAddress.state) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'State is required.'
        });
        return;
    }

    if (!updatedAddress.postalCode) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Postal Code is required.'
        });
        return;
    }

    if (!updatedAddress.country) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Country is required.'
        });
        return;
    }

    if (!updatedAddress.phone) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Phone number is required.'
        });
        return;
    }

    // Validate phone number (10 digits)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(updatedAddress.phone)) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Please enter a valid 10-digit phone number.'
        });
        return;
    }

    // Validate postal code (6 digits)
    const postalCodeRegex = /^[0-9]{6}$/;
    if (!postalCodeRegex.test(updatedAddress.postalCode)) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Please enter a valid 6-digit postal code.'
        });
        return;
    }

    // Get the address ID (pass it with the updated data)
    // const addressId = document.getElementById('addressNumberLabel').innerText;

    // Send the updated address data to the backend
    const response = await fetch(`/user/myAccount/editAddress/${addressId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedAddress),
    });

    const result = await response.json();
    if (result.success) {
        // modal.reset();
        // modal.hide();
        // Success alert using SweetAlert2
        Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: result.message||'Address updated successfully!'
        });
        // const modal = new bootstrap.Modal(document.getElementById('updateAddressModal'));


        // Close the modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('updateAddressModal'));
        modal.hide();
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Failed!',
            text: 'Failed to update address. Please try again.'
        });
    }
});

//Delete Address 
document.querySelectorAll(".deleteBtn").forEach((button)=>{
    button.addEventListener("click",async (e)=>{
        // console.log(e.target.parentElement.parentElement);
        const addressId =  e.target.getAttribute("data-address-id")
        let confirm = await Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!"
          })

          if(confirm.isConfirmed)
          {
            console.log(addressId)
            const response = await fetch(`/user/myAccount/editAddress/${addressId}`,{
                method:"DELETE"
            }); 
            const result = await response.json();
            if(!result.success)
            {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: result.message || "Error in Deleting the data"
                });
            }
            else
            {
                Swal.fire({
                    title: "Deleted!",
                    text: result.message || "Your file has been deleted.",
                    icon: "success"
                });
                e.target.parentElement.parentElement.remove();
            }
          }
        

    })
})