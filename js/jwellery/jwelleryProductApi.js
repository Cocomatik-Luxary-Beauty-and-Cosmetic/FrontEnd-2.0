document.addEventListener("DOMContentLoaded", async () => {
    // ----- PRODUCT CARDS -----
    const productsApi = "https://engine.cocomatik.com/api/pojos/";
    try {
        const response = await fetch(productsApi);
        const data = await response.json();

        const categories = [
            { name: "Wedding Jewellery", containerId: "products-container" },
            { name: "Pendants", containerId: "products-container2" },
            { name: "One Gram Golden Jewellery", containerId: "products-container3" },
            { name: "Nose Rings", containerId: "products-container4" },
            { name: "Necklace", containerId: "products-container5" },
            { name: "Imported Jewellery", containerId: "products-container6" },
            { name: "Finger Rings", containerId: "products-container7" },
            { name: "Ear Rings", containerId: "products-container8" },
            { name: "Chains", containerId: "products-container9" },
            { name: "Bracelets", containerId: "products-container10" },
            { name: "Bangles", containerId: "products-container11" }
        ];

        categories.forEach(({ name, containerId }) => {
            const filteredProducts = data.filter(product => product.category === name).slice(0, 4);
            const container = document.getElementById(containerId);

            if (container && filteredProducts.length > 0) {
                filteredProducts.forEach(product => {
                    const productCard = document.createElement("div");
                    productCard.id = "products-card";
                    productCard.dataset.sku = product.sku;

                    productCard.innerHTML = `
                        <div id="products-img">
                            <img src="https://res.cloudinary.com/cocomatik/${product.display_image}" alt="${product.title}" width="100">
                        </div>
                        <div id="products-dtls">
                            <h3 id="product-title">${product.title.slice(0, 50)}..</h3>
                            <p id="product-category">${product.category}</p>
                            <p id="product-price">₹${product.price}</p>
                            <button id="add-to-cart">View Product</button>
                        </div>
                    `;

                    productCard.addEventListener("click", () => {
                        localStorage.setItem("productDetailsId", JSON.stringify({ sku: product.sku }));
                        window.location.href = "/pages/product/productdetails.html";
                    });

                    container.appendChild(productCard);
                });
            }
        });
    } catch (error) {
        console.error("Error fetching products:", error);
    }

    // ----- AD SLIDER -----
    const slider = document.querySelector(".slider");
    const adsApi = "https://engine.cocomatik.com/api/pojos/adds/";
    const cloudinaryBase = "https://res.cloudinary.com/cocomatik/";

    if (!slider) {
        console.warn("Ad slider container not found.");
        return;
    }

    try {
        const response = await fetch(adsApi);
        const ads = await response.json();

        if (ads.length === 0) {
            slider.innerHTML = "<p>No ads available</p>";
            return;
        }
        console.log(ads)

        ads.forEach((item, index) => {
            const img = document.createElement("img");
            img.src = cloudinaryBase + item.img;
            img.alt = `Ad ${index + 1}`;
            img.style.height = "180px";
            img.style.borderRadius = "10px";
            img.style.marginRight = "10px";
            slider.appendChild(img);
        });
    } catch (error) {
        console.error("Error fetching ads:", error);
        slider.innerHTML = "<p>Failed to load ads.</p>";
    }
});
