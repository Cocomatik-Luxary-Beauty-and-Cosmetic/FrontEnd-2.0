document.addEventListener("DOMContentLoaded", async () => {
  // === SEARCH POPUP SETUP ===
  const searchPopupOverlay = document.createElement("div");
  searchPopupOverlay.className = "search-popup-overlay";

  const searchPopupContainer = document.createElement("div");
  searchPopupContainer.className = "search-popup-container";

  const searchPopupContent = document.createElement("div");
  searchPopupContent.className = "search-popup-content";

  const searchForm = document.createElement("form");
  searchForm.className = "search-form";
  searchForm.innerHTML = `
    <input type="text" id="searchInput" placeholder="Search for products..." autocomplete="off">
    <button type="submit"><i class="fas fa-search"></i></button>
  `;

  const searchResults = document.createElement("div");
  searchResults.className = "search-results";

  const searchPopupClose = document.createElement("button");
  searchPopupClose.className = "search-popup-close";
  searchPopupClose.innerHTML = `<i class="fas fa-times"></i>`;

  searchPopupContent.appendChild(searchPopupClose);
  searchPopupContent.appendChild(searchForm);
  searchPopupContent.appendChild(searchResults);
  searchPopupContainer.appendChild(searchPopupContent);
  searchPopupOverlay.appendChild(searchPopupContainer);
  document.body.appendChild(searchPopupOverlay);

  window.showSearchPopup = () => {
    searchPopupOverlay.classList.add("active");
    searchPopupContainer.classList.add("active");
    document.getElementById("searchInput").focus();
  };

  function hideSearchPopup() {
    searchPopupContainer.classList.remove("active");
    searchPopupOverlay.classList.remove("active");
  }

  searchPopupClose.addEventListener("click", hideSearchPopup);
  searchPopupOverlay.addEventListener("click", (e) => {
    if (e.target === searchPopupOverlay) hideSearchPopup();
  });

  searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const searchTerm = document.getElementById("searchInput").value.trim();
    if (searchTerm) {
      window.location.href = `/pages/search/search-results.html?q=${encodeURIComponent(searchTerm)}`;
    }
  });

  let searchTimeout;
  const searchInput = document.getElementById("searchInput");
  searchInput.addEventListener("input", () => {
    clearTimeout(searchTimeout);
    const searchTerm = searchInput.value.trim();
    if (searchTerm.length < 2) {
      searchResults.innerHTML = "";
      return;
    }
    searchTimeout = setTimeout(() => {
      fetchSearchResults(searchTerm);
    }, 300);
  });

  async function fetchSearchResults(searchTerm) {
    searchResults.innerHTML = `<div class="search-loading"><i class="fas fa-spinner fa-spin"></i> Searching...</div>`;
    try {
      const [pocoRes, pojoRes] = await Promise.all([
        fetch(`https://engine.cocomatik.com/api/pocos/search/?q=${encodeURIComponent(searchTerm)}`),
        fetch(`https://engine.cocomatik.com/api/pojos/search/?q=${encodeURIComponent(searchTerm)}`)
      ]);
      if (!pocoRes.ok || !pojoRes.ok) throw new Error("Search failed");

      const pocoData = await pocoRes.json();
      const pojoData = await pojoRes.json();
      const combined = [
        ...pocoData.map((p) => ({ ...p, type: "POCO" })),
        ...pojoData.map((p) => ({ ...p, type: "POJO" }))
      ];
      displaySearchResults(combined);
    } catch (err) {
      searchResults.innerHTML = `<div class="search-error">Error searching products. Please try again.</div>`;
    }
  }

  function displaySearchResults(results) {
    if (results.length === 0) {
      searchResults.innerHTML = `<div class="search-no-results">No products found.</div>`;
      return;
    }

    const resultsHTML = results
      .slice(0, 5)
      .map(
        (product) => `
        <a href="/pages/product/productdetails.html?type=${product.type}&id=${product.sku}" class="search-result-item">
          <div class="search-result-image">
            <img src="https://res.cloudinary.com/cocomatik/${product.display_image}" alt="${product.title}">
          </div>
          <div class="search-result-info">
            <div class="search-result-title">${product.title}</div>
            <div class="search-result-price">₹${Number.parseFloat(product.price).toFixed(2)}</div>
          </div>
        </a>`
      )
      .join("");

    searchResults.innerHTML = resultsHTML;

    if (results.length > 5) {
      searchResults.innerHTML += `
        <a href="/pages/search/search-results.html?q=${encodeURIComponent(document.getElementById("searchInput").value.trim())}" 
           class="search-view-all">View all ${results.length} results</a>`;
    }
  }

  // === PRODUCT DETAIL SECTION ===

  function isUserLoggedIn() {
    return !!localStorage.getItem("authToken");
  }

  function redirectToLogin() {
    localStorage.setItem("loginRedirect", window.location.href);
    window.location.href = "/pages/account/login.html";
    return false;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const productType = urlParams.get("type");
  const productId = urlParams.get("id");

  let productDetails = null;
  let producttype = productType;

  if (!productId || !productType) {
    productDetails = JSON.parse(localStorage.getItem("productDetailsId"));
    producttype = localStorage.getItem("producttype");
    if (productDetails?.sku && producttype) {
      window.history.replaceState({}, document.title, `/pages/product/productdetails.html?type=${producttype}&id=${productDetails.sku}`);
    } else {
      console.error("Product ID or type not found");
      return;
    }
  } else {
    productDetails = { sku: productId };
  }

  let apiUrl = producttype === "POCO"
    ? "https://engine.cocomatik.com/api/pocos/"
    : "https://engine.cocomatik.com/api/pojos/";

  let currentImageIndex = 0;
  let imageList = [];
  let isProductInCart = false;

  if (isUserLoggedIn()) {
    try {
      const cartResponse = await fetch("https://engine.cocomatik.com/api/orders/cart/", {
        method: "GET",
        headers: {
          Authorization: `token ${localStorage.getItem("authToken")}`,
          "Content-Type": "application/json"
        }
      });
      if (cartResponse.ok) {
        const cartData = await cartResponse.json();
        if (Array.isArray(cartData.items)) {
          isProductInCart = cartData.items.some((item) => item.product_details?.sku === productDetails.sku);
        }
      }
    } catch (error) {
      console.error("Error checking cart:", error);
    }
  }

  try {
    const response = await fetch(`${apiUrl}details/${productDetails.sku}`);
    if (!response.ok) throw new Error("Failed to fetch product");

    const product = await response.json();

    document.title = `${product.title} - COCOMATIK`;
    imageList = [product.display_image, ...(product.extra_images?.map((img) => img.image) || [])];

    const imgContainer = document.getElementById("productDetailsImg");
    const loadImage = () => {
      imgContainer.innerHTML = `
        <img src="https://res.cloudinary.com/cocomatik/${imageList[currentImageIndex]}" alt="${product.title}" width="100">
        <button class="slider-btn left" id="prevBtn"><i class='bx bx-chevron-left'></i></button>
        <button class="slider-btn right" id="nextBtn"><i class='bx bx-chevron-right'></i></button>`;
      addSliderEvents();
    };

    const addSliderEvents = () => {
      document.getElementById("prevBtn").addEventListener("click", () => {
        currentImageIndex = (currentImageIndex - 1 + imageList.length) % imageList.length;
        loadImage();
      });
      document.getElementById("nextBtn").addEventListener("click", () => {
        currentImageIndex = (currentImageIndex + 1) % imageList.length;
        loadImage();
      });
    };

    loadImage();

    document.getElementById("productDetailName").innerText = product.title;
    document.getElementById("productDetailDescription").innerText = product.description;
    document.getElementById("productDetailSize").innerText = `Size: ${product.size}`;
    document.getElementById("productDetailMRP").innerText = `MRP ₹${Number.parseFloat(product.mrp).toFixed(2)}`;
    document.getElementById("productDetailPrice").innerText = `₹${Number.parseFloat(product.price).toFixed(2)}`;
    document.getElementById("productDetailDiscount").innerText = `Discount: ${product.discount}%`;
    document.getElementById("productDetailStaock").innerText = `Stock: ${product.stock} available`;
    document.getElementById("productDetailBrand").innerText = `Brand: ${product.brand}`;
    document.getElementById("productDetailRating").innerText = `Rating: ⭐${product.rating}`;
    document.querySelector(".r4t1ng-numb3r").innerText = product.rating.toFixed(1);

    const fullStars = Math.floor(product.rating);
    const halfStar = product.rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    let stars = "★".repeat(fullStars);
    if (halfStar) stars += "½";
    stars += "☆".repeat(emptyStars);
    document.querySelector(".r4t1ng-5t4r5").innerText = stars;
    document.querySelector(".r4t1ng-c0unt").innerText = `Based on ${product.reviews.length} reviews`;

    const extraImgContainer = document.getElementById("productExtraImages");
    if (extraImgContainer && product.extra_images?.length > 0) {
      extraImgContainer.innerHTML = product.extra_images.map(
        (img) => `<img src="https://res.cloudinary.com/cocomatik/${img.image}" alt="Extra Image" width="100" style="margin-right: 5px;">`
      ).join("");
    }

    const reviewsContainer = document.getElementById("productReviews");
    if (reviewsContainer && product.reviews?.length > 0) {
      reviewsContainer.innerHTML = product.reviews.map((review) => `
        <div class="review" style="margin-bottom: 10px;">
            <strong>${review.user_name}</strong> ${review.verified_user ? "✅" : ""}<br>
            <span>⭐${review.rating}</span><br>
            <p>${review.comment}</p><hr>
        </div>`).join("");
    }

    const addtoCard = document.getElementById("addtoCard");
    const wishlistBtn = document.getElementById("wislistBtn");

    if (isUserLoggedIn() && isProductInCart) {
      addtoCard.textContent = "Go to Cart";
      addtoCard.style.backgroundColor = "#4caf50";
    } else {
      addtoCard.textContent = "Add To Cart";
      addtoCard.style.backgroundColor = "";
    }

    if (wishlistBtn) {
      wishlistBtn.addEventListener("click", () => {
        if (!isUserLoggedIn()) return redirectToLogin();
        console.log("Add to wishlist:", productDetails.sku);
        // Implement your wishlist logic
      });
    }

    addtoCard.addEventListener("click", () => {
      if (!isUserLoggedIn()) return redirectToLogin();
      if (isProductInCart) {
        window.location.href = "/pages/cart/cart.html";
      } else {
        // Add to cart logic here
        console.log("Add to cart:", productDetails.sku);
      }
    });

  } catch (error) {
    console.error("Error loading product:", error);
  }
  document.querySelector(".f0rm-c0nt41n3r").addEventListener("submit", async function (e) {
    e.preventDefault();

    // 1. Get selected rating
    const rating = document.querySelector('input[name="r4t1ng"]:checked')?.value;
    const comment = document.querySelector(".r3v13w-t3xt4r34").value;

    if (!rating || !comment) {
      alert("Please select a rating and write a review.");
      return;
    }

    const url = `https://engine.cocomatik.com/api/${producttype.toLowerCase}/reviews/${productDetails.sku}/`;
    token=localStorage.getItem("authToken")
    try {
      // 3. Send POST request
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `token ${token}`,
        },
        body: JSON.stringify({
          rating: parseFloat(rating),
          comment: comment,
        }),
      });

      // 4. Handle response
      if (response.ok) {
        // Hide form, show thank you message
        document.querySelector(".f0rm-c0nt41n3r").style.display = "none";
        document.getElementById("th4nk-y0u").style.display = "block";
      } else {
        const data = await response.json();
        alert(`Error: ${data.message || "Could not submit review."}`);
      }
    } catch (err) {
      console.error("Error submitting review:", err);
      alert("Network error. Please try again later.");
    }
  });
});
