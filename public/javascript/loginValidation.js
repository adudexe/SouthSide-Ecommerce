

const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    const email = document.getElementById("email");
    const password = document.getElementById("password");
    const emailError = document.getElementById("emailErrorMessage");
    const passwordError = document.getElementById("passwordErrorMessage");
    
    // Prevent form submission if invalid
    document.getElementById("loginForm").addEventListener("submit", async function (event) {
      event.preventDefault();
        let isValid = true;

      // Validate email on form submission
      if (!emailRegex.test(email.value)) {
        emailError.innerText = "Please enter a valid email address.";
        emailError.style.display = "block";
        isValid = false;
      }

      // If invalid, prevent form submission
      if (!isValid) {
        event.preventDefault();
      }
      const data = {
        email:email.value,
        password:password.value
      }

      const response = await fetch("/user/login",{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify(data)
      })
          // console.log(response);

      const details = await response.json();
     
      if(details.success) 
      {
        window.location.href = "/user/home";
      }
      else
      {
        Toast.fire({
          icon: "warning",
          title:  details.message ||"An error occurred"
        });
      }
    
    });

    // Validate email input as the user types
    email.addEventListener("input", () => {
      if (!emailRegex.test(email.value)) {
        emailError.innerText = "Please enter a valid email address.";
        emailError.style.display = "block";
      } else {
        emailError.innerText = "";
        emailError.style.display = "none";
      }
    });

    // You can add similar validation for password input (if required)
    password.addEventListener("input", () => {
      // You can check for minimum password length or other criteria here
      if (password.value.length < 6) {
        passwordError.innerText = "Password must be at least 6 characters.";
        passwordError.style.display = "block";
      } else {
        passwordError.innerText = "";
        passwordError.style.display = "none";
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
    

    // console.log("<%= error %>")