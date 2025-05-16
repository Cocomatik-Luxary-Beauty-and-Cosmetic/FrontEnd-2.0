const producttype = localStorage.getItem("producttype");
let API_URL= ""
if (producttype==="POCO"){
    API_URL = "https://engine.cocomatik.com/api/pocos/";
}
else {
    API_URL = "https://engine.cocomatik.com/api/pojos/";
}
document.addEventListener("DOMContentLoaded", async function () {
    
    const productsContainer = document.getElementById("products-container");
    
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("Failed to fetch data");
        
        const data = await response.json();

        // Extract category from localStorage
        const selectedCategory = localStorage.getItem("category");
        console.log("Selected Category:", selectedCategory);

        let categoryName = document.getElementById("categoryName");
        categoryName.innerHTML = selectedCategory + " Items";  
        

        // Clear existing content inside productsContainer
        productsContainer.innerHTML = "";

        // Filter products by selected category
        const filteredProducts = data.filter(product => product.category === selectedCategory);

        // Render only products belonging to the selected category
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
    // Add click event to store SKU in local storage
    productCard.addEventListener("click", () => {
        localStorage.setItem("productDetailsId", JSON.stringify({ sku: product.sku }));
        console.log("Product ID stored:", product.sku);
        window.location.href=("/pages/product/productdetails.html")
    });
            productsContainer.appendChild(productCard);

        });
    } catch (error) {
        console.error("Error fetching data:", error);
    }
});
