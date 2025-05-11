function loadComponent(id, file) {
    fetch(file)
        .then(response => response.text())
        .then(data => {
            document.getElementById(id).innerHTML = data;
        })
        .catch(error => console.error(`Error loading ${file}:`, error));
}

document.addEventListener("DOMContentLoaded", function () {
    loadComponent("navbar", "/pages/navbar-footer/nav.html");
    loadComponent("footer", "/pages/navbar-footer/foot.html");
});



let AccountBTN=document.getElementById("AccountBTN")
let LoginBTN=document.getElementById("LoginBTN")
// AccountBTN.style.display="none"
LoginBTN.style.display="none"

let authToken = localStorage.getItem("authToken");



// if (authToken) {
//     AccountBTN.style.display = "block";
//     LoginBTN.style.display = "none";
// } else {
//     AccountBTN.style.display = "none";
//     LoginBTN.style.display = "block";
// }