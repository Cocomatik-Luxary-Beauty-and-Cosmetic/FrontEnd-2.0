// Function to load external HTML into a container and run a callback after load
function loadComponent(id, file, callback) {
    fetch(file)
        .then(response => response.text())
        .then(data => {
            document.getElementById(id).innerHTML = data;
            if (callback) callback(); // Run this after component is loaded
        })
        .catch(error => console.error(`Error loading ${file}:`, error));
}

document.addEventListener("DOMContentLoaded", function () {
    // Load navbar and handle login/account buttons after navbar is loaded
    loadComponent("navbar", "/pages/navbar-footer/nav.html", function () {
        // Now buttons exist in DOM
        let AccountBTN = document.getElementById("AccountBTN");
        let LoginBTN = document.getElementById("LoginBTN");

        if (!AccountBTN || !LoginBTN) {
            console.warn("Login or Account button not found in navbar.");
            return;
        }

        // Default hide both
        AccountBTN.style.display = "none";
        LoginBTN.style.display = "none";

        // Check auth token and show relevant button
        let authToken = localStorage.getItem("authToken");

        if (authToken) {
            AccountBTN.style.display = "block";
        } else {
            LoginBTN.style.display = "block";
        }
    });

    // Load footer
    loadComponent("footer", "/pages/navbar-footer/foot.html");
});
