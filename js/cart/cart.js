
document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem("authToken");
    const cartEndpoint = "https://engine.cocomatik.com/api/orders/cart/";

    const cartContainer = document.querySelector(".cart-items");
    const summarySubtotal = document.querySelector(".summary-row .summary-value");
    const summaryTotal = document.querySelector(".summary-total .summary-value");
    const emptyCart = document.querySelector(".empty-cart");
    const cartSummary = document.querySelector(".cart-summary");
    const cartTitle = document.querySelector(".page-title");

    if (!token) {
        console.error("No access token found. Redirecting to login...");
        return;
    }

    // Format currency (₹)
    function formatCurrency(amount) {
        return `₹${amount.toFixed(2)}`;
    }

    fetch(cartEndpoint, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `token ${token}`
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            const items = data.items;
            console.log("Cart data:", data);

            if (!items || items.length === 0) {
                cartContainer.innerHTML = "";
                cartSummary.style.display = "none";
                cartTitle.textContent = "Your Shopping Cart";
                emptyCart.style.display = "block";
            } else {
                emptyCart.style.display = "none";
                cartSummary.style.display = "block";
                cartTitle.textContent = `Your Shopping Cart (${data.total_items} items)`;
                cartContainer.innerHTML = "";

                items.forEach(item => {
                    const product = item.product_details;
                    const itemHTML = `
                    <div class="cart-item">
                        <div class="item-image">
                            <img src="https://res.cloudinary.com/cocomatik/${product.display_image}" alt="${product.name}">
                        </div>
                        <div class="item-details">
                            <h3 class="item-name">${product.name}</h3>
                            <p class="item-price">${formatCurrency(product.price)}</p>
                            <div class="item-actions">
                                <div class="quantity-selector">
                                    <button class="quantity-btn">-</button>
                                    <input type="text" class="quantity-input" value="${item.quantity}">
                                    <button class="quantity-btn">+</button>
                                </div>
                                <button class="remove-btn">
                                    <i class="fas fa-trash-alt"></i> Remove
                                </button>
                                <button class="save-for-later">
                                    <i class="fas fa-heart"></i> Save for later
                                </button>
                            </div>
                        </div>
                    </div>
                `;
                    cartContainer.insertAdjacentHTML("beforeend", itemHTML);
                });

                // Summary calculations
                const subtotal = data.total_value;
                const tax = subtotal * 0.1; // 10% tax (example)
                const total = subtotal + tax;

                summarySubtotal.textContent = formatCurrency(subtotal);
                summaryTotal.textContent = formatCurrency(total);
            }
        })
        .catch(error => {
            console.error("Error fetching cart data:", error);
            cartContainer.innerHTML = "<p>Failed to load cart items. Please try again.</p>";
        });
});


function updateCartItemQuantity(cartItemId, newQuantity) {
    const token = localStorage.getItem("authToken");

    if (!token) return alert("You're not logged in!");

    fetch("https://engine.cocomatik.com/api/orders/cart/update/", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Token ${token}`,
        },
        body: JSON.stringify({
            cart_item_id: cartItemId,
            quantity: newQuantity,
        }),
    })
        .then(res => {
            if (!res.ok) throw new Error("Failed to update quantity.");
            return res.json();
        })
        .then(data => {
            console.log("Quantity updated:", data);
            loadCart(); // Refresh the cart UI
        })
        .catch(err => console.error("Update error:", err));
}

function deleteCartItem(cartItemId) {
    const token = localStorage.getItem("authToken");

    if (!token) return alert("You're not logged in!");

    fetch("https://engine.cocomatik.com/api/orders/cart/delete/", {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Token ${token}`,
        },
        body: JSON.stringify({
            cart_item_id: cartItemId,
        }),
    })
        .then(res => {
            if (!res.ok) throw new Error("Failed to delete cart item.");
            return res.json(); // Django might return empty body with 204
        })
        .then(data => {
            console.log("Item deleted:", data);
            loadCart(); // Refresh the cart UI
        })
        .catch(err => console.error("Delete error:", err));
}
minusBtn.addEventListener("click", () => {
    const currentQty = parseInt(quantityInput.value);
    if (currentQty > 1) {
        updateCartItemQuantity(cartItem.id, currentQty - 1);
    }
});

plusBtn.addEventListener("click", () => {
    const currentQty = parseInt(quantityInput.value);
    updateCartItemQuantity(cartItem.id, currentQty + 1);
});

removeBtn.addEventListener("click", () => {
    if (confirm("Remove this item from cart?")) {
        deleteCartItem(cartItem.id);
    }
});
