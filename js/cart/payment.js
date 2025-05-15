try{
    const token = localStorage.getItem('authToken');
    if(!token){
        window.location.href = '/pages/account/login.html';
    }
const selectedAddressId = localStorage.getItem("selectedAddressId");

let isCODSelected = false;
let totalActual = 0;
let shippingCharge = 0;
let codCharge = 0;

document.addEventListener("DOMContentLoaded", () => {
    fetchAddressData(selectedAddressId);
    fetchCartData();

    const codRadio = document.getElementById("cod");
    const upiRadio = document.getElementById("upi");

    codRadio.addEventListener("change", () => {
        isCODSelected = true;
        togglePaymentButtons();
        fetchCartData();
    });

    upiRadio.addEventListener("change", () => {
        isCODSelected = false;
        togglePaymentButtons();
        fetchCartData();
    });

    togglePaymentButtons(); // Initial toggle check

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
                e.preventDefault();
                alert("Please select an address before continuing to payment.");
            }
        });
    }

    const proceedBtn = document.querySelector(".navigation-buttons a:nth-child(3)");
    if (proceedBtn) {
        proceedBtn.addEventListener("click", (e) => {
            e.preventDefault();

            const selectedAddressId = localStorage.getItem("selectedAddressId");
            if (!selectedAddressId) {
                alert("Please select an address before proceeding.");
                return;
            }

            // Prepare values for order placement
            codCharge = isCODSelected ? 50 : 0;
            shippingCharge = totalActual >= 300 ? 0 : 50;

            fetch("https://engine.cocomatik.com/api/orders/place/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `token ${token}`
                },
                body: JSON.stringify({
                    address_id: selectedAddressId,
                    payment_mode: isCODSelected ? "COD" : "PG",
                    shipping_charges: shippingCharge,
                    cod_charges: codCharge
                })
            })
                .then(res => {
                    if (!res.ok) throw new Error("Order placement failed");
                    return res.json();
                })
                .then(data => {
                    console.log(data)
                    const orderNumber = data.order_id;
                        window.location.href = `/pages/cart/confirmation.html?order_number=${orderNumber}`;
                        localStorage.removeItem("selectedAddressId")
                })
                .catch(err => {
                    console.error("Order Placement Error:", err);
                    alert("Failed to place order. Try again later.");
                });
        });
    }
});

function fetchAddressData(selectedAddressId) {
    fetch(`https://engine.cocomatik.com/api/addresses/${selectedAddressId}/`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `token ${token}`
        }
    })
        .then(res => res.json())
        .then(address => {
            const adrsContainer = document.querySelector(".info-details");
            if (adrsContainer) {
                adrsContainer.innerHTML = `
                    <p><strong>${address.name}</strong></p>
                    <p>${address.house_no}, ${address.street}, ${address.locality}</p>
                    <p>${address.city}, ${address.district}, ${address.state} - ${address.pincode}</p>
                    <p>Phone: ${address.contact_no}</p>
                `;
            }
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
            totalActual = 0; // reset global totalActual

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

            codCharge = isCODSelected ? 50 : 0;
            shippingCharge = totalActual >= 300 ? 0 : 50;

            const summaryValues = document.querySelectorAll(".summary-value");
            if (summaryValues.length >= 6) {
                summaryValues[0].textContent = formatCurrency(totalMRP);                     // Subtotal
                summaryValues[1].textContent = formatCurrency(shippingCharge);               // Shipping
                summaryValues[2].textContent = formatCurrency(codCharge);                    // COD
                summaryValues[3].textContent = formatCurrency(0);                            // Tax
                summaryValues[4].textContent = formatCurrency(totalMRP - totalActual);       // Discount
                summaryValues[5].textContent = formatCurrency(totalActual + shippingCharge + codCharge); // Total
            }
        })
        .catch(error => {
            console.error("Cart Load Error:", error);
        });
}

function togglePaymentButtons() {
    const payBtn = document.querySelector(".navigation-buttons a:nth-child(2)");
    const proceedBtn = document.querySelector(".navigation-buttons a:nth-child(3)");

    if (isCODSelected) {
        payBtn.style.display = "none";
        proceedBtn.style.display = "inline-block";
    } else {
        payBtn.style.display = "inline-block";
        proceedBtn.style.display = "none";
    }
}

function formatCurrency(amount) {
    return `₹${amount.toFixed(2)}`;
}
} catch (error) {
    console.error('Critical error:', error);
    window.location.href = '/pages/account/login.html'; // Fallback redirect in case of major errors
}
