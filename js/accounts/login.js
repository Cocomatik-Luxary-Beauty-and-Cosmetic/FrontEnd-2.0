document.addEventListener("DOMContentLoaded", () => {
    const emailForm = document.getElementById('emailForm');
    const loginBtn = document.getElementById("loginBtn");
    const verifyButton = document.getElementById('verifyButton');
    const veryfy = document.getElementById("veryfy");
    const EmailLoginBox = document.getElementById("EmailLoginBox");
    const OtpLoginBox = document.getElementById("OtpLoginBox");
    const EmailIdGet = document.getElementById("EmailIdGet");
    const OtpVerfy = document.getElementById("OtpVerfy");
    const otpMsg = document.getElementById('OTPmsg');
    const backButton = document.getElementById('backButton');
    const resetOtpBtn = document.getElementById("resetOtpBtn");
    const inputs = document.querySelectorAll('.otp-inputs input');

    // Handle email form submission
    emailForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        loginBtn.style.backgroundColor = "gray";

        const email = document.getElementById('email').value;
        localStorage.setItem("userEmail", email);
        const jsonData = { "email": email };

        try {
            const response = await fetch('https://engine.cocomatik.com/api/send_otp_login/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(jsonData)
            });

            const result = await response.json();
            console.log('Response: ' + JSON.stringify(result));

            veryfy.style.display = "flex";
            setTimeout(() => {
                EmailLoginBox.style.display = "none";
                OtpLoginBox.style.display = "flex";
            }, 3000);

        } catch (error) {
            alert('Error: ' + error.message);
        }

        EmailIdGet.innerHTML = email;
    });

    // Handle OTP inputs navigation
    inputs.forEach((input, index) => {
        input.addEventListener('input', () => {
            if (input.value && index < inputs.length - 1) {
                inputs[index + 1].focus();
            }
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && !input.value && index > 0) {
                inputs[index - 1].focus();
            }
        });
    });

    // Back button clears OTP inputs
    backButton.addEventListener('click', () => {
        inputs.forEach(input => (input.value = ''));
        inputs[0].focus();
    });

    // Verify OTP
    verifyButton.addEventListener('click', async () => {
        verifyButton.style.backgroundColor = "gray";
        verifyButton.disabled = true;

        let email = localStorage.getItem("userEmail");
        console.log(email);

        if (!email) {
            otpMsg.textContent = 'Email not found. Please enter your email again.';
            verifyButton.disabled = false;
            return;
        }

        let otp = Array.from(inputs).map(input => input.value).join('');

        if (otp.length !== inputs.length) {
            otpMsg.textContent = 'Please enter the complete OTP';
            verifyButton.disabled = false;

            setTimeout(() => {
                verifyButton.style.backgroundColor = "";
                otpMsg.textContent = '';
            }, 3000);
        
            return;
        }

        try {
            const response = await fetch('https://engine.cocomatik.com/api/login/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp })
            });

            const data = await response.json();

            if (response.ok) {
                console.log('Token:', data.token);
                localStorage.setItem('authToken', data.token);
                OtpVerfy.style.display = "flex";

                // Fetch profile details after login
                fetchUserProfile(data.token);

                setTimeout(() => {
                    window.location.href = "/index.html";
                    verifyButton.style.backgroundColor = "";
                }, 3000);
            } else {
                otpMsg.textContent = data.message || 'Invalid OTP';
                verifyButton.disabled = false;
                setTimeout(() => {
                    verifyButton.style.backgroundColor = "";
                    otpMsg.textContent = '';
                }, 3000);
            }
        } catch (error) {
            console.error('Error:', error);
            otpMsg.textContent = 'Network error, please try again';
            setTimeout(() => {
                verifyButton.style.backgroundColor = "";
                otpMsg.textContent = '';
            }, 3000);
        }
    });

    // Function to fetch user profile after login
    function fetchUserProfile(token) {
        const apiUrl = 'https://engine.cocomatik.com/api/profile/';

        fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Authorization': `token ${token}`,
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            console.log("Profile data:", data);
            localStorage.setItem("username", `${data.first_name} ${data.last_name}`);
            localStorage.setItem("gender", data.gender);
        })
        .catch(error => {
            console.error("Failed to fetch profile:", error);
        });
    }
});
