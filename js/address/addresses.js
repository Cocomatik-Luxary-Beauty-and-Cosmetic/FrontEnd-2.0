try{
    const token = localStorage.getItem('authToken');
    if(!token){
        window.location.href = '/pages/account/login.html';
    }


document.addEventListener("DOMContentLoaded", function () { // 🔐 Use your actual token
    const addressApi = "https://engine.cocomatik.com/api/addresses/";
    const addressList = document.querySelector(".address-list");

    fetch(addressApi, {
        method: 'GET',
        headers: {
            'Authorization': `token ${token}`,
            'Content-Type': 'application/json'
        }
    })
        .then(res => res.json())
        .then(data => {
            const addresses = Array.isArray(data[0]) ? data[0] : data;

            addresses.forEach(addr => {
                const card = document.createElement("div");
                card.className = "address-card";

                let iconClass = "fas fa-home";
                let label = "Home";
                if (addr.address_type === "work") {
                    iconClass = "fas fa-briefcase";
                    label = "Work";
                } else if (addr.address_type === "other") {
                    iconClass = "fas fa-map-marker-alt";
                    label = "Other";
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
                `;

                addressList.appendChild(card);
            });

            // ✅ Add new address card
            const card2 = document.createElement("div");
            card2.className = "add-address-card";
            card2.innerHTML = `
            <div class="add-address-card" onclick="addNewAddress()">
                <i class="fas fa-plus-circle"></i>
                <p>Add New Address</p>
            </div>
            
        `;
            card2.addEventListener('click', function () {
                window.location.href = '/pages/address/add-address.html';
            });
            addressList.appendChild(card2);

        })
        .catch(err => {
            console.error("Failed to load addresses:", err);
            addressList.innerHTML = "<p>Error loading addresses</p>";
        });
});
document.addEventListener("DOMContentLoaded", function () {
    const container = document.querySelector('.address-list'); // Single element with class
    if (container) {
        container.addEventListener('click', function (event) {
            if (event.target && event.target.classList.contains('btn-edit-address')) {
                const addressId = event.target.getAttribute('data-address-id');
                editAddress(addressId, event.target);
            }
        });
    } else {
        console.warn("address-list container not found in DOM.");
    }
});



function addNewAddress() {
    // Redirect to edit_address.html with the addressId as a query parameter
    window.location.href = `/pages/address/add-address.html`;
}

document.addEventListener("DOMContentLoaded", function () {
    const addressList = document.querySelector('.address-list');

    if (addressList) {
        addressList.addEventListener('click', function (event) {
            const editBtn = event.target.closest('.btn-edit-address');
            const removeBtn = event.target.closest('.btn-remove-address');

            if (editBtn) {
                const id = editBtn.getAttribute('data-id');
                editAddress(id, editBtn);
            } else if (removeBtn) {
                const id = removeBtn.getAttribute('data-id');
                removeAddress(id, removeBtn);
            }
        });
    } else {
        console.warn("address-list not found in DOM.");
    }
});

function editAddress(addressId, button) {
    window.location.href = `/pages/address/editaddress.html?address_id=${addressId}`;
}

function removeAddress(id, button) {
    const url = `https://engine.cocomatik.com/api/addresses/${id}/`;

    if (!confirm("Are you sure you want to delete this address?")) return;

    fetch(url, {
        method: 'DELETE',
        headers: {
            'Authorization': `token ${token}`,
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            if (response.ok) {
                const card = button.closest(".address-card");
                card.remove();
                alert("Address deleted successfully!");
            } else {
                throw new Error("Failed to delete address");
            }
        })
        .catch(error => {
            console.error("Delete error:", error);
            alert("Error deleting address");
        });
}
} catch (error) {
    console.error('Critical error:', error);
    window.location.href = '/pages/account/login.html'; // Fallback redirect in case of major errors
}

