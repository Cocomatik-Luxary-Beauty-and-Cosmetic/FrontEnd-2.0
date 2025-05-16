try {
  const token = localStorage.getItem("authToken")
  if (!token) {
    window.location.href = "/pages/account/login.html"
  }

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

    // Close popup when clicking outside (only for alerts, not for confirmations)
    popupOverlay.addEventListener("click", (e) => {
      if (e.target === popupOverlay && popupButtons.children.length === 1) {
        hidePopup()
      }
    })

    const urlParams = new URLSearchParams(window.location.search)
    const addressId = urlParams.get("address_id")

    if (!addressId) {
      showPopup("No address ID found. Please go back and try again.", [
        {
          text: "Go Back",
          type: "primary",
          callback: () => {
            window.location.href = "/pages/address/addresses.html"
          },
        },
      ])
      return
    }

    // Add loading indicator
    const formContainer = document.querySelector(".form-container")
    const loadingOverlay = document.createElement("div")
    loadingOverlay.className = "loading-overlay"
    loadingOverlay.innerHTML = `
      <div class="loading-spinner">
        <i class="fas fa-spinner fa-spin"></i>
      </div>
      <p>Loading address details...</p>
    `
    formContainer.appendChild(loadingOverlay)

    // Fetch Address Details
    fetch(`https://engine.cocomatik.com/api/addresses/${addressId}/`, {
      method: "GET",
      headers: {
        Authorization: `token ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch address details")
        }
        return response.json()
      })
      .then((data) => {
        // Remove loading overlay
        loadingOverlay.remove()

        if (data) {
          document.getElementById("address_name").value = data.address_name || ""
          document.getElementById("name").value = data.name || ""
          document.getElementById("contact_no").value = data.contact_no || ""
          document.getElementById("house_no").value = data.house_no || ""
          document.getElementById("street").value = data.street || ""
          document.getElementById("locality").value = data.locality || ""
          document.getElementById("district").value = data.district || ""
          document.getElementById("city").value = data.city || ""
          document.getElementById("state").value = data.state || ""
          document.getElementById("pincode").value = data.pincode || ""
          document.getElementById("country").value = data.country || "India"

          const addressType = data.address_type
          const radio = document.querySelector(`input[name="address_type"][value="${addressType}"]`)
          if (radio) {
            radio.checked = true
            document.querySelectorAll(".type-option").forEach((label) => label.classList.remove("active"))
            radio.closest(".type-option").classList.add("active")
          }

          document.getElementById("addressForm").scrollIntoView()
        }
      })
      .catch((error) => {
        console.error("Error fetching address:", error)
        loadingOverlay.remove()
        showPopup("Failed to load address details. Please try again.", [
          {
            text: "Go Back",
            type: "primary",
            callback: () => {
              window.location.href = "/pages/address/addresses.html"
            },
          },
          {
            text: "Retry",
            type: "secondary",
            callback: () => {
              window.location.reload()
            },
          },
        ])
      })

    // Handle radio button UI
    document.querySelectorAll('.type-option input[type="radio"]').forEach((input) => {
      input.addEventListener("change", () => {
        document.querySelectorAll(".type-option").forEach((label) => label.classList.remove("active"))
        input.closest(".type-option").classList.add("active")
      })
    })

    // Submit updated address
    const form = document.getElementById("addressForm")
    form.addEventListener("submit", (e) => {
      e.preventDefault() // prevent default form submit

      // Add loading state to submit button
      const submitBtn = form.querySelector(".btn-save")
      const originalBtnText = submitBtn.textContent
      submitBtn.disabled = true
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...'

      const formData = {
        address_name: document.getElementById("address_name").value,
        name: document.getElementById("name").value,
        contact_no: document.getElementById("contact_no").value,
        house_no: document.getElementById("house_no").value,
        street: document.getElementById("street").value,
        locality: document.getElementById("locality").value,
        district: document.getElementById("district").value,
        city: document.getElementById("city").value,
        state: document.getElementById("state").value,
        pincode: document.getElementById("pincode").value,
        country: document.getElementById("country").value,
        address_type: document.querySelector('input[name="address_type"]:checked').value,
      }

      fetch(`https://engine.cocomatik.com/api/addresses/${addressId}/`, {
        method: "PUT",
        headers: {
          Authorization: `token ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Update failed")
          }
          return response.json()
        })
        .then((updated) => {
          showPopup("Address updated successfully!", [
            {
              text: "OK",
              type: "primary",
              callback: () => {
                window.location.href = "/pages/address/addresses.html"
              },
            },
          ])
        })
        .catch((error) => {
          console.error("Update error:", error)
          // Reset button state
          submitBtn.disabled = false
          submitBtn.textContent = originalBtnText
          showPopup("Failed to update address. Please try again.", [{ text: "OK", type: "primary" }])
        })
    })
  })
} catch (error) {
  console.error("Critical error:", error)
  window.location.href = "/pages/account/login.html" // Fallback redirect in case of major errors
}
