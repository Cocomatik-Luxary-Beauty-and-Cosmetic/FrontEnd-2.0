document.addEventListener("DOMContentLoaded", async () => {
    const jewelryApiUrl = "https://engine.cocomatik.com/api/home/products/all/";
    const adApiUrl = "https://engine.cocomatik.com/api/pocos/adds/";
    const cloudinaryBase = "https://res.cloudinary.com/cocomatik/";

    // ----------------- LOAD JEWELLERY PRODUCTS -----------------
    try {
        const response = await fetch(jewelryApiUrl);
        const products = await response.json();

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
            const filtered = products.filter(p => p.category === name).slice(0, 4);
            const container = document.getElementById(containerId);

            if (container) {
                filtered.forEach(product => {
                    const card = document.createElement("div");
                    card.id = "products-card";
                    card.dataset.sku = product.sku;

                    card.innerHTML = `
                        <div id="products-img">
                            <img src="${cloudinaryBase}${product.display_image}" alt="${product.title}" width="100">
                        </div>
                        <div id="products-dtls">
                            <h3 id="product-title">${product.title.slice(0, 50)}..</h3>
                            <p id="product-category">${product.category}</p>
                            <p id="product-price">₹${product.price}</p>
                            <button id="add-to-cart">View Product</button>
                        </div>
                    `;

                    card.addEventListener("click", () => {
                        localStorage.setItem("productDetailsId", JSON.stringify({ sku: product.sku }));
                        window.location.href = "/pages/product/productdetails.html";
                    });

                    container.appendChild(card);
                });
            }
        });
    } catch (error) {
        console.error("Error loading jewelry products:", error);
    }

    // ----------------- LOAD RANDOMIZED ADS -----------------
    const slider = document.querySelector(".slider");

    if (!slider) {
        console.warn("Ad slider container not found.");
        return;
    }

    try {
        const res = await fetch(adApiUrl);
        const adData = await res.json();

        // Shuffle ads randomly
        const shuffled = adData.sort(() => 0.5 - Math.random());

        shuffled.forEach((item, index) => {
            const img = document.createElement("img");
            img.src = `${cloudinaryBase}${item.img}`;
            img.alt = `Ad ${index + 1}`;
            img.style.height = "180px";
            img.style.borderRadius = "10px";
            img.style.marginRight = "10px";
            slider.appendChild(img);
        });

    } catch (err) {
        console.error("Error loading ads:", err);
        slider.innerHTML = "<p>Failed to load ads.</p>";
    }
});
