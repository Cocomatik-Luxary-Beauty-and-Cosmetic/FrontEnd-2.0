document.addEventListener("DOMContentLoaded", async function () {
    const productDetails = JSON.parse(localStorage.getItem("productDetailsId"));
    const producttype = localStorage.getItem("producttype");


    console.log(producttype);

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

        // Store the product ID in a variable
        const fetchedProductId = product.sku;
        console.log("Fetched Product ID:", fetchedProductId);

        // Update HTML with product details
        document.getElementById("productDetailName").innerText = product.title;
        document.getElementById("productDetailDescription").innerText = product.description;
        document.getElementById("productDetailSize").innerText = `Size: ${product.size}`;
        document.getElementById("productDetailMRP").innerText = `MRP ₹${parseFloat(product.mrp).toFixed(2)}`;
        document.getElementById("productDetailPrice").innerText = `₹${parseFloat(product.price).toFixed(2)}`;
        document.getElementById("productDetailDiscount").innerText = `Discount: ${product.discount}%`;
        document.getElementById("productDetailsImg").innerHTML = `<img src="https://res.cloudinary.com/cocomatik/${product.display_image}" alt="${product.title}" width="100"></img>`
        document.getElementById("productDetailStaock").innerText = `Stock: ${product.stock} available`;
        document.getElementById("productDetailBrand").innerText = `Brand: ${product.brand}`;
        document.getElementById("productDetailRating").innerText = `Rating: ⭐${product.rating}`;

    } catch (error) {
        console.error("Error fetching product data:", error);
    }




    let addtoCard = document.getElementById("addtoCard");
    const productDetailMsg = document.getElementById("productDetailMsg");


    addtoCard.addEventListener("click", function () {
        addtoCard.style.backgroundColor = "gray"
        setTimeout(() => {
            addtoCard.style.backgroundColor = ""
        }, 1500);

        const addcartId = productId;
        const quantity = 1;

        console.log(addcartId, quantity);

        const token = localStorage.getItem("authToken");

        // Create the products array dynamically
        const products = [
            { sku: addcartId, quantity: quantity } // Use the variables directly
        ];

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
                productDetailMsg.innerHTML = "Products added to cart successfully "

                setTimeout(function () {
                    productDetailMsg.innerHTML = ""
                    window.location.href = ("cart.html")
                }, 1400)
            })
            .catch(error => {
                console.error('Error:', error);
                productDetailMsg.innerHTML = "Failed to add products to the cart. Please try again."
                setTimeout(function () {
                    productDetailMsg.innerHTML = ""
                }, 1400)
            });
    });


    buyNow.addEventListener("click", function () {
        buyNow.style.backgroundColor = "#d4a5a5"
        setTimeout(() => {
            buyNow.style.backgroundColor = ""
        }, 1500);

        const addcartId = productId;
        const quantity = 1;


        const token = localStorage.getItem("authToken");

        // Create the products array dynamically
        const products = [
            { sku: addcartId, quantity: quantity } // Use the variables directly
        ];

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
                productDetailMsg.innerHTML = "Products added to cart successfully "

                setTimeout(function () {
                    productDetailMsg.innerHTML = ""
                    window.location.href = ("cart.html")
                }, 1400)
            })
            .catch(error => {
                console.error('Error:', error);
                productDetailMsg.innerHTML = "Failed to add products to the cart. Please try again."
                setTimeout(function () {
                    productDetailMsg.innerHTML = ""
                }, 1400)
            });
    });
});



