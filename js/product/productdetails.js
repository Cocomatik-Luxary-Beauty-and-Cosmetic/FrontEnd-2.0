document.addEventListener("DOMContentLoaded", async () => {
  // Create search popup elements
  const searchPopupOverlay = document.createElement("div")
  searchPopupOverlay.className = "search-popup-overlay"

  const searchPopupContainer = document.createElement("div")
  searchPopupContainer.className = "search-popup-container"

  const searchPopupContent = document.createElement("div")
  searchPopupContent.className = "search-popup-content"

  const searchForm = document.createElement("form")
  searchForm.className = "search-form"
  searchForm.innerHTML = `
    <input type="text" id="searchInput" placeholder="Search for products..." autocomplete="off">
    <button type="submit"><i class="fas fa-search"></i></button>
  `

  const searchResults = document.createElement("div")
  searchResults.className = "search-results"

  const searchPopupClose = document.createElement("button")
  searchPopupClose.className = "search-popup-close"
  searchPopupClose.innerHTML = `<i class="fas fa-times"></i>`

  searchPopupContent.appendChild(searchPopupClose)
  searchPopupContent.appendChild(searchForm)
  searchPopupContent.appendChild(searchResults)
  searchPopupContainer.appendChild(searchPopupContent)
  searchPopupOverlay.appendChild(searchPopupContainer)
  document.body.appendChild(searchPopupOverlay)

  // Function to show search popup
  window.showSearchPopup = () => {
    searchPopupOverlay.classList.add("active")
    searchPopupContainer.classList.add("active")
    document.getElementById("searchInput").focus()
  }

  // Function to hide search popup
  function hideSearchPopup() {
    searchPopupContainer.classList.remove("active")
    searchPopupOverlay.classList.remove("active")
  }

  // Close popup when clicking close button or outside
  searchPopupClose.addEventListener("click", hideSearchPopup)
  searchPopupOverlay.addEventListener("click", (e) => {
    if (e.target === searchPopupOverlay) {
      hideSearchPopup()
    }
  })

  // Handle search form submission
  searchForm.addEventListener("submit", (e) => {
    e.preventDefault()
    const searchTerm = document.getElementById("searchInput").value.trim()
    if (searchTerm) {
      window.location.href = `/pages/search/search-results.html?q=${encodeURIComponent(searchTerm)}`
    }
  })

  // Handle search input for live results
  let searchTimeout
  const searchInput = document.getElementById("searchInput")
  searchInput.addEventListener("input", () => {
    clearTimeout(searchTimeout)
    const searchTerm = searchInput.value.trim()

    if (searchTerm.length < 2) {
      searchResults.innerHTML = ""
      return
    }

    searchTimeout = setTimeout(() => {
      fetchSearchResults(searchTerm)
    }, 300)
  })

  // Fetch search results
  async function fetchSearchResults(searchTerm) {
    searchResults.innerHTML = '<div class="search-loading"><i class="fas fa-spinner fa-spin"></i> Searching...</div>'

    try {
      // Fetch from both APIs
      const [pocoResponse, pojoResponse] = await Promise.all([
        fetch(`https://engine.cocomatik.com/api/pocos/search/?q=${encodeURIComponent(searchTerm)}`),
        fetch(`https://engine.cocomatik.com/api/pojos/search/?q=${encodeURIComponent(searchTerm)}`),
      ])

      if (!pocoResponse.ok || !pojoResponse.ok) {
        throw new Error("Search failed")
      }

      const pocoData = await pocoResponse.json()
      const pojoData = await pojoResponse.json()

      // Combine results
      const combinedResults = [
        ...pocoData.map((item) => ({ ...item, type: "POCO" })),
        ...pojoData.map((item) => ({ ...item, type: "POJO" })),
      ]

      displaySearchResults(combinedResults)
    } catch (error) {
      console.error("Search error:", error)
      searchResults.innerHTML = '<div class="search-error">Error searching products. Please try again.</div>'
    }
  }

  // Display search results
  function displaySearchResults(results) {
    if (results.length === 0) {
      searchResults.innerHTML = '<div class="search-no-results">No products found. Try a different search term.</div>'
      return
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
      </a>
    `,
      )
      .join("")

    searchResults.innerHTML = resultsHTML

    if (results.length > 5) {
      searchResults.innerHTML += `
        <a href="/pages/search/search-results.html?q=${encodeURIComponent(document.getElementById("searchInput").value.trim())}" 
           class="search-view-all">
          View all ${results.length} results
        </a>
      `
    }
  }

  // Helper function to check if user is logged in
  function isUserLoggedIn() {
    const token = localStorage.getItem("authToken")
    return !!token // Convert to boolean
  }

  // Helper function to redirect to login page
  function redirectToLogin() {
    // Save current URL to redirect back after login
    const currentUrl = window.location.href
    localStorage.setItem("loginRedirect", currentUrl)
    window.location.href = "/pages/account/login.html"
    return false
  }

  // Get product details from URL parameters instead of localStorage
  const urlParams = new URLSearchParams(window.location.search)
  const productType = urlParams.get("type")
  const productId = urlParams.get("id")

  // If URL parameters are missing, try to get from localStorage (for backward compatibility)
  let productDetails = null
  let producttype = productType

  if (!productId || !productType) {
    productDetails = JSON.parse(localStorage.getItem("productDetailsId"))
    producttype = localStorage.getItem("producttype")

    if (productDetails && productDetails.sku && producttype) {
      // Redirect to the proper URL format
      window.history.replaceState(
        {},
        document.title,
        `/pages/product/productdetails.html?type=${producttype}&id=${productDetails.sku}`,
      )
    } else {
      console.error("Product ID or type not found")
      return
    }
  } else {
    productDetails = { sku: productId }
  }

  let apiUrl = ""

  if (producttype === "POCO") {
    apiUrl = "https://engine.cocomatik.com/api/pocos/"
  } else {
    apiUrl = "https://engine.cocomatik.com/api/pojos/"
  }

  let currentImageIndex = 0
  let imageList = []
  let isProductInCart = false

  // Check if product is in cart (only if user is logged in)
  if (isUserLoggedIn()) {
    try {
      const cartResponse = await fetch("https://engine.cocomatik.com/api/orders/cart/", {
        method: "GET",
        headers: {
          Authorization: `token ${localStorage.getItem("authToken")}`,
          "Content-Type": "application/json",
        },
      })

      if (cartResponse.ok) {
        const cartData = await cartResponse.json()

        // Check if the current product is in the cart
        if (cartData && cartData.items && Array.isArray(cartData.items)) {
          isProductInCart = cartData.items.some(
            (item) => item.product_details && item.product_details.sku === productDetails.sku,
          )
        }
      }
    } catch (error) {
      console.error("Error checking cart:", error)
    }
  }

  try {
    const response = await fetch(`${apiUrl}details/${productDetails.sku}`)
    if (!response.ok) {
      throw new Error("Failed to fetch product data")
    }

    const product = await response.json()

    // Update page title with product name
    document.title = `${product.title} - COCOMATIK`

    // Assign all images (display + extra)
    imageList = [product.display_image]
    if (product.extra_images && product.extra_images.length > 0) {
      imageList = imageList.concat(product.extra_images.map((img) => img.image))
    }

    const imgContainer = document.getElementById("productDetailsImg")
    const loadImage = () => {
      imgContainer.innerHTML = `
        <img src="https://res.cloudinary.com/cocomatik/${imageList[currentImageIndex]}" 
             alt="${product.title}" width="100">
        <button class="slider-btn left" id="prevBtn"><i class='bx bx-chevron-left' ></i></button>
        <button class="slider-btn right" id="nextBtn"><i class='bx bx-chevron-right'></i></button>
      `
      addSliderEvents() // Re-bind buttons
    }

    const addSliderEvents = () => {
      document.getElementById("prevBtn").addEventListener("click", () => {
        currentImageIndex = (currentImageIndex - 1 + imageList.length) % imageList.length
        loadImage()
      })
      document.getElementById("nextBtn").addEventListener("click", () => {
        currentImageIndex = (currentImageIndex + 1) % imageList.length
        loadImage()
      })
    }

    loadImage() // Initial image setup

    // Textual product details
    document.getElementById("productDetailName").innerText = product.title
    document.getElementById("productDetailDescription").innerText = product.description
    document.getElementById("productDetailSize").innerText = `Size: ${product.size}`
    document.getElementById("productDetailMRP").innerText = `MRP ₹${Number.parseFloat(product.mrp).toFixed(2)}`
    document.getElementById("productDetailPrice").innerText = `₹${Number.parseFloat(product.price).toFixed(2)}`
    document.getElementById("productDetailDiscount").innerText = `Discount: ${product.discount}%`
    document.getElementById("productDetailStaock").innerText = `Stock: ${product.stock} available`
    document.getElementById("productDetailBrand").innerText = `Brand: ${product.brand}`
    document.getElementById("productDetailRating").innerText = `Rating: ⭐${product.rating}`

    // Extra thumbnails (optional display)
    const extraImgContainer = document.getElementById("productExtraImages")
    if (extraImgContainer && product.extra_images && product.extra_images.length > 0) {
      extraImgContainer.innerHTML = product.extra_images
        .map(
          (img) =>
            `<img src="https://res.cloudinary.com/cocomatik/${img.image}" 
                  alt="Extra Image" width="100" style="margin-right: 5px;">`,
        )
        .join("")
    }

    // Reviews
    const reviewsContainer = document.getElementById("productReviews")
    if (reviewsContainer && product.reviews && product.reviews.length > 0) {
      reviewsContainer.innerHTML = product.reviews
        .map(
          (review) => `
            <div class="review" style="margin-bottom: 10px;">
                <strong>${review.user_name}</strong> 
                ${review.verified_user ? "✅" : ""}<br>
                <span>⭐${review.rating}</span><br>
                <p>${review.comment}</p>
                <hr>
            </div>
        `,
        )
        .join("")
    }

    // Cart & More Button Events
    const addtoCard = document.getElementById("addtoCard")
    const more = document.getElementById("more")
    const productDetailMsg = document.getElementById("productDetailMsg")
    const wishlistBtn = document.getElementById("wislistBtn")

    // Update button text based on cart status if user is logged in
    if (isUserLoggedIn() && isProductInCart) {
      addtoCard.textContent = "Go to Cart"
      addtoCard.style.backgroundColor = "#4caf50" // Green color for "Go to Cart"
    } else {
      addtoCard.textContent = "Add To Cart"
      addtoCard.style.backgroundColor = "" // Default color for "Add To Cart"
    }

    // Handle wishlist button click
    if (wishlistBtn) {
      wishlistBtn.addEventListener("click", () => {
        if (!isUserLoggedIn()) {
          redirectToLogin()
          return
        }

        // Your existing wishlist functionality
        // This will only execute if the user is logged in
        console.log("Adding to wishlist:", productDetails.sku)
        // Add your wishlist code here
      })
    }

    addtoCard.addEventListener("click", () => {
      // Check if user is logged in
      if (!isUserLoggedIn()) {
        redirectToLogin()
        return
      }

      // If product is already in cart, go to cart page
      if (isProductInCart) {
        window.location.href = "/pages/cart/cart.html"
        return
      }

      // Otherwise add to cart
      addtoCard.style.backgroundColor = "gray"
      setTimeout(() => (addtoCard.style.backgroundColor = ""), 1500)

      const token = localStorage.getItem("authToken")
      const products = [{ sku: productDetails.sku, quantity: 1 }]

      fetch("https://engine.cocomatik.com/api/orders/cart/add/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `token ${token}`,
        },
        body: JSON.stringify({ products }),
      })
        .then((response) => {
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
          return response.json()
        })
        .then((result) => {
          productDetailMsg.innerHTML = "Products added to cart successfully"
          setTimeout(() => {
            productDetailMsg.innerHTML = ""
            window.location.href = "/pages/cart/cart.html"
          }, 1400)
        })
        .catch((error) => {
          console.error("Error:", error)
          productDetailMsg.innerHTML = "Failed to add products to the cart. Please try again."
          setTimeout(() => (productDetailMsg.innerHTML = ""), 1400)
        })
    })

    more.addEventListener("click", () => {
      if (producttype === "POJO") {
        window.location.href = "/pages/jwellery/jwelleryhome.html"
      } else {
        window.location.href = "/pages/cosmetic/cosmetichome.html"
      }
    })

    // Add share functionality
    const shareBtn = document.querySelector(".bx-share-alt")
    if (shareBtn) {
      shareBtn.addEventListener("click", () => {
        const shareUrl = window.location.href

        if (navigator.share) {
          navigator
            .share({
              title: document.title,
              url: shareUrl,
            })
            .catch((err) => console.error("Share failed:", err))
        } else {
          // Fallback for browsers that don't support Web Share API
          navigator.clipboard
            .writeText(shareUrl)
            .then(() => {
              const shareMsg = document.createElement("div")
              shareMsg.className = "share-message"
              shareMsg.textContent = "Link copied to clipboard!"
              document.body.appendChild(shareMsg)

              setTimeout(() => {
                shareMsg.classList.add("show")
                setTimeout(() => {
                  shareMsg.classList.remove("show")
                  setTimeout(() => document.body.removeChild(shareMsg), 300)
                }, 2000)
              }, 10)
            })
            .catch((err) => console.error("Copy failed:", err))
        }
      })
    }
  } catch (error) {
    console.error("Error fetching product data:", error)
  }
})
