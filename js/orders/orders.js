document.addEventListener("DOMContentLoaded", () => {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) {
      return (window.location.href = "/pages/account/login.html");
    }

    // Create popup elements and add to DOM
    const popupOverlay = document.createElement("div");
    popupOverlay.className = "popup-overlay";

    const popupContainer = document.createElement("div");
    popupContainer.className = "popup-container";

    const popupContent = document.createElement("div");
    popupContent.className = "popup-content";

    const popupMessage = document.createElement("p");
    popupMessage.className = "popup-message";

    const popupButtons = document.createElement("div");
    popupButtons.className = "popup-buttons";

    popupContent.appendChild(popupMessage);
    popupContent.appendChild(popupButtons);
    popupContainer.appendChild(popupContent);
    popupOverlay.appendChild(popupContainer);
    document.body.appendChild(popupOverlay);

    // Show popup
    window.showPopup = (message, buttons) => {
      popupMessage.textContent = message;
      popupButtons.innerHTML = "";

      buttons.forEach((button) => {
        const btn = document.createElement("button");
        btn.className = `popup-btn ${button.type || ""}`;
        btn.textContent = button.text;
        btn.onclick = () => {
          window.hidePopup();
          if (button.callback) button.callback();
        };
        popupButtons.appendChild(btn);
      });

      popupOverlay.classList.add("active");
      popupContainer.classList.add("active");
    };

    // Hide popup
    window.hidePopup = () => {
      popupContainer.classList.remove("active");
      popupOverlay.classList.remove("active");
    };

    // Close popup when clicking outside popup container
    popupOverlay.addEventListener("click", (e) => {
      if (e.target === popupOverlay) {
        window.hidePopup();
      }
    });

    // Format currency helper
    const formatCurrency = (value) => `₹${Number.parseFloat(value).toFixed(2)}`;

    // Render items into HTML with data attribute for SKU
    function renderItems(items) {
      return items
        .map(
          (item) => `
          <div class="order-item" data-sku="${item.sku}" style="cursor:pointer;">
              <div class="item-image">
                  <img src="https://res.cloudinary.com/cocomatik/${item.product_details.display_image}" alt="${item.product_details.name}" />
              </div>
              <div class="item-details">
                  <h4 class="item-name">${item.product_details.name}</h4>
                  <p class="item-price">${formatCurrency(item.product_details.price)}</p>
                  <p class="item-quantity">Quantity: ${item.quantity}</p>
              </div>
          </div>
        `
        )
        .join("");
    }

    // Handle product click: store SKU and redirect
    function handleProductClick(item) {
      localStorage.setItem("productDetailsId", JSON.stringify({ sku: item.sku }));
      localStorage.setItem("producttype", item.sku.split("-")[0]);
      console.log("Product ID stored:", item.sku);
      window.location.href = "/pages/product/productdetails.html";
    }

    const orderList = document.querySelector(".order-list");

    fetch("https://engine.cocomatik.com/api/orders/", {
      method: "GET",
      headers: {
        Authorization: `token ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const pendingOrders = data.pending || [];
        const processedOrders = data.processed || [];

        // Render Pending Orders
        if (pendingOrders.length > 0) {
          const pendingTitle = document.createElement("p");
          pendingTitle.className = "page-subtitle";
          pendingTitle.textContent = "Pending Orders";
          orderList.appendChild(pendingTitle);

          pendingOrders.forEach((order) => {
            const orderCard = document.createElement("div");
            orderCard.className = "order-card";
            orderCard.innerHTML = `
              <div class="order-header">
                  <div>
                      <span class="order-id">Order #${order.order_number}</span>
                      <span class="order-date">Placed on ${new Date(order.created_at).toLocaleDateString()}</span>
                  </div>
                  <span class="order-status status-pending">${order.status}</span>
              </div>
              <div class="order-items">
                  ${renderItems(order.cart_items)}
              </div>
              <div class="order-footer">
                  <div class="address-ot">
                      Address: ${order.rcv_name} ${order.rcv_address_name} ${order.rcv_house_no}, ${order.rcv_street}, ${order.rcv_locality}, ${order.rcv_city}, ${order.rcv_district}, ${order.rcv_state} - ${order.rcv_pincode} <br>
                      Contact: ${order.rcv_contact_no}
                  </div>
              </div>
              <div class="order-footer">
                  <div class="order-total">Total: ${formatCurrency(order.total_price)}</div>
                  <div class="order-actions">
                      <button class="btn btn-sm cancel-btn">Cancel</button>
                  </div>
              </div>
            `;
            orderList.appendChild(orderCard);

            // Bind product clicks on order items
            orderCard.querySelectorAll(".order-item").forEach((el, index) => {
              const item = order.cart_items[index];
              el.addEventListener("click", (e) => {
                if (e.target.closest("button")) return; // ignore clicks on buttons
                handleProductClick(item);
              });
            });

            // Bind cancel button
            orderCard.querySelector(".cancel-btn").addEventListener("click", () => {
              cancelOrder(order.order_number, order.created_at);
            });
          });
        }

        // Render Processed Orders
        if (processedOrders.length > 0) {
          const processedTitle = document.createElement("p");
          processedTitle.className = "page-subtitle";
          processedTitle.textContent = "Orders Approved";
          orderList.appendChild(processedTitle);

          processedOrders.forEach((order) => {
            const orderCard = document.createElement("div");
            orderCard.className = "order-card";
            orderCard.innerHTML = `
              <div class="order-header">
                  <div>
                      <span class="order-id">Order #${order.order_number}</span>
                      <span class="order-date">Placed on ${new Date(order.created_at).toLocaleDateString()}</span>
                  </div>
                  <span class="order-status status-delivered">${order.status}</span>
              </div>
              <div class="order-items">
                  ${renderItems(order.items)}
              </div>
              <div class="order-footer">
                  <div class="address-ot">
                      Address: ${order.rcv_name} ${order.rcv_address_name} ${order.rcv_house_no}, ${order.rcv_street}, ${order.rcv_locality}, ${order.rcv_city}, ${order.rcv_district}, ${order.rcv_state} - ${order.rcv_pincode} <br>
                      Contact: ${order.rcv_contact_no}
                  </div>
              </div>
              <div class="order-footer">
                  <div class="order-total">Total: ${formatCurrency(order.total_price)}</div>
                  <div class="order-actions">
                      <button class="btn btn-secondary btn-sm order-details-btn">Order Details</button>
                  </div>
              </div>
            `;
            orderList.appendChild(orderCard);

            // Bind product clicks on order items
            orderCard.querySelectorAll(".order-item").forEach((el, index) => {
              const item = order.items[index];
              el.addEventListener("click", (e) => {
                if (e.target.closest("button")) return;
                handleProductClick(item);
              });
            });

            // Order Details button event
            orderCard.querySelector(".order-details-btn").addEventListener("click", () => {
              window.location.href = `order-details.html?order_number=${order.order_number}`;
            });
          });
        }

        // Show empty orders message if no orders at all
        if (pendingOrders.length === 0 && processedOrders.length === 0) {
          document.querySelector(".empty-orders").style.display = "block";
        }
      })
      .catch((err) => {
        console.error("Error fetching orders:", err);
        document.querySelector(".empty-orders").style.display = "block";
      });

    // Cancel order function with 2 hours limit check and confirmation popup
    function cancelOrder(orderNumber, createdAt) {
      const orderTime = new Date(createdAt);
      const now = new Date();
      const diffInMinutes = (now - orderTime) / (1000 * 60);

      if (diffInMinutes > 120) {
        window.showPopup("This order can no longer be cancelled (over 2 hours old).", [
          { text: "OK", type: "primary" },
        ]);
        return;
      }

      window.showPopup("Are you sure you want to cancel this order?", [
        {
          text: "Yes, Cancel",
          type: "danger",
          callback: () => {
            fetch(`https://engine.cocomatik.com/api/orders/cancel/`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `token ${token}`,
              },
              body: JSON.stringify({ order_number: orderNumber }),
            })
              .then((res) => res.json())
              .then(() => {
                window.showPopup("Order cancelled successfully!", [
                  {
                    text: "OK",
                    type: "primary",
                    callback: () => {
                      location.reload();
                    },
                  },
                ]);
              })
              .catch((err) => {
                console.error("Cancel failed:", err);
                window.showPopup("Failed to cancel order.", [{ text: "OK", type: "primary" }]);
              });
          },
        },
        { text: "No, Keep Order", type: "secondary" },
      ]);
    }
  } catch (error) {
    console.error("Critical error:", error);
    window.location.href = "/pages/account/login.html"; // fallback redirect
  }
});
