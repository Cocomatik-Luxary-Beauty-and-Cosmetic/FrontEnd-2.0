// document.addEventListener("DOMContentLoaded", function () {
//     const navHTML = `
// <link rel="stylesheet" href="/css/navfoot/nav-foot.css">
// <link rel="stylesheet" href="/css/responsive.css">
// <section class="nav-bar-container">
//     <!-- logo -->
//     <div class="logo-box">
//         <div class="logo">
//             <a href="/index.html">
//                 <img src="/assets/data/coco-logo.png" width="200px" alt="Company Logo">
//             </a>
//         </div>
//     </div>

//     <!-- search -->
//     <div class="search-box" style="position: relative;">
//         <div class="InputContainer">
//             <input placeholder="search" id="searchInput" class="search-input" type="text" autocomplete="off" />
//             <div class="search-btn-box"><i class='bx bx-search'></i></div>
//         </div>
//         <div class="suggestions-box" id="suggestionsBox"></div>
//     </div>

//     <!-- btns -->
//     <div class="btns-icons">
//         <div class="btns-box">
//             <a href="/pages/account/wishlist.html"><i class='bx bx-heart'></i><div class="btns-name">Wishlist</div></a>
//             <a href="/pages/cart/cart.html"><i class='bx bx-cart-alt'></i><div class="btns-name">Cart</div></a>
//             <div id="AccountBTN">
//                 <a href="/pages/account/profile.html"><i class='bx bxs-user'></i><div class="btns-name">Account</div></a>
//             </div>
//             <div id="LoginBTN">
//                 <a href="/pages/account/login.html"><i class='bx bx-lock-alt'></i><div class="btns-name">Login</div></a>
//             </div>
//         </div>
//     </div>
// </section>

// <section class="mobileview-search-container" style="margin-top: 10px; position: relative;">
//     <div class="InputContainer">
//         <input placeholder="search" id="mobileSearchInput" class="search-input" type="text" autocomplete="off" />
//         <div class="search-btn-box"><i class='bx bx-search'></i></div>
//         <div class="suggestions-box" id="mobileSuggestionsBox"></div>
//     </div>
// </section>
// `;

//     // Inject into the nav container
//     document.getElementById("nav-container").innerHTML = navHTML;

//     // Toggle between Login / Account
//     const username = localStorage.getItem("username");
//     if (username) {
//         document.getElementById("LoginBTN").style.display = "none";
//         document.getElementById("AccountBTN").style.display = "block";
//     } else {
//         document.getElementById("LoginBTN").style.display = "block";
//         document.getElementById("AccountBTN").style.display = "none";
//     }

//     // Suggestion data from API
//     let suggestions = [];

//     const token = localStorage.getItem('authToken');
//     fetch('https://engine.cocomatik.com/api/home/products/all/', {
//         method: 'GET',
//         headers: {
//             'Content-Type': 'application/json',
//             'Authorization': `token ${token}`
//         }
//     })
//     .then(res => res.json())
//     .then(data => {
//         const items = Array.isArray(data) ? data : data.results || data.products || [];
//         suggestions = items.map(item => ({
//             name: item.name || "",
//             title: item.title || "",
//             sku: item.sku || ""
//         }));
//     })
//     .catch(error => {
//         console.error('Error fetching suggestions:', error);
//         suggestions = [];
//     });

//     function setupSuggestionBox(inputId, boxId) {
//         const input = document.getElementById(inputId);
//         const box = document.getElementById(boxId);

//         function showSuggestions(query = "") {
//             const filtered = suggestions.filter(item =>
//                 item.title.toLowerCase().includes(query.toLowerCase())
//             );

//             box.innerHTML = '';
//             if (filtered.length === 0) {
//                 box.style.display = "none";
//                 return;
//             }

//             filtered.forEach(item => {
//                 const div = document.createElement('div');
//                 div.textContent = item.title;
//                 div.addEventListener('click', () => {
//                     input.value = item.title;
//                     localStorage.setItem("suggestionsID", JSON.stringify({
//                         name: item.name,
//                         title: item.title,
//                         sku: item.sku
//                     }));
//                     box.innerHTML = '';
//                     box.style.display = "none";
//                 });
//                 box.appendChild(div);
//             });

//             box.style.display = "block";
//         }

//         input.addEventListener('input', () => {
//             showSuggestions(input.value);
//         });

//         input.addEventListener('focus', () => {
//             showSuggestions(input.value);
//         });

//         document.addEventListener('click', (e) => {
//             if (!e.target.closest(`#${boxId}`) && e.target !== input) {
//                 box.innerHTML = '';
//                 box.style.display = "none";
//             }
//         });
//     }

//     // Apply to desktop and mobile inputs
//     setupSuggestionBox("searchInput", "suggestionsBox");
//     setupSuggestionBox("mobileSearchInput", "mobileSuggestionsBox");
// });

// ----------------------------new--------------------------------------------------

document.addEventListener("DOMContentLoaded", function () {
    const navHTML = `
<link rel="stylesheet" href="/css/navfoot/nav-foot.css">
<link rel="stylesheet" href="/css/responsive.css">
<section class="nav-bar-container">
    <!-- logo -->
    <div class="logo-box">
        <div class="logo">
            <a href="/index.html">
                <img src="/assets/data/coco-logo.png" width="200px" alt="Company Logo">
            </a>
        </div>
    </div>

    <!-- search -->
    <div class="search-box" style="position: relative;">
        <div class="InputContainer">
            <input placeholder="search" id="searchInput" class="search-input" type="text" autocomplete="off" />
            <!-- Added ID for desktop search button -->
            <div class="search-btn-box" id="desktopSearchBtn"><i class='bx bx-search'></i></div>
        </div>
        <div class="suggestions-box" id="suggestionsBox"></div>
    </div>

    <!-- btns -->
    <div class="btns-icons">
        <div class="btns-box">
            <a href="/pages/account/wishlist.html"><i class='bx bx-heart'></i><div class="btns-name">Wishlist</div></a>
            <a href="/pages/cart/cart.html"><i class='bx bx-cart-alt'></i><div class="btns-name">Cart</div></a>
            <div id="AccountBTN">
                <a href="/pages/account/profile.html"><i class='bx bxs-user'></i><div class="btns-name">Account</div></a>
            </div>
            <div id="LoginBTN">
                <a href="/pages/account/login.html"><i class='bx bx-lock-alt'></i><div class="btns-name">Login</div></a>
            </div>
        </div>
    </div>
</section>

<section class="mobileview-search-container" style="margin-top: 10px; position: relative;">
    <div class="InputContainer">
        <input placeholder="search" id="mobileSearchInput" class="search-input" type="text" autocomplete="off" />
        <!-- Added ID for mobile search button -->
        <div class="search-btn-box" id="mobileSearchBtn"><i class='bx bx-search'></i></div>
        <div class="suggestions-box" id="mobileSuggestionsBox"></div>
    </div>
</section>
`;

    // Inject HTML
    document.getElementById("nav-container").innerHTML = navHTML;

    // Login/Account toggle
    const username = localStorage.getItem("username");
    if (username) {
        document.getElementById("LoginBTN").style.display = "none";
        document.getElementById("AccountBTN").style.display = "block";
    } else {
        document.getElementById("LoginBTN").style.display = "block";
        document.getElementById("AccountBTN").style.display = "none";
    }

    // Fetch suggestions
    let suggestions = [];
    const token = localStorage.getItem('authToken');
    fetch('https://engine.cocomatik.com/api/home/products/all/', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(res => res.json())
    .then(data => {
        const items = Array.isArray(data) ? data : data.results || data.products || [];
        suggestions = items.map(item => ({
            name: item.name || "",
            title: item.title || "",
            sku: item.sku || ""
        }));
    })
    .catch(error => {
        console.error('Error fetching suggestions:', error);
        suggestions = [];
    });

    // Suggestion box setup
    function setupSuggestionBox(inputId, boxId) {
        const input = document.getElementById(inputId);
        const box = document.getElementById(boxId);

        function showSuggestions(query = "") {
            if (!query) {
                box.innerHTML = '';
                box.style.display = "none";
                return;
            }

            const filtered = suggestions.filter(item =>
                item.title.toLowerCase().includes(query.toLowerCase())
            );

            box.innerHTML = '';
            if (filtered.length === 0) {
                box.style.display = "none";
                return;
            }

            filtered.forEach(item => {
                const div = document.createElement('div');
                div.textContent = item.title;
                div.addEventListener('click', () => {
                    input.value = item.title;
                    localStorage.setItem("suggestionsID", JSON.stringify({
                        name: item.name,
                        title: item.title,
                        sku: item.sku
                    }));
                    box.innerHTML = '';
                    box.style.display = "none";
                });
                box.appendChild(div);
            });

            box.style.display = "block";
        }

        input.addEventListener('input', () => {
            showSuggestions(input.value);
        });

        input.addEventListener('focus', () => {
            showSuggestions(input.value);
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest(`#${boxId}`) && e.target !== input) {
                box.innerHTML = '';
                box.style.display = "none";
            }
        });
    }

    setupSuggestionBox("searchInput", "suggestionsBox");
    setupSuggestionBox("mobileSearchInput", "mobileSuggestionsBox");

    // ===== Add Search handlers for Enter key and search button click =====

    // Desktop Enter key
    document.getElementById("searchInput").addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
            const val = this.value.trim();
            if (val) {
                localStorage.setItem("searchTerm", val);
                window.location.href = "/pages/product/search.html";
            }
        }
    });

    // Desktop search button click
    document.getElementById("desktopSearchBtn").addEventListener("click", function () {
        const val = document.getElementById("searchInput").value.trim();
        if (val) {
            localStorage.setItem("searchTerm", val);
            window.location.href = "/pages/product/search.html";
        }
    });

    // Mobile Enter key
    document.getElementById("mobileSearchInput").addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
            const val = this.value.trim();
            if (val) {
                localStorage.setItem("searchTerm", val);
                window.location.href = "/pages/product/search.html";
            }
        }
    });

    // Mobile search button click
    document.getElementById("mobileSearchBtn").addEventListener("click", function () {
        const val = document.getElementById("mobileSearchInput").value.trim();
        if (val) {
            localStorage.setItem("searchTerm", val);
            window.location.href = "/pages/product/search.html";
        }
    });
});
