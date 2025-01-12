document.addEventListener("DOMContentLoaded", (e) => {
    try {
        // Get modal element
        const modalElement = document.getElementById('editDetailsModal');
        
        // Check if the modal element exists
        if (!modalElement) {
        throw new Error("Modal element not found.");
        }

        // Initialize Bootstrap modal
        const modal = new bootstrap.Modal(modalElement);

        // let name = document.getElementById("currentName");
        // console.log(user);
        

        const userDetails = {
            // name: document.querySelector("#editName").value,
            // email: document.querySelector("#editEmail").value,
        };
    
        // When the "Edit" button is clicked, store initial user details
        document.getElementById("userEditButton").addEventListener("click", (e) => {
            // console.log(name.innerText);
            userDetails.name = document.querySelector("#currentName").innerText;
            userDetails.email = document.querySelector("#currentEmail").innerText;
            document.querySelector("#editName").value = userDetails.name
            document.querySelector("#editEmail").value = userDetails.email
            modal.show();
        });
    
        // When the "Save" button is clicked, submit the updated user details
        document.getElementById("saveDetails").addEventListener("click", async (e) => {
            e.preventDefault();
            // console.log("Save Details")
    
            // // Get the modal element by ID
            // const modal = new bootstrap.Modal(document.getElementById("editDetailsModal"));
            modal.hide();
            
            // Collect updated details from the form
            const updatedUserDetails = {
                name: document.querySelector("#editName").value,
                email: document.querySelector("#editEmail").value,
            };
    
            // Validate form inputs
            if (!updatedUserDetails.name || !updatedUserDetails.email) {
                // Show SweetAlert2 for missing fields
                return Swal.fire({
                    icon: 'error',
                    title: 'Validation Error',
                    text: 'Both name and email are required.',
                });
            }
    
            // Simple email format validation
            const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!emailPattern.test(updatedUserDetails.email)) {
                return Swal.fire({
                    icon: 'error',
                    title: 'Invalid Email',
                    text: 'Please enter a valid email address.',
                });
            }
    
            // Check if any of the details have changed
            const isChanged = Object.keys(userDetails).some((key) => userDetails[key] !== updatedUserDetails[key]);
    
            if (isChanged) {
                try {
                    console.log("HI");
                    // Send updated details to the server
                    const response = await fetch("/user/myAccount/editProfile", {
                        method: "PATCH",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(updatedUserDetails),
                    });

                    console.log("response",response)
                    const details = await response.json();
                    console.log(details)
                    if (response.ok) {
                        // If the request was successful, update userDetails and hide the modal
                        userDetails.name = updatedUserDetails.name;
                        userDetails.email = updatedUserDetails.email;
    
                        
    
                        // Show success message using SweetAlert2
                        Swal.fire({
                            icon: 'success',
                            title: 'Success!',
                            text: 'Your details have been updated successfully.',
                        });
                        // Hide the modal programmatically
                        modal.hide()
                        document.getElementById('editDetailsModal').classList.remove('show');
                        document.getElementById('editDetailsModal').style.display = 'none';

    
                    } else {
                        // Handle errors returned from the server
                        Swal.fire({
                            icon: 'error',
                            title: 'Update Failed',
                            text: 'There was an error updating your details. Please try again.',
                        });
                    }

                    const dashboard =  document.getElementById("dashboard");
                    const card = document.createElement("div");
    
                    card.innerHTML = `
                     <div class="card">
                        <div class="card-header">
                            <h5 class="mb-0">Hello ${userDetails.name}!</h5>
                        </div>
                        <div class="card-body">
                            <!-- Display user details dynamically -->
                            <p><strong>Name:</strong> ${userDetails.name}</p>
                            <p><strong>Email:</strong> ${userDetails.email}</p>
                            
                            <!-- Button to reset password -->
                            <a href="" class="btn btn-primary">Reset Password</a>
                            
                            <!-- Button to trigger modal to edit details -->
                            <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#editDetailsModal" id="userEditButton">Edit Details</button>
                        </div>
                    </div>
                    `
                    dashboard.innerHTML="";
                    dashboard.appendChild(card);
    
    
                    
                } catch (error) {
                    // Handle network or other errors
                    console.error("Error:", error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'An error occurred while updating your details. Please try again later.',
                    });
                }
            } else {
                // If no changes were made
                Swal.fire({
                    icon: 'info',
                    title: 'No Changes',
                    text: 'You haven\'t made any changes to your details.',
                });
            }
        });
    } catch (error) {
        console.log(error);
    }
});
