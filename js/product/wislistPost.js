const wislistBtn = document.getElementById("wislistBtn");
const tokens = localStorage.getItem("authToken");
const wishlistID =  JSON.parse(localStorage.getItem("productDetailsId"));

console.log("Token:", tokens);
console.log( wishlistID);

wislistBtn.addEventListener("click", function () {
    if (!tokens || !wishlistID) {
        console.error("Missing token or product ID");
        alert("Missing token or product ID");
        return;
    }



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
        console.log('Success:', result);
        alert("ok");
    })
    .catch(error => {
        console.error('Error:', error);
        alert("not ok");
    });
});
