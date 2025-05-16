try {
  const token = localStorage.getItem("authToken")
  if (!token) {
    window.location.href = "login.html"
  }

  document.addEventListener("DOMContentLoaded", function () {
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

    const apiUrl = "https://engine.cocomatik.com/api/profile/"
    const form = document.querySelector(".profile-form")
    const cancelButton = document.querySelector(".btn-secondary")

    // Handle cancel button
    cancelButton.addEventListener("click", function () {
      location.reload()
    })

    // --- GET Request: Populate form with existing data ---
    fetch(apiUrl, {
      method: "GET",
      headers: {
        Authorization: `token ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        document.getElementById("firstName").value = data.first_name || ""
        document.getElementById("lastName").value = data.last_name || ""
        document.getElementById("email").value = data.email || ""
        document.getElementById("phone").value = data.phone || ""
        document.getElementById("age").value = data.age || ""

        if (data.gender === "male" || data.gender === "female") {
          document.querySelector(`input[name="gender"][value="${data.gender}"]`).checked = true
        } else {
          document.querySelector(`input[name="gender"][value="other"]`).checked = true
        }
        localStorage.setItem("username", `${data.first_name} ${data.last_name}`)
        localStorage.setItem("gender", data.gender)
      })
      .catch((error) => {
        console.error("Error loading profile:", error)
        showPopup("Could not load profile data", [{ text: "OK", type: "primary" }])
      })

    // --- PUT Request: Update profile on submit ---
    form.addEventListener("submit", function (e) {
      e.preventDefault()

      const body = {
        first_name: document.getElementById("firstName").value || null,
        last_name: document.getElementById("lastName").value || null,
        phone: document.getElementById("phone").value,
        age: parseInt(document.getElementById("age").value),
        gender: document.querySelector('input[name="gender"]:checked').value,
      }

      fetch(apiUrl, {
        method: "PUT",
        headers: {
          Authorization: `token ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to update profile")
          return res.json()
        })
        .then((data) => {
          console.log("Updated profile:", data)
          localStorage.setItem("gender", data.gender)
          showPopup("Profile updated successfully!", [
            {
              text: "OK",
              type: "primary",
              callback: () => {
                location.reload()
              },
            },
          ])
        })
        .catch((error) => {
          console.error("Update error:", error)
          showPopup("Failed to update profile", [{ text: "OK", type: "primary" }])
        })
    })
  })
} catch (error) {
  console.error("Critical error:", error)
  window.location.href = "login.html" // Fallback redirect in case of major errors
}
