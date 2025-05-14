try{
    const token = localStorage.getItem('authToken');
    if(!token){
        window.location.href = '/pages/account/login.html';
    }

document.addEventListener('DOMContentLoaded', function () {
    fetch('https://engine.cocomatik.com/api/orders/', {
        method: 'GET',
        headers: {
            'Authorization': `token ${token}`,
            'Content-Type': 'application/json'
        }
    })  // Replace with your actual API endpoint
        .then(res => res.json())
        .then(data => {
            const orderList = document.querySelector('.order-list');
            const pendingOrders = data.pending;
            const processedOrders = data.processed;

            // Helper to format currency
            const formatCurrency = value => `₹${parseFloat(value).toFixed(2)}`;

            // Helper to render items
            function renderItems(items) {
                return items.map(item => `
                    <div class="order-item">
                        <div class="item-image">
                            <img src="https://res.cloudinary.com/cocomatik/${item.product_details.display_image}" alt="${item.product_details.name}" />
                        </div>
                        <div class="item-details">
                            <h4 class="item-name">${item.product_details.name}</h4>
                            <p class="item-price">${formatCurrency(item.product_details.price)}</p>
                            <p class="item-quantity">Quantity: ${item.quantity}</p>
                        </div>
                    </div>
                `).join('');
            }

            // Render Pending Orders
            if (pendingOrders.length > 0) {
                const pendingTitle = document.createElement('p');
                pendingTitle.className = 'page-subtitle';
                pendingTitle.textContent = 'Pending Orders';
                orderList.appendChild(pendingTitle);

                pendingOrders.forEach(order => {
                    const orderCard = document.createElement('div');
                    orderCard.className = 'order-card';
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
                        </div>
                        <div class="order-footer">
                            <div class="order-total">Total: ${formatCurrency(order.total_price)}</div>
                            <div class="order-actions">
                                <button class="btn btn-sm" onclick="cancelOrder(${order.order_number}, '${order.created_at}')">Cancel</button>
                            </div>
                        </div>
                    `;
                    orderList.appendChild(orderCard);
                });
            }

            // Render Processed Orders
            if (processedOrders.length > 0) {
                const processedTitle = document.createElement('p');
                processedTitle.className = 'page-subtitle';
                processedTitle.textContent = 'Orders Approved';
                orderList.appendChild(processedTitle);

                processedOrders.forEach(order => {
                    const orderCard = document.createElement('div');
                    orderCard.className = 'order-card';
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
                                <button class="btn btn-secondary btn-sm order-details-btn" id="orders_detail">Order Details</button>
                            </div>
                        </div>
                    `;
                    orderList.appendChild(orderCard);
                    orderCard.querySelector(".order-details-btn").addEventListener("click", function (e) {
                        window.location.href = `order-details.html?order_number=${order.order_number}`;
                    });
                });
            }

            // If no orders
            if (pendingOrders.length === 0 && processedOrders.length === 0) {
                document.querySelector('.empty-orders').style.display = 'block';
            }
        })
        .catch(err => {
            console.error('Error fetching orders:', err);
            document.querySelector('.empty-orders').style.display = 'block';
        });
});

function cancelOrder(orderNumber, createdAt) {
    const orderTime = new Date(createdAt);
    const now = new Date();
    const diffInMinutes = (now - orderTime) / (1000 * 60);

    if (diffInMinutes > 120) {  // Changed from 1 minute to 2 hours for valid cancellations
        alert("This order can no longer be cancelled (over 2 hours old).");
        return;
    }

    if (confirm('Are you sure you want to cancel this order?')) {
        fetch(`https://engine.cocomatik.com/api/orders/cancel/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `token ${token}`
            },
            body: JSON.stringify({ order_number: orderNumber })  // Pass order_number
        })
        .then(res => res.json())
        .then(data => {
                location.reload();
        })
        .catch(err => {
            console.error('Cancel failed:', err);
            alert('Failed to cancel order.');
        });
    }
}
} catch (error) {
    console.error('Critical error:', error);
    window.location.href = 'login.html'; // Fallback redirect in case of major errors
}

