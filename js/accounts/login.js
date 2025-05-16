document.addEventListener("DOMContentLoaded", () => {
  // Create popup elements and add to DOM
  const popupOverlay = document.createElement("div")
  popupOverlay.className = "popup-overlay"

  const popupContainer = document.createElement("div")
  popupContainer.className = "popup-container"

  const popupContent = document.createElement("div")
  popupContent.className = "popup-content"

  const popupMessage = document.createElement("p")
  popupMessage.className = "popup-message"

  const popupButtons = document.createElement("div")
  popupButtons.className = "popup-buttons"

  popupContent.appendChild(popupMessage)
  popupContent.appendChild(popupButtons)
  popupContainer.appendChild(popupContent)
  popupOverlay.appendChild(popupContainer)
  document.body.appendChild(popupOverlay)

  // Function to show popup
  function showPopup(message, buttons) {
    popupMessage.textContent = message
    popupButtons.innerHTML = ""

    buttons.forEach((button) => {
      const btn = document.createElement("button")
      btn.className = `popup-btn ${button.type || ""}`
      btn.textContent = button.text
      btn.onclick = () => {
        hidePopup()
        if (button.callback) button.callback()
      }
      popupButtons.appendChild(btn)
    })

    popupOverlay.classList.add("active")
    popupContainer.classList.add("active")
  }

  // Function to hide popup
  function hidePopup() {
    popupContainer.classList.remove("active")
    popupOverlay.classList.remove("active")
  }

  // Close popup when clicking outside
  popupOverlay.addEventListener("click", (e) => {
    if (e.target === popupOverlay) {
      hidePopup()
    }
  })

  const emailForm = document.getElementById("emailForm")
  const loginBtn = document.getElementById("loginBtn")
  const verifyButton = document.getElementById("verifyButton")
  const veryfy = document.getElementById("veryfy")
  const EmailLoginBox = document.getElementById("EmailLoginBox")
  const OtpLoginBox = document.getElementById("OtpLoginBox")
  const EmailIdGet = document.getElementById("EmailIdGet")
  const OtpVerfy = document.getElementById("OtpVerfy")
  const otpMsg = document.getElementById("OTPmsg")
  const backButton = document.getElementById("backButton")
  const inputs = document.querySelectorAll(".otp-inputs input")

  // Add resend OTP button and timer container
  const resendContainer = document.createElement("div")
  resendContainer.className = "resend-container"
  resendContainer.innerHTML = `
    <div class="timer-container">
      <span>Resend OTP in </span>
      <span id="timer">50</span>
      <span> seconds</span>
    </div>
    <button id="resendOtpBtn" class="resend-btn" disabled>Resend OTP</button>
  `

  // Insert after OTP inputs
  const otpEnterBox = document.querySelector(".otp-enter-box")
  otpEnterBox.appendChild(resendContainer)

  const timerElement = document.getElementById("timer")
  const resendOtpBtn = document.getElementById("resendOtpBtn")
  let timerInterval

  // Function to start the resend timer
  function startResendTimer(seconds = 50) {
    clearInterval(timerInterval)

    let remainingTime = seconds
    timerElement.textContent = remainingTime
    resendOtpBtn.disabled = true

    const timerContainer = document.querySelector(".timer-container")
    timerContainer.style.display = "inline-block"

    timerInterval = setInterval(() => {
      remainingTime--
      timerElement.textContent = remainingTime

      if (remainingTime <= 0) {
        clearInterval(timerInterval)
        resendOtpBtn.disabled = false
        timerContainer.style.display = "none"
      }
    }, 1000)
  }

  // Handle email form submission
  emailForm.addEventListener("submit", async (event) => {
    event.preventDefault()

    loginBtn.style.backgroundColor = "gray"
    loginBtn.disabled = true

    const email = document.getElementById("email").value
    localStorage.setItem("userEmail", email)
    const jsonData = { email: email }

    try {
      const response = await fetch("https://engine.cocomatik.com/api/send_otp_login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jsonData),
      })

      const result = await response.json()
      console.log("Response: " + JSON.stringify(result))

      if (response.ok) {
        veryfy.style.display = "flex"
        setTimeout(() => {
          EmailLoginBox.style.display = "none"
          OtpLoginBox.style.display = "flex"
          // Start the resend timer when OTP is sent
          startResendTimer()
        }, 3000)

        EmailIdGet.innerHTML = email
      } else {
        showPopup(result.message || "Failed to send OTP", [{ text: "OK", type: "primary" }])
        loginBtn.style.backgroundColor = ""
        loginBtn.disabled = false
      }
    } catch (error) {
      console.error("Error:", error)
      showPopup("Network error. Please try again.", [{ text: "OK", type: "primary" }])
      loginBtn.style.backgroundColor = ""
      loginBtn.disabled = false
    }
  })

  // Handle OTP inputs navigation
  inputs.forEach((input, index) => {
    input.addEventListener("input", () => {
      // Remove non-numeric characters
      input.value = input.value.replace(/[^0-9]/g, "")

      // Only keep the first digit
      if (input.value.length > 1) {
        input.value = input.value[0]
      }

      if (input.value && index < inputs.length - 1) {
        inputs[index + 1].focus()
      }
    })

    input.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && !input.value && index > 0) {
        inputs[index - 1].focus()
      }
    })
  })

  // Back button functionality
  backButton.addEventListener("click", () => {
    // Clear OTP inputs
    inputs.forEach((input) => (input.value = ""))

    // Go back to email screen
    OtpLoginBox.style.display = "none"
    EmailLoginBox.style.display = "flex"

    // Reset login button
    loginBtn.style.backgroundColor = ""
    loginBtn.disabled = false

    // Clear any timer
    clearInterval(timerInterval)
  })

  // Resend OTP button
  resendOtpBtn.addEventListener("click", async () => {
    const email = localStorage.getItem("userEmail")

    if (!email) {
      showPopup("Email not found. Please enter your email again.", [
        {
          text: "OK",
          type: "primary",
          callback: () => {
            OtpLoginBox.style.display = "none"
            EmailLoginBox.style.display = "flex"
          },
        },
      ])
      return
    }

    resendOtpBtn.disabled = true

    try {
      const response = await fetch("https://engine.cocomatik.com/api/send_otp_login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const result = await response.json()

      if (response.ok) {
        showPopup("OTP resent successfully!", [{ text: "OK", type: "primary" }])
        // Clear OTP inputs
        inputs.forEach((input) => (input.value = ""))
        inputs[0].focus()
        // Restart the timer
        startResendTimer()
      } else {
        showPopup(result.message || "Failed to resend OTP", [{ text: "OK", type: "primary" }])
        resendOtpBtn.disabled = false
      }
    } catch (error) {
      console.error("Error:", error)
      showPopup("Network error. Please try again.", [{ text: "OK", type: "primary" }])
      resendOtpBtn.disabled = false
    }
  })

  // Verify OTP
  verifyButton.addEventListener("click", async () => {
    verifyButton.style.backgroundColor = "gray"
    verifyButton.disabled = true

    const email = localStorage.getItem("userEmail")
    console.log(email)

    if (!email) {
      showPopup("Email not found. Please enter your email again.", [
        {
          text: "OK",
          type: "primary",
          callback: () => {
            OtpLoginBox.style.display = "none"
            EmailLoginBox.style.display = "flex"
          },
        },
      ])
      verifyButton.style.backgroundColor = ""
      verifyButton.disabled = false
      return
    }

    const otp = Array.from(inputs)
      .map((input) => input.value)
      .join("")

    if (otp.length !== inputs.length) {
      showPopup("Please enter the complete OTP", [{ text: "OK", type: "primary" }])
      verifyButton.style.backgroundColor = ""
      verifyButton.disabled = false
      return
    }

    try {
      const response = await fetch("https://engine.cocomatik.com/api/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      })

      const data = await response.json()

      if (response.ok) {
        console.log("Token:", data.token)
        localStorage.setItem("authToken", data.token)
        OtpVerfy.style.display = "flex"

        // Fetch profile details after login
        fetchUserProfile(data.token)

        setTimeout(() => {
          window.location.href = "/index.html"
        }, 3000)
      } else {
        showPopup(data.message || "Invalid OTP", [{ text: "OK", type: "primary" }])
        verifyButton.style.backgroundColor = ""
        verifyButton.disabled = false
      }
    } catch (error) {
      console.error("Error:", error)
      showPopup("Network error, please try again", [{ text: "OK", type: "primary" }])
      verifyButton.style.backgroundColor = ""
      verifyButton.disabled = false
    }
  })

  // Function to fetch user profile after login
  function fetchUserProfile(token) {
    const apiUrl = "https://engine.cocomatik.com/api/profile/"

    fetch(apiUrl, {
      method: "GET",
      headers: {
        Authorization: `token ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Profile data:", data)
        localStorage.setItem("username", `${data.first_name} ${data.last_name}`)
        localStorage.setItem("gender", data.gender)
      })
      .catch((error) => {
        console.error("Failed to fetch profile:", error)
      })
  }
})
