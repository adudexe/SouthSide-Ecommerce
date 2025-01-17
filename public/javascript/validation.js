

const signUpForm = document.getElementById('signUpForm');

    signUpForm.addEventListener('submit',async (e)=>{
        e.preventDefault();
        const name = document.getElementById('name');
        const nameError = document.getElementById('nameErrorMessage');
        const email = document.getElementById('email');
        const emailError = document.getElementById('emailErrorMessage');
        const passwordInput = document.getElementById('password');
        const passwordError =  document.getElementById('passwordErrorMessage');
        const confirmPassowrdInput = document.getElementById('confirmPassword');
        const confirmPassowrdError = document.getElementById('confirmErrorMessage');
        // const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/ ;
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        
        // const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/;
        const passwordRegex = /^[a-zA-Z0-9]{5,6}$/;

        let isValid = true;

        //Name Validation
        if(name.value.trim() === "")
        {
            isValid = false;
            nameError.textContent = 'Name Field is Required';
        }
        else
        {
            nameError.textContent = ''
        }

        //Email Validation 
        if(!emailRegex.test(email.value))
        {
            isValid = false;
            emailError.textContent = 'Email is Invalid';
        }     
        else
        {
            emailError.textContent = ''
        }

        //Password Validation
        if(!passwordRegex.test(passwordInput.value))
        {
            isValid = false;
            passwordError.textContent = 'Password must be at least 6 characters long, contain at least one uppercase letter, and one number.';
        }
        else
        {
            passwordError.textContent = ''
        }

        //Password Match
        if(passwordInput.value !== confirmPassowrdInput.value)
        {
            isValid = false;
            confirmPassowrdError.textContent = "Password Dosen't Match..";
        }
        else
        {
            confirmPassowrdError.textContent = ''
        }

        
        if(isValid){
            const formData = {
                name: name.value,
                email:email.value,
                password:passwordInput.value
            }
            const response = await fetch('/user/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',  // Specify Content-Type as JSON
                },
                body: JSON.stringify(formData),
            })
            const data = await response.json();

            console.log('response');
            console.log(response);

            console.log('data');
            console.log(data);

            if(data.verifyOTPForm)
            {
                showOTPModal();
            }
            else 
            {
                console.log("OTP Vefiyfailed ")
                alert(data.message);
                window.location.href = data.redirectTo;
                // console.log(response)
            }
        }

    }) // gave an event listener for signUpForm for the event 'submit'

    //To display OTP Modal
    function showOTPModal() {
        const otpModal = document.getElementById("otpModal");
        // alert('An OTP has been sent to your email.');
        const toastMessage = document.getElementById('toast-simple');
        const message = document.getElementById('toastMessage');
        toastMessage.classList.remove("hidden");
        message.innerText = `An OTP is sent to ${email.value}`;
        setTimeout(()=>{
            toastMessage.classList.add("hidden");
        },17000)
        otpModal.classList.remove("hidden");
        startOTPTimer(); // Start the OTP timer
    }

    function startOTPTimer(){
        const timerDisplay = document.getElementById('timer'); 
        const resendButton = document.getElementById('resendOTP');
        const sendButton = document.getElementById('sendOTP');
        let timer;
        let timeLeft=60;
        sendButton.classList.remove("hidden")
         resendButton.classList.add("hidden")
        // sendButton.disbled = true;

        timer = setInterval(()=>{
            if(timeLeft>0)
            {
                timeLeft--;
                timerDisplay.textContent = `You can resend OTP in ${timeLeft}s`;
            }
            else
            {
                clearInterval(timer);
                timerDisplay.textContent = `You can now resend OTP`;
                // sendButton.innerHTML = "Resend OTP"
                resendButton.classList.remove("hidden");
                sendButton.classList.add("hidden")
            }
        },1000)
    }

    function resend(){
        startOTPTimer();
        fetch("/user/resentOTP",{
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({resend:true}),
        })
        console.log("hehe");
    }

    
    async function validateAndSubmitOTP() {
        try {
        event.preventDefault(); // Prevent the form from submitting normally
    
        const otpInput = document.getElementById("otp");
        const otp = otpInput.value.trim();
        const otpErrorMessage = document.getElementById("otpErrorMessage");
    
        // Clear previous error messages
        otpErrorMessage.textContent = "";
        otpErrorMessage.classList.add("hidden");
    
        // Validate OTP
        if (!/^\d{6}$/.test(otp)) {
        alert("Please enter a valid 6-digit numeric OTP.", otpErrorMessage);
        return;
        }
    
        
        // Send OTP to the backend for verification
        const response = await fetch("/user/verifyOtp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp }),
        });
        console.log("response");
        console.log(response);

        const data = await response.json();

        console.log("data")
        console.log(data);

        if (response.ok) {
            alert( data.message || "OTP verified successfully!");
            document.getElementById('otpForm').reset();
            window.location.href = data.redirectTo;

        } else {
            alert("Invalid OTP. Please try again.");
            document.getElementById('otpForm').reset();
        }
        } catch (err) {
        console.error("Error:", err);
        alert("Failed to verify OTP. Please try again.");
        }
    }
    


