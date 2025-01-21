// const Toast = Swal.mixin({
    //   toast: true,
    //   position: "top-end",
    //   showConfirmButton: false,
    //   timer: 3000,
    //   timerProgressBar: true,
    //   didOpen: (toast) => {
    //     toast.onmouseenter = Swal.stopTimer;
    //     toast.onmouseleave = Swal.resumeTimer;
    //   }
    // });
    document.getElementById('forgetPasswordLink').addEventListener('click', function(e) {
        e.preventDefault();
        Swal.fire({
          title: 'Enter your email',
          input: 'email',
          inputLabel: 'Email address',
          inputPlaceholder: 'Enter your email',
          showCancelButton: true,
          confirmButtonText: 'Submit',
          cancelButtonText: 'Cancel',
          preConfirm: (email) => {
            if (!email) {
              Swal.showValidationMessage('Please enter your email!');
              return false;
            }
            return email;
          }
        }).then((result) => {
          if (result.isConfirmed) {
            // Call your API to send OTP here
            // sendOtpModal(result.value);
            emailVerification(result.value);
            // console.log(result.value);
          }
        });
      });
  
      async function emailVerification(email)
      {
        let response = await fetch("/user/forgetPassword",{
          method:"POST",
          headers:{
            "Content-Type":"application/json"
          },
          body:JSON.stringify({email})
        })
        let details = await response.json();
        if(details.success)
        {
          sendOtpModal();
        }
        else
        {
          Swal.fire({
          title: "Error",
          text: details.message|| "Email Not Found",
          icon: "error"
          });
        }
  
      }
  
  
  
  
  
      // OTP Modal with Resend Button
      function sendOtpModal() {
    let countdown = 60;  // Initial countdown value
    let interval;  // Store the interval reference for later clearing
  
    Swal.fire({
      title: 'Enter OTP sent to your email',
      input: 'text',
      inputPlaceholder: 'Enter OTP',
      showCancelButton: true,
      confirmButtonText: 'Verify OTP',
      cancelButtonText: 'Resend OTP',
      allowOutsideClick: false,  // Prevent closing the modal when clicking outside
      allowEscapeKey: false,     // Prevent closing the modal with the Escape key
      didOpen: () => {
        const resendButton = Swal.getCancelButton();
        resendButton.setAttribute('disabled', true);  // Disable the resend OTP button initially
  
        // Start the countdown when the modal opens
        startCountdown();
  
        // Handle Resend OTP logic
        resendButton.onclick = async function (e) {
          e.preventDefault();  // Prevent modal from closing on clicking Resend OTP
          resetCountdown();  // Reset the countdown when Resend OTP is clicked
          // Call your API to resend the OTP or whatever logic you want
          console.log('Resending OTP...');
        };
      },
      preConfirm: async (otp) => {
        if (!otp) {
          Swal.showValidationMessage('Please enter the OTP!');
          return false;  // Keep modal open until OTP is provided
        }
  
        // Perform OTP verification here
        const isOtpValid = await otpVerification(otp);
  
        if (isOtpValid) {
          // If OTP is valid, proceed to new password modal
          newPasswordModal();
          return true; // Close the OTP modal after success
        } else {
          // If OTP is invalid, show validation message and keep modal open
          Swal.showValidationMessage('OTP is invalid.');
          return false; // Keep the modal open if OTP is invalid
        }
      }
    });
  
    // Function to start the countdown
    function startCountdown() {
      const resendButton = Swal.getCancelButton();
      resendButton.textContent = `Resend OTP (${countdown}s)`;  // Set initial countdown text
      interval = setInterval(() => {
        countdown--;
        if (countdown <= 0) {
          clearInterval(interval);  // Stop the countdown
          resendButton.removeAttribute('disabled');  // Enable the Resend OTP button
          resendButton.textContent = 'Resend OTP';  // Reset the text after countdown ends
        } else {
          resendButton.textContent = `Resend OTP (${countdown}s)`;  // Update the countdown text
        }
      }, 1000);
    }
  
    // Function to reset the countdown and start it again
    function resetCountdown() {
      countdown = 60;  // Reset countdown to 60 seconds
      clearInterval(interval);  // Clear the previous interval
      startCountdown();  // Start the countdown again
    }
  }
  
  
  
  
  async function otpVerification(otp) {
    const response = await fetch("/user/forgetPassword/otpMatch", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ otp })
    });
  
    const details = await response.json();
  
    if (details.success) {
      return true;  // OTP is valid
    } else {
      // Toast.fire({
      //   icon: "error",
      //   title: details.message || "Invalid OTP"
      // });
      return false;  // OTP is invalid
    }
  }
  
  
  
  function newPasswordModal() {
    Swal.fire({
      title: 'Enter your new password',
      html: `
        <input id="oldPassword" type="password" class="swal2-input" placeholder="Old password">
        <input id="newPassword" type="password" class="swal2-input" placeholder="New password">
      `,
      showCancelButton: true,
      confirmButtonText: 'Submit',
      cancelButtonText: 'Cancel',
      preConfirm: () => {
        const oldPassword = document.getElementById('oldPassword').value;
        const newPassword = document.getElementById('newPassword').value;
  
        if (!newPassword || !oldPassword) {
          Swal.showValidationMessage('Please enter both passwords!');
          return false;
        }
  
        // if (newPassword !== confirmPassword) {
        //   Swal.showValidationMessage('Passwords do not match!');
        //   return false;
        // }
  
        return { newPassword,oldPassword }
        // updatePassword(newPassword);
        
      }
    }).then((result) => {
      if (result.isConfirmed) {
        console.log("Result",result);
        // Proceed to call your API to update the password
        const { newPassword,oldPassword } = result.value;
        console.log("New Password is ",{ newPassword,oldPassword } );
        // API call to update the password
        updatePassword(newPassword,oldPassword)
        // {
          // Swal.fire('Password changed!', '', 'success');
        // }
        // Example: updatePassword(newPassword);
  
        
      }
    });
  }
  
  async function updatePassword(newPassword, oldPassword) {
    try {
      // Send the request to the server to update the password
      const response = await fetch("/user/forgetPassword/newPassword", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ newPassword, oldPassword })  // Send passwords as JSON in the body
      });
  
      console.log(response);
      // Check if the request was successful
      // if (!response.ok) {
      //   // If the response status is not OK, throw an error
      //   throw new Error('Failed to update the password');
      // }
  
      // Parse the JSON response
      const details = await response.json();
      console.log(details);
      // Check if the server response indicates success
      if (details.success) {
        // Show success message (e.g., using Swal, Toast, or console)
        Swal.fire('Password changed!', '', 'success');
      } else {
        // If not successful, show error message from the response
        Swal.fire('Error', details.message || 'Failed to change password', 'error');
      }
  
    } catch (error) {
      // Handle any errors that occur during the fetch or response parsing
      console.error('Error updating password:', error);
      Swal.fire('Error', 'An unexpected error occurred. Please try again later.', 'error');
    }
  }
  
    