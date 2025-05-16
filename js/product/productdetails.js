document.addEventListener("DOMContentLoaded", async function () {
    const productDetails = JSON.parse(localStorage.getItem("productDetailsId"));
    const producttype = localStorage.getItem("producttype");
    const token = localStorage.getItem("authToken");

    console.log(producttype);

    if (!productDetails || !productDetails.sku) {
        console.error("Product ID not found in localStorage");
        return;
    }

    const productId = productDetails.sku;
    let apiUrl = producttype === "POCO"
        ? "https://engine.cocomatik.com/api/pocos/"
        : "https://engine.cocomatik.com/api/pojos/";

    let productInCart = false;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error("Failed to fetch product data");
        }

        const products = await response.json();
        const product = products.find(item => item.sku === productId);

        if (!product) {
            console.error("Product not found");
            return;
        }

        // Update HTML with product details
        document.getElementById("productDetailName").innerText = product.title;
        document.getElementById("productDetailDescription").innerText = product.description;
        document.getElementById("productDetailSize").innerText = `Size: ${product.size}`;
        document.getElementById("productDetailMRP").innerText = `MRP ₹${parseFloat(product.mrp).toFixed(2)}`;
        document.getElementById("productDetailPrice").innerText = `₹${parseFloat(product.price).toFixed(2)}`;
        document.getElementById("productDetailDiscount").innerText = `Discount: ${product.discount}%`;
        document.getElementById("productDetailsImg").innerHTML = `<img src="https://res.cloudinary.com/cocomatik/${product.display_image}" alt="${product.title}" width="100">`;
        document.getElementById("productDetailStaock").innerText = `Stock: ${product.stock} available`;
        document.getElementById("productDetailBrand").innerText = `Brand: ${product.brand}`;
        document.getElementById("productDetailRating").innerText = `Rating: ⭐${product.rating}`;

        // Check if product already in cart
        if (token) {
            const cartResponse = await fetch('https://engine.cocomatik.com/api/orders/cart/', {
                method: 'GET',
                headers: {
                    'Authorization': `token ${token}`
                }
            });

            if (cartResponse.ok) {
                const cartData = await cartResponse.json();
                const existingItem = cartData.items.find(item => item.sku === productId);
                if (existingItem) {
                    productInCart = true;
                    document.getElementById("addtoCard").innerText = "Product Added to Cart";
                }
            }
        }

    } catch (error) {
        console.error("Error fetching product data:", error);
    }

    const addtoCard = document.getElementById("addtoCard");
    const productDetailMsg = document.getElementById("productDetailMsg");

    addtoCard.addEventListener("click", async function () {
        addtoCard.style.backgroundColor = "gray";
        setTimeout(() => {
            addtoCard.style.backgroundColor = "";
        }, 1500);

        if (productInCart) {
            window.location.href = "/pages/cart/cart.html";
            return;
        }

        const quantity = 1;
        const products = [{ sku: productId, quantity }];

        fetch('https://engine.cocomatik.com/api/orders/cart/add/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `token ${token}`
            },
            body: JSON.stringify({ products })
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(result => {
                console.log('Success:', result);
                productDetailMsg.innerHTML = "Product added to cart successfully";
                setTimeout(() => {
                    productDetailMsg.innerHTML = "";
                    window.location.href = "/pages/cart/cart.html";
                }, 1400);
            })
            .catch(error => {
                console.error('Error:', error);
                productDetailMsg.innerHTML = "Failed to add product to cart. Please try again.";
                setTimeout(() => {
                    productDetailMsg.innerHTML = "";
                }, 1400);
            });
    });

    const buyNow = document.getElementById("buyNow");

    buyNow.addEventListener("click", function () {
        buyNow.style.backgroundColor = "#d4a5a5";
        setTimeout(() => {
            buyNow.style.backgroundColor = "";
        }, 1500);

        if (producttype === "POCO") {
            window.location.href = "/pages/cosmetic/cosmetichome.html";
        } else if (producttype === "POJO") {
            window.location.href = "/pages/jwellery/jwelleryhome.html";
        }
    });
});
