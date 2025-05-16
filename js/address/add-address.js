try {
  const token = localStorage.getItem("authToken")
  if (!token) {
    window.location.href = "/pages/account/login.html"
  }

  // Create popup elements and add to DOM
  function createPopup() {
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

    return {
      overlay: popupOverlay,
      container: popupContainer,
      message: popupMessage,
      buttons: popupButtons,
    }
  }

  // Function to show popup
  function showPopup(message, buttons, popup) {
    popup.message.textContent = message
    popup.buttons.innerHTML = ""

    buttons.forEach((button) => {
      const btn = document.createElement("button")
      btn.className = `popup-btn ${button.type || ""}`
      btn.textContent = button.text
      btn.onclick = () => {
        hidePopup(popup)
        if (button.callback) button.callback()
      }
      popup.buttons.appendChild(btn)
    })

    popup.overlay.classList.add("active")
    popup.container.classList.add("active")
  }

  // Function to hide popup
  function hidePopup(popup) {
    popup.container.classList.remove("active")
    popup.overlay.classList.remove("active")
  }

  document.addEventListener("DOMContentLoaded", () => {
    // Create popup
    const popup = createPopup()

    // Close popup when clicking outside
    popup.overlay.addEventListener("click", (e) => {
      if (e.target === popup.overlay) {
        hidePopup(popup)
      }
    })

    // Handle address type selection
    document.querySelectorAll('.type-option input[type="radio"]').forEach((input) => {
      input.addEventListener("change", () => {
        document.querySelectorAll(".type-option").forEach((label) => label.classList.remove("active"))
        input.closest(".type-option").classList.add("active")
      })
    })

    // Set default address type
    const defaultAddressType = document.querySelector('input[name="address_type"][value="home"]')
    if (defaultAddressType) {
      defaultAddressType.checked = true
      defaultAddressType.closest(".type-option").classList.add("active")
    }

    const form = document.querySelector("#addressForm")

    form.addEventListener("submit", (e) => {
      e.preventDefault()

      // Validate form
      const addressType = document.querySelector('input[name="address_type"]:checked')
      if (!addressType) {
        showPopup("Please select an address type", [{ text: "OK", type: "primary" }], popup)
        return
      }

      // Gather form field values
      const fullName = document.getElementById("name").value.trim()
      const phone = document.getElementById("contact_no").value.trim()
      const addressName = document.getElementById("address_name").value.trim()
      const houseNo = document.getElementById("house_no").value.trim()
      const street = document.getElementById("street").value.trim()
      const locality = document.getElementById("locality").value.trim()
      const district = document.getElementById("district").value.trim()
      const city = document.getElementById("city").value.trim()
      const state = document.getElementById("state").value.trim()
      const pincode = document.getElementById("pincode").value.trim()
      const country = document.getElementById("country").value.trim()

      // Prepare payload for the API request
      const payload = {
        address_type: addressType.value,
        name: fullName,
        contact_no: phone,
        address_name: addressName || "Not Provided",
        house_no: houseNo,
        street: street,
        locality: locality || "NA",
        district: district,
        city: city,
        state: state,
        pincode: pincode,
        country: country,
      }

      // Send the data via Fetch API
      fetch("https://engine.cocomatik.com/api/addresses/", {
        method: "POST",
        headers: {
          Authorization: `token ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })
        .then((response) => {
          if (!response.ok) throw new Error("Failed to save address")
          return response.json()
        })
        .then((data) => {
          showPopup(
            "Address added successfully!",
            [
              {
                text: "OK",
                type: "primary",
                callback: () => {
                  window.location.href = "addresses.html"
                },
              },
            ],
            popup,
          )
        })
        .catch((err) => {
          console.error("Save error:", err)
          showPopup("Error saving address", [{ text: "OK", type: "primary" }], popup)
        })
    })
  })
} catch (error) {
  console.error("Critical error:", error)
  window.location.href = "/pages/account/login.html" // Fallback redirect in case of major errors
}
