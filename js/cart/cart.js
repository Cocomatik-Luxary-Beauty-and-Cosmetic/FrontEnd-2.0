try{
    const token = localStorage.getItem('authToken');
    if(!token){
        window.location.href = '/pages/account/login.html';
    }
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

    function formatCurrency(amount) {
        return `₹${amount.toFixed(2)}`;
    }

    function loadCart() {
        fetch(cartEndpoint, {
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

                    let totalMRP = 0;
                    let totalActual = 0;

                    items.forEach(item => {
                        const product = item.product_details;
                        const quantity = item.quantity;

                        const mrp = product.mrp * quantity;
                        const price = product.price * quantity;

                        totalMRP += mrp;
                        totalActual += price;
                        console.log(totalMRP)
                        console.log(totalActual)

                        const itemHTML = `
        <div class="cart-item">
            <div class="item-image">
                <img src="https://res.cloudinary.com/cocomatik/${product.display_image}" alt="${product.name}">
        </div>
            <div class="item-details">
                <h3 class="item-name">${product.name}</h3>
                <p class="item-price">
                    <del>₹${product.mrp.toFixed(2)}</del> 
                    <strong>₹${product.price.toFixed(2)}</strong>
                </p>
                <div class="item-actions">
                    <div class="quantity-selector" data-cart-id="${item.id}">
                        <button class="quantity-btn decrement">-</button>
                        <input type="text" class="quantity-input" value="${item.quantity}">
                        <button class="quantity-btn increment">+</button>
                    </div>
                    <button class="remove-btn" data-cart-id="${item.id}">
                        <i class="fas fa-trash-alt"></i> Remove
                    </button>
                </div>
            </div>
        </div>
    `;
                        cartContainer.insertAdjacentHTML("beforeend", itemHTML);
                    });

                    const shippingCharge = totalActual >= 300 ? 0 : 50;
                    document.querySelector(".summary-subtotal").textContent = formatCurrency(totalMRP);
                    document.querySelector(".summary-total-amount").textContent = `₹${(totalActual + shippingCharge).toFixed(2)}`;
                    document.querySelector(".summary-shipping").textContent = `₹${shippingCharge.toFixed(2)}`;
                    document.querySelectorAll(".summary-tax")[1].textContent = formatCurrency(totalMRP-totalActual); // Assuming 2nd .summary-tax is 'Total in Product Discount'

                }
            })
            .catch(error => {
                console.error("Error fetching cart data:", error);
                cartContainer.innerHTML = "<p>Failed to load cart items. Please try again.</p>";
            });
    }

    // Initial load
    loadCart();

    // Event Delegation for increment/decrement/remove
    document.body.addEventListener("click", function (e) {
        if (e.target.classList.contains("increment") || e.target.classList.contains("decrement")) {
            const selector = e.target.closest(".quantity-selector");
            const input = selector.querySelector(".quantity-input");
            const cartItemId = selector.dataset.cartId;
            let quantity = parseInt(input.value);

            if (e.target.classList.contains("increment")) {
                quantity += 1;
            } else if (e.target.classList.contains("decrement") && quantity > 1) {
                quantity -= 1;
            }

            input.value = quantity;
            updateCartItemQuantity(cartItemId, quantity);
        }

        if (e.target.closest(".remove-btn")) {
            const cartItemId = e.target.closest(".remove-btn").dataset.cartId;
            deleteCartItem(cartItemId);
        }
    });

    function updateCartItemQuantity(cartItemId, newQuantity) {
        fetch("https://engine.cocomatik.com/api/orders/cart/update/", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `token ${token}`,
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
                loadCart();
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
                "Authorization": `token ${token}`,
            },
            body: JSON.stringify({
                cart_item_id: cartItemId,
            }),
        })
            .then(res => {
                if (!res.ok) throw new Error("Failed to delete cart item.");
                // Don't try to parse if it's 204 No Content
                if (res.status === 204) return {};
                return res.json();
            })
            .then(data => {
                console.log("Item deleted:", data);
                loadCart(); // Refresh the cart UI
            })
            .catch(err => console.error("Delete error:", err));
    }

});

} catch (error) {
    console.error('Critical error:', error);
    window.location.href = '/pages/account/login.html'; // Fallback redirect in case of major errors
}
