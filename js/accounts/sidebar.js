document.addEventListener("DOMContentLoaded", function () {
    const sidebarHTML = `
<aside class="sidebar">
    <div class="user-profile">
        <div class="user-avatar">
            <i class="fas fa-user"></i>
        </div>
        <p class="greeting">Hello,</p>
        <h3 class="username">User</h3>
    </div>

    <ul class="sidebar-menu">
        <li>
            <a href="/pages/orders/orders.html">
                <i class="fas fa-box"></i>
                <span>My Orders</span>
            </a>
        </li>
        <li>
            <ul class="submenu open">
                <li><a href="/pages/account/profile.html" class="active"><i class="fa-solid fa-user"></i> Profile Information</a></li>
                <li><a href="/pages/address/addresses.html"><i class="fa-solid fa-address-card"></i> Manage Addresses</a></li>
            </ul>
        </li>
        
        <li>
            <a href="#" id="logout-link">
                <i class="fas fa-sign-out-alt"></i>
                <span>Log Out</span>
            </a>
        </li>
    </ul>
</aside>
    `;

    // Insert the sidebar
    document.getElementById("sidebar-container").innerHTML = sidebarHTML;

    // Attach logout click handler
    document.getElementById("logout-link").addEventListener("click", function (e) {
        e.preventDefault();
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = "/index.html";
    });

    // Set username
    const username = localStorage.getItem("username");
    if (username === "null null") {
        document.querySelector(".username").textContent = "User";
    } else {
        document.querySelector(".username").textContent = username;
    }

    // Set gender avatar
    const avatarDiv = document.querySelector('.user-avatar');
    const gender = localStorage.getItem("gender");
    if (gender === "male") {
        avatarDiv.innerHTML = `<img src="/assets/accounts/man.png" alt="Male Avatar" class="avatar-img" style="width:70px; height:70px;">`;
    } else if (gender === "female") {
        avatarDiv.innerHTML = `<img src="/assets/accounts/woman.png" alt="Female Avatar" class="avatar-img" style="width:70px; height:70px;">`;
    } else {
        avatarDiv.innerHTML = `<i class="fas fa-user"></i>`;
    }
});
