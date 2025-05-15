const token = `token ${localStorage.getItem("authToken")}`;  // Replace with actual token
const urlParams = new URLSearchParams(window.location.search); 
const orderNumber = urlParams.get('order_number');

fetch("https://engine.cocomatik.com/api/orders/details/", {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        "Authorization": token
    },
    body: JSON.stringify({ order_number: orderNumber })
})
    .then(res => res.json())
    .then(data => {
        document.querySelector(".order-number").textContent = "#" + data.order_number;
        console.log(data)
        // Estimate delivery: today + 3 to 5 days
        const createdDate = new Date(data.created_at);
        const start = new Date(createdDate);
        start.setDate(start.getDate() + 5);
        const end = new Date(createdDate);
        end.setDate(end.getDate() + 7);
        document.getElementById("delivery-range").textContent =
            `${start.toDateString()} - ${end.toDateString()}`;

        // Shipping Address
        document.getElementById("shipping-address").innerHTML = `
        <p>${data.rcv_name}</p>
        <p>${data.rcv_house_no}, ${data.rcv_street}, ${data.rcv_locality}</p>
        <p>${data.rcv_city}, ${data.rcv_state} ${data.rcv_pincode}</p>
        <p>${data.rcv_district}, India</p>
      `;

        // Payment Method
        document.getElementById("payment-method").innerHTML = `
        <p>${data.payment_mode === "COD" ? "Cash on Delivery" : data.payment_mode}</p>
      `;

        // Order Items
        const itemsContainer = document.getElementById("order-items");
        data.cart_items.forEach(item => {
            itemsContainer.innerHTML += `
          <div class="order-item">
            <div class="item-image">
              <img src="https://res.cloudinary.com/cocomatik/${item.product_details.display_image}" alt="${item.product_details.name}" />
            </div>
            <div class="item-details">
              <h4 class="item-name">${item.product_details.name}</h4>
              <p class="item-price">₹${parseFloat(item.product_details.price).toFixed(2)}</p>
              <p class="item-quantity">Quantity: ${item.quantity}</p>
            </div>
          </div>
        `;
        });

        // Order Summary
        document.getElementById("order-summary").innerHTML = `
        <div class="summary-row"><span class="summary-label">Subtotal</span><span class="summary-value">₹${data.sub_total}</span></div>
        <div class="summary-row"><span class="summary-label">Shipping</span><span class="summary-value">₹${data.shipping_charges}</span></div>
        <div class="summary-row"><span class="summary-label">COD Charges</span><span class="summary-value">₹${data.cod_charges}</span></div>
        <div class="summary-row"><span class="summary-label">Tax</span><span class="summary-value">₹${data.tax}</span></div>
        <div class="summary-row summary-total"><span class="summary-label">Total</span><span class="summary-value">₹${data.total_price}</span></div>
      `;
    })
    .catch(err => {
        console.error("Failed to load order details:", err);
    });