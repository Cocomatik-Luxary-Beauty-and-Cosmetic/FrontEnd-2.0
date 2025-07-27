let Cosmetics = document.getElementById("Cosmetics");

Cosmetics.addEventListener("click", function () {
    window.location.href = "/pages/cosmetic/cosmetichome.html";
});

let jewelry = document.getElementById("jewelry");

jewelry.addEventListener("click", function () {
    window.location.href = "/pages/jwellery/jwelleryhome.html";
});

document.addEventListener("DOMContentLoaded", async function () {
    const apiUrl = "https://engine.cocomatik.com/api/home/products/all/"; // 👈 replaced here
    const container = document.getElementById("special-type-product-container-box");

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        console.log(data)

        data.forEach(product => {
            const title = product.title || "No Title Available";
            const description = product.description || "No Description Available";
            const price = product.price || "N/A";
            const pr_image = product.display_image || "Image Unavailable";

            const imageUrl = `https://res.cloudinary.com/cocomatik/${pr_image}`;

            const productBox = document.createElement("div");
            productBox.id = "special-type-product-box";

            productBox.innerHTML = `
                <div id="special-type-product-img">
                    <img src="${imageUrl}" alt="${title}">
                </div>
                <div id="special-type-product-details">
                    <div id="special-type-product-name">${title.slice(0, 30)}</div>
                    <div id="special-type-product-about">${description.slice(0, 50)}..</div>
                    <div id="special-type-product-price">₹${price}</div>
                </div>   
            `;

            productBox.addEventListener("click", () => {
                localStorage.setItem("productDetailsId", JSON.stringify({ sku: product.sku }));
                localStorage.setItem("producttype", product.sku.split("-")[0]);
                console.log("Product ID stored:", product.sku);
                window.location.href = "/pages/product/productdetails.html";
            });

            container.appendChild(productBox);
        });
    } catch (error) {
        console.error("Error fetching data:", error);
    }
});
