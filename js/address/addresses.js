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

    const addressApi = "https://engine.cocomatik.com/api/addresses/"
    const addressList = document.querySelector(".address-list")

    fetch(addressApi, {
      method: "GET",
      headers: {
        Authorization: `token ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const addresses = Array.isArray(data[0]) ? data[0] : data

        if (addresses.length === 0) {
          // Show message if no addresses
          const emptyMessage = document.createElement("div")
          emptyMessage.className = "empty-addresses"
          emptyMessage.innerHTML = `
            <i class="fas fa-map-marker-alt"></i>
            <h3>No Addresses Found</h3>
            <p>You haven't added any delivery addresses yet.</p>
          `
          addressList.appendChild(emptyMessage)
        } else {
          addresses.forEach((addr) => {
            const card = document.createElement("div")
            card.className = "address-card"

            let iconClass = "fas fa-home"
            let label = "Home"
            if (addr.address_type === "work") {
              iconClass = "fas fa-briefcase"
              label = "Work"
            } else if (addr.address_type === "other") {
              iconClass = "fas fa-map-marker-alt"
              label = "Other"
            }

            card.innerHTML = `
              <div class="address-type">
                <i class="${iconClass}"></i> ${label}
              </div>
              <div class="address-details">
                <p>${addr.name}</p>
                <p>${addr.house_no}, ${addr.street}, ${addr.locality}</p>
                <p>${addr.city}, ${addr.state} ${addr.pincode}</p>
                <p>India</p>
                <p>Phone: +91 ${addr.contact_no}</p>
              </div>
              <div class="address-actions">
                <button class="btn btn-secondary btn-sm btn-edit-address" data-id="${addr.id}">Edit</button>
                <button class="btn btn-danger btn-sm btn-remove-address" data-id="${addr.id}">Remove</button>
              </div>
            `

            addressList.appendChild(card)
          })
        }

        // Add new address card
        const addCard = document.createElement("div")
        addCard.className = "add-address-card"
        addCard.innerHTML = `
          <i class="fas fa-plus-circle"></i>
          <p>Add New Address</p>
        `
        addCard.addEventListener("click", () => {
          window.location.href = "/pages/address/add-address.html"
        })
        addressList.appendChild(addCard)
      })
      .catch((err) => {
        console.error("Failed to load addresses:", err)
        showPopup("Error loading addresses", [{ text: "OK", type: "primary" }])
        
        // Show empty state with error
        addressList.innerHTML = `
          <div class="empty-addresses error">
            <i class="fas fa-exclamation-circle"></i>
            <h3>Couldn't Load Addresses</h3>
            <p>There was a problem loading your addresses. Please try again later.</p>
          </div>
        `
        
        // Still add the "Add New Address" card
        const addCard = document.createElement("div")
        addCard.className = "add-address-card"
        addCard.innerHTML = `
          <i class="fas fa-plus-circle"></i>
          <p>Add New Address</p>
        `
        addCard.addEventListener("click", () => {
          window.location.href = "/pages/address/add-address.html"
        })
        addressList.appendChild(addCard)
      })

    // Event delegation for edit and remove buttons
    if (addressList) {
      addressList.addEventListener("click", (event) => {
        const editBtn = event.target.closest(".btn-edit-address")
        const removeBtn = event.target.closest(".btn-remove-address")

        if (editBtn) {
          const id = editBtn.getAttribute("data-id")
          editAddress(id)
        } else if (removeBtn) {
          const id = removeBtn.getAttribute("data-id")
          confirmRemoveAddress(id, removeBtn)
        }
      })
    }

    function editAddress(addressId) {
      window.location.href = `/pages/address/editaddress.html?address_id=${addressId}`
    }

    function confirmRemoveAddress(id, button) {
      showPopup("Are you sure you want to delete this address?", [
        {
          text: "Yes, Delete",
          type: "danger",
          callback: () => removeAddress(id, button),
        },
        { text: "Cancel", type: "secondary" },
      ])
    }

    function removeAddress(id, button) {
      const url = `https://engine.cocomatik.com/api/addresses/${id}/`

      // Show loading state
      const card = button.closest(".address-card")
      card.classList.add("loading")
      button.disabled = true
      button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Removing...'

      fetch(url, {
        method: "DELETE",
        headers: {
          Authorization: `token ${token}`,
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          if (response.ok) {
            // Success animation
            card.classList.add("removing")
            
            // Wait for animation to complete
            setTimeout(() => {
              card.remove()
              showPopup("Address deleted successfully!", [{ text: "OK", type: "primary" }])
              
              // Check if there are no more addresses
              const remainingAddresses = document.querySelectorAll(".address-card")
              if (remainingAddresses.length === 0) {
                const emptyMessage = document.createElement("div")
                emptyMessage.className = "empty-addresses"
                emptyMessage.innerHTML = `
                  <i class="fas fa-map-marker-alt"></i>
                  <h3>No Addresses Found</h3>
                  <p>You haven't added any delivery addresses yet.</p>
                `
                // Insert before the add card
                const addCard = document.querySelector(".add-address-card")
                addressList.insertBefore(emptyMessage, addCard)
              }
            }, 300)
          } else {
            throw new Error("Failed to delete address")
          }
        })
        .catch((error) => {
          console.error("Delete error:", error)
          card.classList.remove("loading")
          button.disabled = false
          button.textContent = "Remove"
          showPopup("Error deleting address", [{ text: "OK", type: "primary" }])
        })
    }
  })
} catch (error) {
  console.error("Critical error:", error)
  window.location.href = "/pages/account/login.html" // Fallback redirect in case of major errors
}
