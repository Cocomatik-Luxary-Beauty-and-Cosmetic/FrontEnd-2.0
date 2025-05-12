
  const token = localStorage.getItem("authToken");
  console.log("Auth Token:", token);

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
      renderWishlistCards(data);
    })
    .catch(error => {
      console.error("Error loading wishlist:", error);
    });
  }

  function renderWishlistCards(items) {
    const wishlistCartBox = document.getElementById("wishlistCartBox");
    wishlistCartBox.innerHTML = ''; // Clear previous cards

    items.forEach((item) => {
      const details = item.product_details;
      const imageUrl = `https://res.cloudinary.com/cocomatik/${details.display_image}`;

      const card = document.createElement("div");
      card.innerHTML = `
        <div id="wishlistCard">
          <img src="${imageUrl}" alt="Product Image" class="product-image" />
          <h4 class="product-name">${details.name || 'Product Name'}</h4>
          <p class="product-price">₹${details.price || '0'}</p>
          <button class="add-to-cart-btn">Add to Cart</button>
        </div>
      `;
      wishlistCartBox.appendChild(card);
    });
  }

