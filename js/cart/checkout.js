const token = localStorage.getItem("authToken");

document.addEventListener("DOMContentLoaded", () => {
    fetchAddressData();
    fetchCartData();
});

function fetchAddressData() {
    fetch("https://engine.cocomatik.com/api/addresses/", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `token ${token}`
        }
    })
        .then(res => res.json())
        .then(addresses => {
            const addressContainer = document.querySelector(".saved-addresses");
            addressContainer.innerHTML = ""; // clear any static HTML

            addresses.forEach((addr, index) => {
                const addressDiv = document.createElement("div");
                addressDiv.classList.add("address-option");
                if (index === 0) addressDiv.classList.add("selected"); // first one selected by default

                addressDiv.innerHTML = `
                    <input type="radio" name="address"}>
                    <div class="address-details">
                        <div class="address-type">
                            <i class="fas fa-${addr.address_type === "Home" ? "home" : "briefcase"}"></i> ${addr.address_type}
                        </div>
                        <div class="address-text">
                            <p>${addr.name}</p>
                            <p>${addr.house_no}, ${addr.street}, ${addr.locality}</p>
                            <p>${addr.city}, ${addr.district}, ${addr.state} - ${addr.pincode}</p>
                            <p>India</p>
                            <p>Phone: ${addr.contact_no}</p>
                        </div>
                    </div>
                `;

                addressContainer.appendChild(addressDiv);
                // After injecting addresses
                const addressRadios = document.querySelectorAll(".address-option input[type='radio']");

                document.querySelectorAll('.address-option').forEach(option => {
                    option.addEventListener('click', () => {
                        // Check the radio inside this block
                        const radio = option.querySelector('input[type="radio"]');
                        if (radio) radio.checked = true;

                        // Remove 'selected' from all
                        document.querySelectorAll('.address-option').forEach(opt => {
                            opt.classList.remove('selected');
                        });

                        // Add 'selected' to current
                        option.classList.add('selected');
                    });
                });


            });

            // 🔁 Iterate and log each address
            const addressOptions = addressContainer.querySelectorAll(".address-option");
            addressOptions.forEach((addressDiv, i) => {
                const isSelected = addressDiv.classList.contains("selected");
                const addressText = addressDiv.querySelector(".address-text").innerText.trim();
                console.log(`Address ${i + 1}:`);
                console.log("Selected:", isSelected);
                console.log("Details:\n", addressText);
            });
        })
        .catch(error => console.error("Address Load Error:", error));
}


function fetchCartData() {
    const orderItemsDiv = document.querySelector(".order-items");
    const subtotalSpan = document.getElementById("summary-subtotal");
    const taxSpan = document.getElementById("summary-tax");
    const totalSpan = document.getElementById("summary-total");
    const shippingSpan = document.getElementById("summary-shipping");

    fetch("https://engine.cocomatik.com/api/orders/cart/", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `token ${token}`
        }
    })
    .then(response => {
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        return response.json();
    })
    .then(data => {
        orderItemsDiv.innerHTML = ""; // Clear previous items

        let totalMRP = 0;
        let totalActual = 0;

        data.items.forEach(item => {
            const product = item.product_details;
            const quantity = item.quantity;
            const mrp = product.mrp * quantity;
            const price = product.price * quantity;

            totalMRP += mrp;
            totalActual += price;

            const itemHTML = `
                <div class="order-item">
                    <div class="order-item-image">
                        <img src="https://engine.cocomatik.com/media/${product.display_image}" alt="${product.name}">
                        <span class="item-quantity">${quantity}</span>
                    </div>
                    <div class="order-item-details">
                        <h4 class="order-item-name">${product.name}</h4>
                        <p class="order-item-price">₹${price.toFixed(2)}</p>
                    </div>
                </div>
            `;
            orderItemsDiv.insertAdjacentHTML("beforeend", itemHTML);
        });

        // Pricing details
        const tax = Math.round(totalActual * 0.1); // assuming 10% tax
        const shipping = 0; // flat shipping
        const total = totalActual + tax + shipping;

        subtotalSpan.textContent = `₹${totalActual.toFixed(2)}`;
        taxSpan.textContent = `₹${tax}`;
        shippingSpan.textContent = `₹${shipping}`;
        totalSpan.textContent = `₹${total.toFixed(2)}`;
    })
    .catch(error => {
        console.error("Cart Load Error:", error);
    });
}
