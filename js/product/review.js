// Assuming you've already fetched product details like this:
const response = await fetch(`${apiUrl}details/${productDetails.sku}`);
if (!response.ok) throw new Error("Failed to fetch product data");
const data = await response.json();

// Select the container where reviews will be displayed
const reviewContainer = document.querySelector('.r3v13w-c4rd5.p4g3-1-c0nt3nt');

// Clear previous reviews if any
reviewContainer.innerHTML = '';

// Loop through API reviews
data.reviews.forEach((review) => {
  const stars = '★'.repeat(Math.round(review.rating)) + '☆'.repeat(5 - Math.round(review.rating));
  const userInitial = `U`; // Replace with dynamic initials if you have usernames
  const date = new Date(review.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  // Create review card HTML
  const reviewCard = `
    <div class="r3v13w-c4rd">
      <div class="r3v13w-h34d3r">
        <div class="u53r-4v4t4r">${userInitial}</div>
        <div class="u53r-1nf0">
          <div class="u53r-n4m3">User #${review.user}</div>
          <div class="r3v13w-d4t3">Verified Purchase • ${date}</div>
        </div>
      </div>
      <div class="r3v13w-5t4r5">${stars}</div>
      <h4 class="r3v13w-t1tl3">Customer Review</h4>
      <p class="r3v13w-c0nt3nt">${review.comment}</p>
      <div class="r3v13w-v3r1f13d">
        <span class="v3r1f13d-1c0n">✓</span> Verified Purchase
      </div>
    </div>
  `;

  // Append to container
  reviewContainer.insertAdjacentHTML('beforeend', reviewCard);
});
