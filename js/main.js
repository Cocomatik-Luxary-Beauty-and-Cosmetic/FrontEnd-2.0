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
    // Load footer
    loadComponent("footer", "/pages/navbar-footer/foot.html");
});
