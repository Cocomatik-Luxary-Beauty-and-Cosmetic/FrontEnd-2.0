document.addEventListener("DOMContentLoaded", async function () {
    const productsContainer = document.getElementById("products-container");

    try {
        // Fetch both Poco and Pojo APIs in parallel
        const [pocoResponse, pojoResponse] = await Promise.all([
            fetch("https://engine.cocomatik.com/api/pocos/"),
            fetch("https://engine.cocomatik.com/api/pojos/")
        ]);

        if (!pocoResponse.ok || !pojoResponse.ok) throw new Error("Failed to fetch data");

        const pocoData = await pocoResponse.json();
        const pojoData = await pojoResponse.json();

        // Combine both arrays into one
        const data = [...pocoData, ...pojoData];

        // Get search term and convert to lowercase for case-insensitive search
        const searchTerm = localStorage.getItem("searchTerm")?.toLowerCase() || "";

        document.getElementById("categoryName").innerHTML = `Search results for: "${searchTerm}"`;

        productsContainer.innerHTML = "";

        // Filter combined data based on title or category
        const filteredProducts = data.filter(product =>
            product.title.toLowerCase().includes(searchTerm) ||
            product.category.toLowerCase().includes(searchTerm)
        );

        if (filteredProducts.length === 0) {
            productsContainer.innerHTML = "<p>No products found.</p>";
            return;
        }

        // Render filtered products
        filteredProducts.forEach(product => {
            const productCard = document.createElement("div");
            productCard.id = "products-card";
            productCard.dataset.sku = product.sku;

            productCard.innerHTML = `
                <div id="products-img">
                    <img src="https://res.cloudinary.com/cocomatik/${product.display_image}" alt="${product.title}" width="100">
                </div>
                <div id="products-dtls">
                    <h3 id="product-title">${product.title}</h3>
                    <p id="product-category">${product.category}</p>
                    <p id="product-price"> ₹${product.price}</p>
                    <button id="add-to-cart">View Product</button>
                </div>
            `;

            productCard.addEventListener("click", () => {
                localStorage.setItem("productDetailsId", JSON.stringify({ sku: product.sku }));
                window.location.href = "/pages/product/productdetails.html";
            });

            productsContainer.appendChild(productCard);
        });

    } catch (error) {
        console.error("Error fetching data:", error);
        productsContainer.innerHTML = "<p>Error loading products.</p>";
    }
});
