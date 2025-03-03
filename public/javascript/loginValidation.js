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
  } else {
    emailError.innerText = "";
    emailError.style.display = "none";
  }

  // Validate password (if needed)
  if (password.value.length < 6) {
    passwordError.innerText = "Password must be at least 6 characters.";
    passwordError.style.display = "block";
    isValid = false;
  } else {
    passwordError.innerText = "";
    passwordError.style.display = "none";
  }

  // Only proceed with the fetch request if the form is valid
  if (isValid) {
    const data = {
      email: email.value,
      password: password.value
    };

    try {
      const response = await fetch("/user/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });

      const details = await response.json();

      if (details.success) {
        window.location.href = "/user/home";
      } else {
        Toast.fire({
          icon: "warning",
          title: details.message || "An error occurred"
        });
      }
    } catch (error) {
      console.error('Error during fetch:', error);
      Toast.fire({
        icon: "error",
        title: "An error occurred while processing your request."
      });
    }
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

// Validate password input (if required)
password.addEventListener("input", () => {
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
