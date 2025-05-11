localStorage.setItem("producttype","POCO")

let Skincare = document.getElementById("Skincare");
Skincare.addEventListener("click", function () {
    localStorage.setItem("category", "Skincare");
    window.location.href=("/pages/product/bestofproduct.html")
});

let Fragrances = document.getElementById("Fragrances");
Fragrances.addEventListener("click", function () {
    localStorage.setItem("category", "Fragrances");
    window.location.href=("/pages/product/bestofproduct.html")
});

let Bodycare = document.getElementById("Bodycare");
Bodycare.addEventListener("click", function () {
    localStorage.setItem("category", "Bodycare");
    window.location.href=("/pages/product/bestofproduct.html")
});

let ColorCosmetics = document.getElementById("ColorCosmetics");
ColorCosmetics.addEventListener("click", function () {
    localStorage.setItem("category", "Color Cosmetics");
    window.location.href=("/pages/product/bestofproduct.html")
});

let Imported_Products = document.getElementById("ImportedProducts");
Imported_Products.addEventListener("click", function () {
    localStorage.setItem("category", "Imported Products");
    window.location.href=("/pages/product/bestofproduct.html")
});

let Haircare= document.getElementById("Haircare");
Haircare.addEventListener("click", function () {
    localStorage.setItem("category", "Haircare");
    window.location.href=("/pages/product/bestofproduct.html")
});


