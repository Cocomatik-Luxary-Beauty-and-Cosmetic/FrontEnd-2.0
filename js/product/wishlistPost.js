const wislistBtn = document.getElementById("wislistBtn");
const tokens = localStorage.getItem("authToken");
const wishlistID = JSON.parse(localStorage.getItem("productDetailsId"));
const wishlistMsg = document.getElementById("productDetailMsg");

if (!wishlistID) {
    console.error("Missing productDetailsId");
}

const producTID = wishlistID?.sku;
const wishlistSku = JSON.parse(localStorage.getItem("wishlistSku")) || [];

console.log("Current SKU:", producTID);
console.log("Wishlist SKUs from localStorage:", wishlistSku);

// 1. Initial class setup based on wishlist
if (wishlistSku.includes(producTID)) {
    wislistBtn.className = 'bx bxs-heart';
} else {
    wislistBtn.className = 'bx bx-heart';
}

// 2. Toggle wishlist on button click
wislistBtn.addEventListener("click", function () {
    

    const isInWishlist = wislistBtn.classList.contains("bxs-heart");

    if (isInWishlist) {
        // Remove from wishlist
        fetch('https://engine.cocomatik.com/api/wishlist/', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `token ${tokens}`
            },
            body: JSON.stringify({ sku: producTID })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            // Only update icon and message
            wislistBtn.className = 'bx bx-heart';
            wishlistMsg.innerHTML = "Product removed from Wishlist.";
        })
        .catch(error => {
            console.error('Error:', error);
            wishlistMsg.innerHTML = "Failed to remove product. Try again.";
        });
    } else {
        // Add to wishlist
        fetch('https://engine.cocomatik.com/api/wishlist/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `token ${tokens}`
            },
            body: JSON.stringify(wishlistID)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(result => {
            wislistBtn.className = 'bx bxs-heart';
            wishlistMsg.innerHTML = "Product added to Wishlist.";
          setTimeout(function(){
                window.location.href = "../account/wishlist.html";
          },1500)

        })
        .catch(error => {
            console.error('Error:', error);
            wishlistMsg.innerHTML = "Failed to add product. Try again.";
        });
    }
});
