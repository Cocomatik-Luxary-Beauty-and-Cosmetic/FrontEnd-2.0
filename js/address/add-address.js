try{
    const token = localStorage.getItem('authToken');
    if(!token){
        window.location.href = '/pages/account/login.html';
    }

document.querySelectorAll('.type-option input[type="radio"]').forEach((input) => {
    input.addEventListener('change', () => {
        document.querySelectorAll('.type-option').forEach((label) =>
            label.classList.remove('active') // Remove active class from all labels
        );
        input.closest('.type-option').classList.add('active'); // Add active class to selected label
    });
});

document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector("#addressForm");

    form.addEventListener("submit", function (e) {
        e.preventDefault(); // Prevent form default submission

        // Get the selected address type value
        const addressType = document.querySelector('input[name="address_type"]:checked').value;

        // Gather form field values
        const fullName = document.getElementById("name").value.trim();
        const phone = document.getElementById("contact_no").value.trim();
        const addressName = document.getElementById("address_name").value.trim();
        const houseNo = document.getElementById("house_no").value.trim();
        const street = document.getElementById("street").value.trim();
        const locality = document.getElementById("locality").value.trim();
        const district = document.getElementById("district").value.trim();
        const city = document.getElementById("city").value.trim();
        const state = document.getElementById("state").value.trim();
        const pincode = document.getElementById("pincode").value.trim();
        const country = document.getElementById("country").value.trim();

        // Prepare payload for the API request
        const payload = {
            address_type: addressType,
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
            country: country
        };
        console.log(payload)
        // Send the data via Fetch API
        fetch("https://engine.cocomatik.com/api/addresses/", {
            method: "POST",
            headers: {
                "Authorization": `token ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        })
            .then(response => {
                if (!response.ok) throw new Error("Failed to save address");
                return response.json();
            })
            .then(data => {
                alert("Address added successfully!");
                window.location.href = "addresses.html"; 
            })
            .catch(err => {
                console.error("Save error:", err);
                alert("Error saving address");
            });
    });
});
} catch (error) {
    console.error('Critical error:', error);
    window.location.href = '/pages/account/login.html'; // Fallback redirect in case of major errors
}
