try {
  const token = localStorage.getItem('authToken');
  if (!token) {
    window.location.href = '/pages/account/login.html';
  }

  // Load wishlist on page load
  loadWishlist();

  function loadWishlist() {
    fetch('https://engine.cocomatik.com/api/wishlist/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `token ${token}`
      }
    })
    .then(response => {
      if (!response.ok) {
        throw new Error("Failed to fetch wishlist");
      }
      return response.json();
    })
    .then(data => {
      console.log("Wishlist Data:", data);

      // ✅ Store only SKU values in localStorage
      const skuList = data.map(item => item.product_details.sku);
      localStorage.setItem("wishlistSku", JSON.stringify(skuList));

      // Check if wishlist is empty and update the emptyWishlist element style
      const emptyWishlist = document.getElementById('emptyWishlist');
      if (data.length === 0) {
        emptyWishlist.style.display = 'flex';
      } else {
        emptyWishlist.style.display = 'none';
      }

      renderWishlistCards(data);
    })
    .catch(error => {
      console.error("Error loading wishlist:", error);
    });
  }

  function renderWishlistCards(items) {
    const wishlistCartBox = document.getElementById("wishlistCartBox");
    wishlistCartBox.innerHTML = ''; // Clear previous cards

    items.forEach((item, index) => {
      const details = item.product_details;
      const imageUrl = `https://res.cloudinary.com/cocomatik/${details.display_image}`;
      const productName = details.name || 'Product Name';
      const productPrice = details.price || '0';
      const sku = details.sku;
      const stock = details.stock;

      const stockStatus = stock > 1 ? "In Stock" : "Out of Stock";
      const stockClass = stockStatus === "Out of Stock" ? "out-of-stock" : "in-stock";

      const card = document.createElement("div");
      card.className = "wishlist-item";
      card.id = `wishlistCard-${index}`;
      card.innerHTML = `
        <button class="remove-btn" id="removeWishlist-${index}">×</button>
        <div class="product-info">
          <img src="${imageUrl}" alt="${productName}" class="product-image">
          <div class="product-name">${productName}</div>
        </div>
        <div class="price-info">
          <span class="current-price">₹${productPrice}</span>
        </div>
        <div class="stock-status ${stockClass}">${stockStatus}</div>
        <div>
          <button class="add-cart-btn" id="addToCart-${index}">View Product</button>
        </div>
      `;
      wishlistCartBox.appendChild(card);

      // Remove button event
      const removeBtn = document.getElementById(`removeWishlist-${index}`);
      removeBtn.addEventListener("click", () => {
        removeWishlistItem(sku);
      });

      // ADD TO CART button event
      const addToCartBtn = document.getElementById(`addToCart-${index}`);
      addToCartBtn.addEventListener("click", () => {
        localStorage.setItem("productDetailsId", JSON.stringify({ sku: sku }));
        localStorage.setItem("producttype", sku.split("-")[0]);
        window.location.href = "/pages/product/productdetails.html";
      });
    });
  }

  function removeWishlistItem(sku) {
    fetch('https://engine.cocomatik.com/api/wishlist/', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `token ${token}`
      },
      body: JSON.stringify({ sku: sku })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error("Failed to remove item");
      }
      console.log(`Item with SKU ${sku} removed from wishlist.`);
      loadWishlist(); // Reload wishlist and update localStorage
    })
    .catch(error => {
      console.error("Error removing wishlist item:", error);
    });
  }

} catch (error) {
  console.error('Critical error:', error);
  window.location.href = 'login.html';
}
