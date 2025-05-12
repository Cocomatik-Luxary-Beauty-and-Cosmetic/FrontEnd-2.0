document.addEventListener("DOMContentLoaded", function () {
    const urlParams = new URLSearchParams(window.location.search);
    const addressId = urlParams.get('address_id');
    const token = localStorage.getItem("authToken");

    if (!addressId) {
        console.error("No address_id found in URL");
        return;
    }

    // Fetch Address Details
    fetch(`https://engine.cocomatik.com/api/addresses/${addressId}/`, {
        method: "GET",
        headers: {
            "Authorization": `token ${token}`,
            "Content-Type": "application/json"
        }
    })
        .then(response => response.json())
        .then(data => {
            if (data) {
                document.getElementById('address_name').value = data.address_name || '';
                document.getElementById('name').value = data.name || '';
                document.getElementById('contact_no').value = data.contact_no || '';
                document.getElementById('house_no').value = data.house_no || '';
                document.getElementById('street').value = data.street || '';
                document.getElementById('locality').value = data.locality || '';
                document.getElementById('district').value = data.district || '';
                document.getElementById('city').value = data.city || '';
                document.getElementById('state').value = data.state || '';
                document.getElementById('pincode').value = data.pincode || '';
                document.getElementById('country').value = data.country || 'India';

                const addressType = data.address_type;
                const radio = document.querySelector(`input[name="address_type"][value="${addressType}"]`);
                if (radio) {
                    radio.checked = true;
                    document.querySelectorAll('.type-option').forEach((label) => label.classList.remove('active'));
                    radio.closest('.type-option').classList.add('active');
                }

                document.getElementById('addressForm').scrollIntoView();
            }
        })
        .catch(error => {
            console.error("Error fetching address:", error);
        });

    // Handle radio button UI
    document.querySelectorAll('.type-option input[type="radio"]').forEach((input) => {
        input.addEventListener('change', () => {
            document.querySelectorAll('.type-option').forEach((label) =>
                label.classList.remove('active')
            );
            input.closest('.type-option').classList.add('active');
        });
    });

    // Submit updated address
    const form = document.getElementById('addressForm');
    form.addEventListener('submit', function (e) {
        e.preventDefault(); // prevent default form submit

        const formData = {
            address_name: document.getElementById('address_name').value,
            name: document.getElementById('name').value,
            contact_no: document.getElementById('contact_no').value,
            house_no: document.getElementById('house_no').value,
            street: document.getElementById('street').value,
            locality: document.getElementById('locality').value,
            district: document.getElementById('district').value,
            city: document.getElementById('city').value,
            state: document.getElementById('state').value,
            pincode: document.getElementById('pincode').value,
            country: document.getElementById('country').value,
            address_type: document.querySelector('input[name="address_type"]:checked').value
        };

        fetch(`https://engine.cocomatik.com/api/addresses/${addressId}/`, {
            method: "PUT",
            headers: {
                "Authorization": `token ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formData)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error("Update failed");
                }
                return response.json();
            })
            .then(updated => {
                alert("Address updated successfully!");
                window.location.href = "/pages/address/addresses.html";
            })
            .catch(error => {
                console.error("Update error:", error);
                alert("Failed to update address.");
            });
    });
});