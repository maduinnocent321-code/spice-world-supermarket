import { db } from "./firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";


const productGrid =
    document.getElementById("product-grid");

const cartCount =
    document.getElementById("cart-count");

const searchInput =
    document.getElementById("search");

const categoryFilter =
    document.getElementById("category-filter");


let cart =
    JSON.parse(localStorage.getItem("cart")) || [];


updateCartCount();


/* =========================
   CATEGORY NAMES
========================= */

function getCategoryName(category) {

    const categories = {
        rice: "Rice & Grains",
        spices: "Spices",
        fresh: "Fresh Produce",
        frozen: "Frozen Foods",
        drinks: "Drinks"
    };

    return categories[category] || category;

}


/* =========================
   CATEGORY ICONS
========================= */

function getCategoryIcon(category) {

    const icons = {
        rice: "🍚",
        spices: "🌶️",
        fresh: "🥬",
        frozen: "❄️",
        drinks: "🥤"
    };

    return icons[category] || "🛒";

}


/* =========================
   LOAD PRODUCTS
========================= */

async function loadProducts() {

    productGrid.innerHTML =
        "<p>Loading products...</p>";

    try {

        const snapshot =
            await getDocs(
                collection(db, "products")
            );

        if (snapshot.empty) {

            productGrid.innerHTML =
                "<p>No products available.</p>";

            return;
        }

        productGrid.innerHTML = "";

        snapshot.forEach(function(document) {

            const product =
                document.data();

            if (product.active !== true) {
                return;
            }


            const categoryName =
                getCategoryName(
                    product.category
                );

            const categoryIcon =
                getCategoryIcon(
                    product.category
                );


            let productImageHTML = "";

            if (
                product.image &&
                product.image.trim() !== ""
            ) {

                productImageHTML = `
                    <img
                        src="${product.image}"
                        alt="${product.name}"
                        class="product-photo"
                        data-fallback="${categoryIcon}"
                    >
                `;

            } else {

                productImageHTML = `
                    <span class="product-placeholder">
                        ${categoryIcon}
                    </span>
                `;

            }


            let stockHTML = "";

            if (product.stock > 0) {

                stockHTML = `
                    <p class="product-stock">
                        ${product.stock} in stock
                    </p>
                `;

            } else {

                stockHTML = `
                    <p class="product-stock out-of-stock">
                        Out of stock
                    </p>
                `;

            }


            const disabled =
                product.stock <= 0
                    ? "disabled"
                    : "";


            const buttonText =
                product.stock <= 0
                    ? "Out of Stock"
                    : "Add to Basket";


            productGrid.innerHTML += `
                <div
                    class="product-card"
                    data-category="${product.category}"
                >

                    <div class="product-image">
                        ${productImageHTML}
                    </div>

                    <div class="product-info">

                        <span class="product-category">
                            ${categoryName}
                        </span>

                        <h3>
                            ${product.name}
                        </h3>

                        ${stockHTML}

                        <div class="product-bottom">

                            <span class="price">
                                £${Number(product.price).toFixed(2)}
                            </span>

                            <button
    class="add-cart"
    data-id="${document.id}"
    data-name="${product.name}"
    data-price="${product.price}"
    data-stock="${product.stock}"
    ${disabled}
    style="
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 44px;
        padding: 11px 17px;
        background: #1f7a46;
        color: white;
        border: none;
        border-radius: 10px;
        font-weight: 700;
        cursor: pointer;
    "
>
    ${buttonText}
</button>

                        </div>

                    </div>

                </div>
            `;

        });


        setupImageFallbacks();
        setupCartButtons();
        applyFilters();


    } catch (error) {

        console.error(
            "Error loading products:",
            error
        );

        productGrid.innerHTML =
            "<p>Unable to load products.</p>";

    }

}


/* =========================
   BROKEN IMAGE FALLBACK
========================= */

function setupImageFallbacks() {

    const productImages =
        document.querySelectorAll(
            ".product-photo"
        );

    productImages.forEach(function(image) {

        image.addEventListener(
            "error",
            function() {

                const fallback =
                    this.dataset.fallback || "🛒";

                const container =
                    this.parentElement;

                container.innerHTML = `
                    <span class="product-placeholder">
                        ${fallback}
                    </span>
                `;

            }
        );

    });

}


/* =========================
   ADD TO BASKET
========================= */

function setupCartButtons() {

    const cartButtons =
        document.querySelectorAll(
            ".add-cart"
        );

    cartButtons.forEach(function(button) {

        button.addEventListener(
            "click",
            function() {

                const productId =
                    this.dataset.id;

                const productName =
                    this.dataset.name;

                const productPrice =
                    Number(
                        this.dataset.price
                    );
                    const productStock =
    Number(
        this.dataset.stock
    );


                const existingProduct =
                    cart.find(
                        item =>
                            item.productId === productId
                    );


                if (
    existingProduct &&
    existingProduct.quantity >= productStock
) {

    this.textContent =
        "Maximum stock reached";

    const button =
        this;

    setTimeout(function() {

        button.textContent =
            "Add to Basket";

    }, 1500);

    return;

}


if (existingProduct) {

    existingProduct.quantity += 1;

} else {

    cart.push({
        productId: productId,
        name: productName,
        price: productPrice,
        quantity: 1,
        stock: productStock
    });

}


                localStorage.setItem(
                    "cart",
                    JSON.stringify(cart)
                );


                updateCartCount();


                const originalText =
                    this.textContent;

                this.textContent =
                    "Added ✓";


                const button =
                    this;


                setTimeout(function() {

                    button.textContent =
                        originalText;

                }, 1000);

            }
        );

    });

}


/* =========================
   UPDATE BASKET COUNT
========================= */

function updateCartCount() {

    const totalItems =
        cart.reduce(
            (total, item) =>
                total + item.quantity,
            0
        );

    cartCount.textContent =
        totalItems;

}


/* =========================
   SEARCH AND FILTER
========================= */

function applyFilters() {

    const searchValue =
        searchInput.value
            .toLowerCase()
            .trim();

    const selectedCategory =
        categoryFilter.value;


    const products =
        document.querySelectorAll(
            ".product-card"
        );


    products.forEach(function(product) {

        const name =
            product
                .querySelector("h3")
                .textContent
                .toLowerCase();

        const productCategory =
            product.dataset.category;


        const matchesSearch =
            name.includes(searchValue);


        const matchesCategory =
            selectedCategory === "all" ||
            selectedCategory ===
                productCategory;


        if (
            matchesSearch &&
            matchesCategory
        ) {

            product.style.display =
                "block";

        } else {

            product.style.display =
                "none";

        }

    });

}


searchInput.addEventListener(
    "input",
    applyFilters
);


categoryFilter.addEventListener(
    "change",
    applyFilters
);


/* =========================
   START SHOP
========================= */

loadProducts();