document.addEventListener("DOMContentLoaded", async function () {
    const productDetails = JSON.parse(localStorage.getItem("productDetailsId"));
    const producttype = localStorage.getItem("producttype");

    if (!productDetails || !productDetails.sku) {
        console.error("Product ID not found in localStorage");
        return;
    }

    const productId = productDetails.sku;
    let apiUrl = "";

    if (producttype === "POCO") {
        apiUrl = "https://engine.cocomatik.com/api/pocos/";
    } else {
        apiUrl = "https://engine.cocomatik.com/api/pojos/";
    }

    let currentImageIndex = 0;
    let imageList = [];

    try {
        const response = await fetch(`${apiUrl}details/${productId}`);
        if (!response.ok) {
            throw new Error("Failed to fetch product data");
        }

        const product = await response.json();

        // Assign all images (display + extra)
        imageList = [product.display_image];
        if (product.extra_images && product.extra_images.length > 0) {
            imageList = imageList.concat(product.extra_images.map(img => img.image));
        }

        const imgContainer = document.getElementById("productDetailsImg");
        const loadImage = () => {
            imgContainer.innerHTML = `
                <img src="https://res.cloudinary.com/cocomatik/${imageList[currentImageIndex]}" 
                     alt="${product.title}" width="100">
                <button class="slider-btn left" id="prevBtn"><i class='bx bx-chevron-left' ></i></button>
                <button class="slider-btn right" id="nextBtn"><i class='bx bx-chevron-right'></i></button>
            `;
            addSliderEvents(); // Re-bind buttons
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

        loadImage(); // Initial image setup

        // Textual product details
        document.getElementById("productDetailName").innerText = product.title;
        document.getElementById("productDetailDescription").innerText = product.description;
        document.getElementById("productDetailSize").innerText = `Size: ${product.size}`;
        document.getElementById("productDetailMRP").innerText = `MRP ₹${parseFloat(product.mrp).toFixed(2)}`;
        document.getElementById("productDetailPrice").innerText = `₹${parseFloat(product.price).toFixed(2)}`;
        document.getElementById("productDetailDiscount").innerText = `Discount: ${product.discount}%`;
        document.getElementById("productDetailStaock").innerText = `Stock: ${product.stock} available`;
        document.getElementById("productDetailBrand").innerText = `Brand: ${product.brand}`;
        document.getElementById("productDetailRating").innerText = `Rating: ⭐${product.rating}`;

        // Extra thumbnails (optional display)
        const extraImgContainer = document.getElementById("productExtraImages");
        if (extraImgContainer && product.extra_images && product.extra_images.length > 0) {
            extraImgContainer.innerHTML = product.extra_images.map(img =>
                `<img src="https://res.cloudinary.com/cocomatik/${img.image}" 
                      alt="Extra Image" width="100" style="margin-right: 5px;">`
            ).join("");
        }

        // Reviews
        const reviewsContainer = document.getElementById("productReviews");
        if (reviewsContainer && product.reviews && product.reviews.length > 0) {
            reviewsContainer.innerHTML = product.reviews.map(review => `
                <div class="review" style="margin-bottom: 10px;">
                    <strong>${review.user_name}</strong> 
                    ${review.verified_user ? '✅' : ''}<br>
                    <span>⭐${review.rating}</span><br>
                    <p>${review.comment}</p>
                    <hr>
                </div>
            `).join("");
        }

    } catch (error) {
        console.error("Error fetching product data:", error);
    }

    // Cart & More Button Events
    const addtoCard = document.getElementById("addtoCard");
    const more = document.getElementById("more");
    const productDetailMsg = document.getElementById("productDetailMsg");

    addtoCard.addEventListener("click", function () {
        addtoCard.style.backgroundColor = "gray";
        setTimeout(() => addtoCard.style.backgroundColor = "", 1500);

        const token = localStorage.getItem("authToken");
        const products = [{ sku: productId, quantity: 1 }];

        fetch('https://engine.cocomatik.com/api/orders/cart/add/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `token ${token}`
            },
            body: JSON.stringify({ products })
        })
            .then(response => {
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                return response.json();
            })
            .then(result => {
                productDetailMsg.innerHTML = "Products added to cart successfully";
                setTimeout(() => {
                    productDetailMsg.innerHTML = "";
                window.location.href = "/pages/cart/cart.html";
                }, 1400);
       
            })
            .catch(error => {
                console.error('Error:', error);
                productDetailMsg.innerHTML = "Failed to add products to the cart. Please try again.";
                setTimeout(() => productDetailMsg.innerHTML = "", 1400);
            });
    });

    more.addEventListener("click", function () {
        if (producttype === "POJO") {
            window.location.href = "/pages/jwellery/jwelleryhome.html";
        } else {
            window.location.href = "/pages/cosmetic/cosmetichome.html";
        }
    });
});
