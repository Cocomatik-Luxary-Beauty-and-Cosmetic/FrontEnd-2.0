try {
  const token = localStorage.getItem("authToken");
  if (!token) {
    window.location.href = "login.html";
  }
  async function fetchAndRenderOrder() {
    const urlParams = new URLSearchParams(window.location.search);
    const orderNumber = urlParams.get("order_number");

    if (!orderNumber) {
      document.body.innerHTML = "<h2>Order number is missing!</h2>";
      return;
    }

    try {
      const response = await fetch("https://engine.cocomatik.com/api/orders/", {
        method: "GET",
        headers: {
          Authorization: `token ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      const filteredOrders = data.processed.filter(
        (order) => order.order_number === orderNumber
      );

      if (!filteredOrders.length) {
        document.body.innerHTML = `<h2>No order found with number: ${orderNumber}</h2>`;
        return;
      }

      const order = filteredOrders[0]; // Get the first matching order

      function renderOrderDetails(order) {
        // Order Info Bar
        const infoItems = document.querySelectorAll(
          ".order-info-item .info-value"
        );
        infoItems[0].textContent = order.order_number;
        infoItems[1].textContent = new Date(order.created_at).toDateString();
        infoItems[2].textContent =
          order.payment_mode === "PG"
            ? "Online Payment (PG)"
            : order.payment_mode;
        document.querySelector(".status-badge").textContent = order.status;

        // Shipping Address
        const addressBox = document.querySelector(".address-box");
        addressBox.innerHTML = `
                <div class="address-name">${order.rcv_name}</div>
                <div>${order.rcv_house_no}, ${order.rcv_street}</div>
                <div>${order.rcv_city}, ${order.rcv_locality}</div>
                <div>${order.rcv_district}, ${order.rcv_state}, ${order.rcv_pincode}</div>
                <div>Phone: ${order.rcv_contact_no}</div>
            `;

        // Payment Info
        const paymentPanel = document.querySelector(
          ".panel:nth-child(2) .panel-body"
        );
        paymentPanel.innerHTML = `
                <p><strong>Payment Method:</strong> ${
                  order.payment_mode === "PG"
                    ? "Online Payment (PG)"
                    : order.payment_mode
                }</p>
                <p><strong>Subtotal:</strong>  ₹${order.sub_total}</p>
                <p><strong>Shipping:</strong>  ₹${order.shipping_charges}</p>
                <p><strong>COD Charges:</strong>  ₹${order.cod_charges}</p>
                <p><strong>Total:</strong>  ₹${order.total_price}</p>
            `;

        // Items Table
        const tbody = document.querySelector(".product-list tbody");
        tbody.innerHTML = "";

        order.items.forEach((item) => {
          const pd = item.product_details;

          // Create a new row
          const row = document.createElement("tr");

          row.innerHTML = `
        <td data-label="Image">
            <div class="product-image">
                <img src="https://res.cloudinary.com/cocomatik/${
                  pd.display_image
                }" alt="${pd.name}" style="width:60px;">
            </div>
        </td>
        <td data-label="Product">
            <div class="product-name">${pd.name}</div>
            <div class="product-sku">SKU: ${item.sku}</div>
        </td>
        <td data-label="Price"> ₹${item.selling_price}</td>
        <td data-label="Quantity">${item.quantity}</td>
        <td data-label="Total" style="text-align: right;"> ₹${(
          item.quantity * item.selling_price
        ).toFixed(2)}</td>
    `;

          // Add click event to the row
          row.addEventListener("click", () => {
            localStorage.setItem(
              "productDetailsId",
              JSON.stringify({ sku: item.sku })
            );
            localStorage.setItem("producttype", item.sku.split("-")[0]);
            console.log("Product ID stored:", item.sku);
            window.location.href = "/pages/product/productdetails.html";
          });

          // Append the row to tbody
          tbody.appendChild(row);
        });

        // Summary Table
        const summaryTable = document.querySelector(".summary-table");
        summaryTable.innerHTML = `
                <tr><td class="summary-label">Subtotal</td><td class="summary-value"> ₹${order.sub_total}</td></tr>
                <tr><td class="summary-label">Shipping Charges</td><td class="summary-value"> ₹${order.shipping_charges}</td></tr>
                <tr><td class="summary-label">COD Charges</td><td class="summary-value"> ₹${order.cod_charges}</td></tr>
                <tr><td class="summary-label">Tax</td><td class="summary-value"> ₹${order.tax}</td></tr>
                <tr><td class="summary-label">Discount</td><td class="summary-value"> ₹${order.discount}</td></tr>
                <tr><td class="summary-label">Total</td><td class="summary-value"> ₹${order.total_price}</td></tr>
            `;
      }

      renderOrderDetails(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      document.body.innerHTML = `<h2>Failed to load order. Please try again later.</h2>`;
    }
  }

  fetchAndRenderOrder();
} catch (error) {
  console.error("Critical error:", error);
  window.location.href = "login.html"; // Fallback redirect in case of major errors
}
