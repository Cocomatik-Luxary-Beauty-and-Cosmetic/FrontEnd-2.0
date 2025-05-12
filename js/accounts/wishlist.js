const token = localStorage.getItem("authToken");
console.log(token);

loadWishlist();

function loadWishlist() {
  fetch('https://engine.cocomatik.com/api/wishlist/', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `token ${token}`
    }
  })
  .then(response => response.json())
  .then(data => {
    renderWishlistItems(data);
  })
  .catch(error => {
    console.error('Error fetching wishlist data:', error);
    document.getElementById('WishlistItemBox').innerHTML = '❌ Failed to load wishlist data.';
  });
}