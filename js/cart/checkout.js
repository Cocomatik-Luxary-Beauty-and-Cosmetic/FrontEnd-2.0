try{
    const token = localStorage.getItem('authToken');
    if(!token){
        window.location.href = '/pages/account/login.html';
    }

document.addEventListener("DOMContentLoaded", () => {
    fetchAddressData();
    fetchCartData();

    // Attach event to "Continue to Payment" button
    const continueBtn = document.querySelector(".navigation-buttons .btn[href='/pages/cart/payment.html']");
    if (continueBtn) {
        continueBtn.addEventListener("click", (e) => {
            const selectedOption = document.querySelector(".address-option.selected");
            if (selectedOption) {
                const addressId = selectedOption.getAttribute("data-id");
                if (addressId) {
                    localStorage.setItem("selectedAddressId", addressId);
                    console.log("Selected Address ID saved to localStorage:", addressId);
                }
            } else {
                e.preventDefault(); // prevent navigation
                alert("Please select an address before continuing to payment.");
            }
        });
    }
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
        addressContainer.innerHTML = "";

        addresses.forEach((addr, index) => {
            const addressDiv = document.createElement("div");
            addressDiv.classList.add("address-option");
            addressDiv.setAttribute("data-id", addr.id); // 👈 store id on the element
            if (index === 0) addressDiv.classList.add("selected");

            addressDiv.innerHTML = `
                <input type="radio" name="address">
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
        });

        document.querySelectorAll('.address-option').forEach(option => {
            option.addEventListener('click', () => {
                document.querySelectorAll('.address-option').forEach(opt => {
                    opt.classList.remove('selected');
                    const radio = opt.querySelector('input[type="radio"]');
                    if (radio) radio.checked = false;
                });

                option.classList.add('selected');
                const selectedRadio = option.querySelector('input[type="radio"]');
                if (selectedRadio) selectedRadio.checked = true;
            });
        });
    })
    .catch(error => console.error("Address Load Error:", error));
}

function fetchCartData() {
    const orderItemsDiv = document.querySelector(".order-items");

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
        orderItemsDiv.innerHTML = "";

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
                        <img src="https://res.cloudinary.com/cocomatik/${product.display_image}" alt="${product.name}">
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
        const shippingCharge = totalActual >= 300 ? 0 : 50;
        const summaryValues = document.querySelectorAll(".summary-value");
        if (summaryValues.length >= 4) {
            summaryValues[0].textContent = formatCurrency(totalMRP);                      // Subtotal
            summaryValues[1].textContent = formatCurrency(shippingCharge);                             // Tax (assumed 0)
            summaryValues[2].textContent = formatCurrency(0);                             // Tax (assumed 0)
            summaryValues[3].textContent = formatCurrency(totalMRP - totalActual);        // Discount
            summaryValues[4].textContent = formatCurrency(totalActual+shippingCharge);                   // Total
        }
    })
    .catch(error => {
        console.error("Cart Load Error:", error);
    });
}

function formatCurrency(amount) {
    return `₹${amount.toFixed(2)}`;
}
} catch (error) {
    console.error('Critical error:', error);
    window.location.href = '/pages/account/login.html'; // Fallback redirect in case of major errors
}
