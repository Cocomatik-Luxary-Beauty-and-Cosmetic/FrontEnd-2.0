
document.addEventListener("DOMContentLoaded", async () => {
    const apiUrl = "https://engine.cocomatik.com/api/pocos/";

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        // Categories and their respective container IDs
        const categories = [
            { name: "Skincare", containerId: "products-container" },
            { name: "Fragrances", containerId: "products-container2" },
            { name: "Color Cosmetics", containerId: "products-container3" },
            { name: "Haircare", containerId: "products-container4" },
            { name: "Bodycare", containerId: "products-container5" },
            { name: "Imported Products", containerId: "products-container6" }
        ];

        categories.forEach(({ name, containerId }) => {
            const filteredProducts = data.filter(product => product.category === name).slice(0, 4);
            const container = document.getElementById(containerId);

            if (container) {
                filteredProducts.forEach(product => {
                    const productCard = document.createElement("div");
                    productCard.id = "products-card";
                    productCard.dataset.sku = product.sku; // Store SKU in dataset
                    productCard.innerHTML = `
                        <div id="products-img">
                            <img src="https://res.cloudinary.com/cocomatik/${product.display_image}" alt="${product.title}" width="100">
                        </div>
                        <div id="products-dtls">
                            <h3 id="product-title">${product.title}</h3>
                            <p id="product-category">${product.category}</p>
                            <p id="product-price">₹${product.price}</p>
                            <button id="add-to-cart">View Product</button>
                        </div>
                    `;

                    // Add click event to store SKU in local storage
                    productCard.addEventListener("click", () => {
                        localStorage.setItem("productDetailsId", JSON.stringify({ sku: product.sku }));
                        console.log("Product ID stored:", product.sku);
                        window.location.href=("/pages/product/productdetails.html")
                    });

                    container.appendChild(productCard);
                });
            }
        });
    } catch (error) {
        console.error("Error fetching products:", error);
    }
});
