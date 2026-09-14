import { db, auth } from "./firebase.js";

import {
    collection,
    getDocs,
    getDoc,
    query,
    orderBy,
    doc,
    updateDoc,
    addDoc,
    deleteDoc,
    runTransaction
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";


const ordersList =
    document.getElementById(
        "orders-list"
    );

const enquiriesList =
    document.getElementById(
        "enquiries-list"
    );

    function getDisplayProductName(productName) {
    if (productName === "mango") {
        return "Fresh Mango";
    }

    if (productName === "Test Mango Juice") {
        return "Mango Juice 1L";
    }

    if (productName === "Jollof Seasoning") {
        return "Tropical Sun Jerk Seasoning 100g";
    }

    return productName;
}

function getDisplayCustomer(customer) {

    const email =
        String(
            customer?.email || ""
        )
            .trim()
            .toLowerCase();

    // Keep our clean demonstration order unchanged
    if (email === "demo@example.com") {
        return {
            name: customer?.name || "",
            phone: customer?.phone || "",
            email: customer?.email || "",
            address: customer?.address || "",
            city: customer?.city || "",
            postcode: customer?.postcode || ""
        };
    }

    // Clean display for old test orders
    return {
        name: "Sample Customer",
        phone: "07123 456789",
        email: "customer@example.com",
        address: "25 Market Street",
        city: "Manchester",
        postcode: "M1 1AA"
    };
}

/* =========================
   PRODUCT FILTER VARIABLES
========================= */
const adminOrderSearch =
    document.getElementById(
        "admin-order-search"
    );

const adminOrderStatusFilter =
    document.getElementById(
        "admin-order-status-filter"
    );
    const adminOrderSort =
    document.getElementById(
        "admin-order-sort"
    );
    const adminOrderDateFilter =
    document.getElementById(
        "admin-order-date-filter"
    );
const adminProductSearch =
    document.getElementById(
        "admin-product-search"
    );

const adminCategoryFilter =
    document.getElementById(
        "admin-category-filter"
    );

const adminStatusFilter =
    document.getElementById(
        "admin-status-filter"
    );

const adminProductSort =
    document.getElementById(
        "admin-product-sort"
    );

let lowStockOnly = false;
let outOfStockOnly = false;


/* =========================
   PRODUCT FILTER FUNCTION
========================= */

function applyProductFilters() {

    const searchText =
        adminProductSearch
            ? adminProductSearch.value
                .toLowerCase()
                .trim()
            : "";

    const selectedCategory =
        adminCategoryFilter
            ? adminCategoryFilter.value
            : "all";

    const selectedStatus =
        adminStatusFilter
            ? adminStatusFilter.value
            : "all";

    const productCards =
        document.querySelectorAll(
            ".admin-product-card"
        );

    let visibleCount = 0;

    productCards.forEach(
        function(card) {

            const productName =
                card.dataset.name || "";

            const productCategory =
                card.dataset.category || "";

            const productStock =
                Number(
                    card.dataset.stock
                );

            const productStatus =
                card.dataset.status || "";

            const matchesSearch =
                productName.includes(
                    searchText
                );

            const matchesCategory =
                selectedCategory === "all" ||
                productCategory ===
                    selectedCategory;

            const matchesStatus =
                selectedStatus === "all" ||
                productStatus ===
                    selectedStatus;

            const matchesLowStock =
    !lowStockOnly ||
    (
        productStock > 0 &&
        productStock <= 5
    );
                const matchesOutOfStock =
    !outOfStockOnly ||
    productStock === 0;

            if (
    matchesSearch &&
    matchesCategory &&
    matchesStatus &&
    matchesLowStock &&
    matchesOutOfStock
) {

                card.style.display = "";
                visibleCount++;

            } else {

                card.style.display =
                    "none";

            }

        }
    );

    const resultsCount =
        document.getElementById(
            "product-results-count"
        );

    if (resultsCount) {

        resultsCount.textContent =
            visibleCount === 1
                ? "Showing 1 product"
                : `Showing ${visibleCount} products`;

    }

}


/* =========================
   SORT PRODUCTS
========================= */

function sortProducts() {

    const productsList =
        document.getElementById(
            "admin-products-list"
        );

    if (!productsList) {
        return;
    }

    const sortValue =
        adminProductSort
            ? adminProductSort.value
            : "default";

    const productCards =
        Array.from(
            document.querySelectorAll(
                ".admin-product-card"
            )
        );

    productCards.sort(
        function(a, b) {

            const nameA =
                a.dataset.name || "";

            const nameB =
                b.dataset.name || "";

            const priceA =
                Number(
                    a.dataset.price
                );

            const priceB =
                Number(
                    b.dataset.price
                );

            const stockA =
                Number(
                    a.dataset.stock
                );

            const stockB =
                Number(
                    b.dataset.stock
                );

            if (
                sortValue ===
                "name-asc"
            ) {
                return nameA.localeCompare(
                    nameB
                );
            }

            if (
                sortValue ===
                "price-asc"
            ) {
                return priceA - priceB;
            }

            if (
                sortValue ===
                "price-desc"
            ) {
                return priceB - priceA;
            }

            if (
                sortValue ===
                "stock-asc"
            ) {
                return stockA - stockB;
            }

            if (
                sortValue ===
                "stock-desc"
            ) {
                return stockB - stockA;
            }

            return 0;

        }
    );

    productCards.forEach(
        function(card) {

            productsList.appendChild(
                card
            );

        }
    );

}


/* =========================
   LOAD ORDERS
========================= */

async function loadOrders() {

    if (!ordersList) {
        return;
    }

    ordersList.innerHTML =
        "<p>Loading orders...</p>";

    try {

        const ordersQuery =
            query(
                collection(
                    db,
                    "orders"
                ),
                orderBy(
                    "createdAt",
                    "desc"
                )
            );

        const snapshot =
            await getDocs(
                ordersQuery
            );


        /* =========================
           DASHBOARD ELEMENTS
        ========================= */

        const newOrdersElement =
            document.getElementById(
                "new-orders"
            );

        const preparingOrdersElement =
            document.getElementById(
                "preparing-orders"
            );

        const deliveryOrdersElement =
            document.getElementById(
                "delivery-orders"
            );

        const completedOrdersElement =
            document.getElementById(
                "completed-orders"
            );

        const cancelledOrdersElement =
            document.getElementById(
                "cancelled-orders"
            );

        const totalSalesElement =
            document.getElementById(
                "total-sales"
            );

        const pendingRevenueElement =
            document.getElementById(
                "pending-revenue"
            );

        const todaySalesElement =
            document.getElementById(
                "today-sales"
            );

        const weekSalesElement =
            document.getElementById(
                "week-sales"
            );

        const monthSalesElement =
            document.getElementById(
                "month-sales"
            );

        const averageOrderValueElement =
            document.getElementById(
                "average-order-value"
            );

        const deliveryRevenueElement =
            document.getElementById(
                "delivery-revenue"
            );

        const completedRevenuePercentElement =
            document.getElementById(
                "completed-revenue-percent"
            );

        const mostPopularProductElement =
            document.getElementById(
                "most-popular-product"
            );

        const unitsSoldElement =
            document.getElementById(
                "units-sold"
            );
            const averageBasketSizeElement =
    document.getElementById(
        "average-basket-size"
    );

        const uniqueCustomersElement =
            document.getElementById(
                "unique-customers"
            );
            const revenuePerCustomerElement =
    document.getElementById(
        "revenue-per-customer"
    );
    const customerValueScoreElement =
    document.getElementById(
        "customer-value-score"
    );

    const cancellationRateElement =
    document.getElementById(
        "cancellation-rate"
    );
const orderCompletionRateElement =
    document.getElementById(
        "order-completion-rate"
    );
    const averageRevenuePerOrderElement =
    document.getElementById(
        "average-revenue-per-order"
    );
    const activeOrderRateElement =
    document.getElementById(
        "active-order-rate"
    );
            const repeatCustomersElement =
    document.getElementById(
        "repeat-customers"
    );
    const repeatCustomerRateElement =
    document.getElementById(
        "repeat-customer-rate"
    );

        const topFiveProductsElement =
            document.getElementById(
                "top-five-products"
            );
            const topCustomersElement =
    document.getElementById(
        "top-customers"
    );
    const cardOrdersElement =
    document.getElementById(
        "card-orders"
    );

    const cashOrdersElement =
    document.getElementById(
        "cash-orders"
    );

const standardDeliveryOrdersElement =
    document.getElementById(
        "standard-delivery-orders"
    );

const collectionOrdersElement =
    document.getElementById(
        "collection-orders"
    );


        const orderResultsCount =
            document.getElementById(
                "order-results-count"
            );


        /* =========================
           NO ORDERS
        ========================= */

        if (snapshot.empty) {

            ordersList.innerHTML =
                "<p>No orders yet.</p>";

            if (orderResultsCount) {
                orderResultsCount.textContent =
                    "Showing 0 orders";
            }

            if (newOrdersElement) {
                newOrdersElement.textContent = "0";
            }

            if (preparingOrdersElement) {
                preparingOrdersElement.textContent = "0";
            }

            if (deliveryOrdersElement) {
                deliveryOrdersElement.textContent = "0";
            }

            if (completedOrdersElement) {
                completedOrdersElement.textContent = "0";
            }

            if (cancelledOrdersElement) {
                cancelledOrdersElement.textContent = "0";
            }

            if (totalSalesElement) {
                totalSalesElement.textContent =
                    "£0.00";
            }

            if (pendingRevenueElement) {
                pendingRevenueElement.textContent =
                    "£0.00";
            }

            if (todaySalesElement) {
                todaySalesElement.textContent =
                    "£0.00";
            }

            if (weekSalesElement) {
                weekSalesElement.textContent =
                    "£0.00";
            }

            if (monthSalesElement) {
                monthSalesElement.textContent =
                    "£0.00";
            }

            if (averageOrderValueElement) {
                averageOrderValueElement.textContent =
                    "£0.00";
            }

            if (deliveryRevenueElement) {
                deliveryRevenueElement.textContent =
                    "£0.00";
            }

            if (completedRevenuePercentElement) {
                completedRevenuePercentElement.textContent =
                    "0%";
            }

            if (unitsSoldElement) {
                unitsSoldElement.textContent =
                    "0";
            }

            if (uniqueCustomersElement) {
                uniqueCustomersElement.textContent =
                    "0";
            }

            if (revenuePerCustomerElement) {

    revenuePerCustomerElement.textContent =
        "£0.00";

}
if (customerValueScoreElement) {

    customerValueScoreElement.textContent =
        "£0.00";

}

if (cancellationRateElement) {

    cancellationRateElement.textContent =
        "0%";

}

if (orderCompletionRateElement) {

    orderCompletionRateElement.textContent =
        "0%";

}

if (activeOrderRateElement) {

    activeOrderRateElement.textContent =
        "0%";

}

            if (repeatCustomersElement) {

    repeatCustomersElement.textContent =
        "0";

}
if (repeatCustomerRateElement) {

    repeatCustomerRateElement.textContent =
        "0%";

}
            if (cardOrdersElement) {

    cardOrdersElement.textContent =
        "0";

}

if (cashOrdersElement) {

    cashOrdersElement.textContent =
        "0";

}

if (standardDeliveryOrdersElement) {

    standardDeliveryOrdersElement.textContent =
        "0";

}

if (collectionOrdersElement) {

    collectionOrdersElement.textContent =
        "0";

}

            if (mostPopularProductElement) {
                mostPopularProductElement.textContent =
                    "-";
            }

            if (topFiveProductsElement) {
                topFiveProductsElement.innerHTML =
                    "<p>No sales yet.</p>";
            }

            return;
        }


        ordersList.innerHTML = "";


        /* =========================
           COUNTERS
        ========================= */

        let newCount = 0;
        let preparingCount = 0;
        let outForDeliveryCount = 0;
        let completedCount = 0;
        let cancelledCount = 0;
        let cardOrdersCount = 0;
let cashOrdersCount = 0;
let standardDeliveryOrdersCount = 0;
let collectionOrdersCount = 0;
        let totalSales = 0;
        let pendingRevenue = 0;
        let todaySales = 0;
        let weekSales = 0;
        let monthSales = 0;

        let deliveryRevenue = 0;

        let totalNonCancelledOrderValue = 0;

        let totalUnitsSold = 0;
        let completedOrdersCountForBasket = 0;

        const productSales = {};

        const uniqueCustomers =
            new Set();
            const customerStats = {};
            let repeatCustomersCount = 0;


        /* =========================
           PROCESS ORDERS
        ========================= */

        snapshot.forEach(
            function(document) {

                const order =
                    document.data();


                /* =========================
                   UNIQUE CUSTOMERS
                ========================= */

                if (
    order.status !==
    "Cancelled"
) {

    const customerEmail =
        String(
            order.customer?.email || ""
        )
            .trim()
            .toLowerCase();

    if (
        customerEmail !== ""
    ) {

        uniqueCustomers.add(
            customerEmail
        );

        if (
            !customerStats[
                customerEmail
            ]
        ) {

            customerStats[
                customerEmail
            ] = {
                orders: 0,
                spent: 0
            };

        }

        customerStats[
            customerEmail
        ].orders++;

        customerStats[
            customerEmail
        ].spent +=
            Number(
                order.total || 0
            );

    }

}


                /* =========================
                   NON-CANCELLED VALUE
                ========================= */

                if (
                    order.status !==
                    "Cancelled"
                ) {

                    totalNonCancelledOrderValue +=
                        Number(
                            order.total || 0
                        );

                }
                /* =========================
   PAYMENT METHOD COUNTERS
========================= */

if (
    order.status !==
    "Cancelled"
) {

    if (
        order.paymentMethod ===
        "cash"
    ) {

        cashOrdersCount++;

    } else {

        cardOrdersCount++;

    }

}

/* =========================
   DELIVERY METHOD COUNTERS
========================= */

if (
    order.status !==
    "Cancelled"
) {

    if (
        order.deliveryMethod ===
        "collection"
    ) {

        collectionOrdersCount++;

    } else {

        standardDeliveryOrdersCount++;

    }

}


                /* =========================
                   PENDING REVENUE
                ========================= */

                if (
                    order.status ===
                        "Order Received" ||
                    order.status ===
                        "Preparing" ||
                    order.status ===
                        "Out for Delivery"
                ) {

                    pendingRevenue +=
                        Number(
                            order.total || 0
                        );

                }


                /* =========================
                   ORDER STATUS COUNTERS
                ========================= */

                if (
                    order.status ===
                    "Order Received"
                ) {

                    newCount++;

                }

                if (
                    order.status ===
                    "Preparing"
                ) {

                    preparingCount++;

                }

                if (
                    order.status ===
                    "Out for Delivery"
                ) {

                    outForDeliveryCount++;

                }

                if (
                    order.status ===
                    "Cancelled"
                ) {

                    cancelledCount++;

                }


                /* =========================
                   COMPLETED SALES
                ========================= */

                if (
                    order.status ===
                    "Completed"
                ) {

                    completedCount++;
                    completedOrdersCountForBasket++;

                    const orderTotal =
                        Number(
                            order.total || 0
                        );

                    totalSales +=
                        orderTotal;

                    deliveryRevenue +=
                        Number(
                            order.delivery || 0
                        );


                    /* =========================
                       PRODUCT SALES
                    ========================= */

                    (order.items || [])
                        .forEach(
                            function(item) {

                                const quantity =
                                    Number(
                                        item.quantity || 0
                                    );

                                totalUnitsSold +=
                                    quantity;

                                const productName =
                                    item.name ||
                                    "Unknown Product";

                                if (
                                    !productSales[
                                        productName
                                    ]
                                ) {

                                    productSales[
                                        productName
                                    ] = 0;

                                }

                                productSales[
                                    productName
                                ] += quantity;

                            }
                        );


                    /* =========================
                       DATE SALES
                    ========================= */

                    if (order.createdAt) {

                        const orderDate =
                            order.createdAt
                                .toDate();

                        const today =
                            new Date();


                        /* TODAY */

                        const isToday =
                            orderDate.getDate() ===
                                today.getDate() &&
                            orderDate.getMonth() ===
                                today.getMonth() &&
                            orderDate.getFullYear() ===
                                today.getFullYear();

                        if (isToday) {

                            todaySales +=
                                orderTotal;

                        }


                        /* THIS WEEK */

                        const startOfWeek =
                            new Date(today);

                        const day =
                            startOfWeek.getDay();

                        const difference =
                            day === 0
                                ? -6
                                : 1 - day;

                        startOfWeek.setDate(
                            startOfWeek.getDate() +
                                difference
                        );

                        startOfWeek.setHours(
                            0,
                            0,
                            0,
                            0
                        );

                        const endOfWeek =
                            new Date(
                                startOfWeek
                            );

                        endOfWeek.setDate(
                            endOfWeek.getDate() +
                                7
                        );

                        if (
                            orderDate >=
                                startOfWeek &&
                            orderDate <
                                endOfWeek
                        ) {

                            weekSales +=
                                orderTotal;

                        }


                        /* THIS MONTH */

                        const isThisMonth =
                            orderDate.getMonth() ===
                                today.getMonth() &&
                            orderDate.getFullYear() ===
                                today.getFullYear();

                        if (isThisMonth) {

                            monthSales +=
                                orderTotal;

                        }

                    }

                }

const displayCustomer =
    getDisplayCustomer(
        order.customer
    );
                /* =========================
                   ORDER ITEMS
                ========================= */

                const itemsHTML =
                    (order.items || [])
                        .map(
                            function(item) {

                                return `
                                    <p>
                                        ${item.quantity}
                                        ×
                                        ${getDisplayProductName(item.name)}
                                    </p>
                                `;

                            }
                        )
                        .join("");


                /* =========================
                   ORDER DATE
                ========================= */

                const orderDateText =
                    order.createdAt
                        ? order.createdAt
                            .toDate()
                            .toLocaleString(
                                "en-GB",
                                {
                                    day:
                                        "2-digit",
                                    month:
                                        "short",
                                    year:
                                        "numeric",
                                    hour:
                                        "2-digit",
                                    minute:
                                        "2-digit"
                                }
                            )
                        : "Date unavailable";


                /* =========================
                   DISPLAY ORDER
                ========================= */

                ordersList.innerHTML += `
                    <div
                        class="admin-order ${
                            order.status ===
                            "Cancelled"
                                ? "cancelled-order"
                                : ""
                        }"

                        data-order-number="${
                            String(
                                order.orderNumber || ""
                            ).toLowerCase()
                        }"

                        data-customer-name="${
                            String(
                                order.customer?.name || ""
                            ).toLowerCase()
                        }"

                        data-customer-email="${
                            String(
                                order.customer?.email || ""
                            ).toLowerCase()
                        }"

                        data-customer-phone="${
                            String(
                                order.customer?.phone || ""
                            ).toLowerCase()
                        }"

                        data-order-status="${
                            String(
                                order.status || ""
                            )
                        }"

                        data-order-total="${
                            Number(
                                order.total || 0
                            )
                        }"

                        data-order-time="${
                            order.createdAt
                                ? order.createdAt
                                    .toMillis()
                                : 0
                        }"
                    >

                        <div class="order-top">

                            <div>

                                <h3>
                                    ${
                                        order.orderNumber ||
                                        ""
                                    }
                                </h3>

                                <p>
    ${displayCustomer.name}
</p>

                                <p class="order-date">
                                    ${orderDateText}
                                </p>

                                ${
                                    order.adminNote
                                        ? `
                                            <span
                                                class="order-note-badge"
                                            >
                                                📝 Admin Note
                                            </span>
                                        `
                                        : ""
                                }

                            </div>


                            <span
                                class="order-status ${
                                    order.status ===
                                    "Order Received"

                                        ? "status-received"

                                        : order.status ===
                                        "Preparing"

                                        ? "status-preparing"

                                        : order.status ===
                                        "Out for Delivery"

                                        ? "status-delivery"

                                        : order.status ===
                                        "Completed"

                                        ? "status-completed"

                                        : order.status ===
                                        "Cancelled"

                                        ? "status-cancelled"

                                        : ""
                                }"
                            >
                                ${
                                    order.status ||
                                    ""
                                }
                            </span>

                        </div>


                        <div class="admin-order-details">

                            <p>
    <strong>
        Phone:
    </strong>

    ${displayCustomer.phone}
</p>

                            <p>
    <strong>
        Email:
    </strong>

    ${displayCustomer.email}
</p>

<p>
    <strong>
        Address:
    </strong>

    ${displayCustomer.address},
    ${displayCustomer.city},
    ${displayCustomer.postcode}
</p>

                            <p>
                                <strong>
                                    Delivery:
                                </strong>

                                ${
                                    order.deliveryMethod ===
                                    "collection"

                                        ? "Collection"

                                        : "Standard Delivery"
                                }
                            </p>

                            <p>
                                <strong>
                                    Payment:
                                </strong>

                                ${
                                    order.paymentMethod ===
                                    "cash"

                                        ? "Cash on Delivery"

                                        : "Card Payment"
                                }
                            </p>

                            <p>
                                <strong>
                                    Total:
                                </strong>

                                £${Number(
                                    order.total || 0
                                ).toFixed(2)}
                            </p>

                        </div>


                        <div class="admin-items">

                            <h4>
                                Items
                            </h4>

                            ${itemsHTML}

                        </div>


                        <div class="order-actions">

                            <button
                                type="button"
                                class="view-order-button"
                                onclick="viewOrderDetails(
                                    '${document.id}'
                                )"
                            >
                                View Order
                            </button>


                            ${
                                order.status ===
                                "Cancelled"

                                    ? `
                                        <button
                                            class="cancel-order-button"
                                            disabled
                                        >
                                            Cancelled ✓
                                        </button>
                                    `

                                    : `
                                        <button
                                            onclick="updateOrderStatus(
                                                '${document.id}',
                                                'Preparing'
                                            )"
                                            ${
                                                order.status !==
                                                "Order Received"

                                                    ? "disabled"

                                                    : ""
                                            }
                                        >
                                            ${
                                                order.status ===
                                                    "Preparing" ||

                                                order.status ===
                                                    "Out for Delivery" ||

                                                order.status ===
                                                    "Completed" ||

                                                order.stockDeducted ===
                                                    true

                                                    ? "Preparing ✓"

                                                    : "Preparing"
                                            }
                                        </button>


                                        <button
                                            onclick="updateOrderStatus(
                                                '${document.id}',
                                                'Out for Delivery'
                                            )"
                                            ${
                                                order.status !==
                                                "Preparing"

                                                    ? "disabled"

                                                    : ""
                                            }
                                        >
                                            ${
                                                order.status ===
                                                    "Out for Delivery" ||

                                                order.status ===
                                                    "Completed"

                                                    ? "Out for Delivery ✓"

                                                    : "Out for Delivery"
                                            }
                                        </button>


                                        <button
                                            onclick="updateOrderStatus(
                                                '${document.id}',
                                                'Completed'
                                            )"
                                            ${
                                                order.status !==
                                                "Out for Delivery"

                                                    ? "disabled"

                                                    : ""
                                            }
                                        >
                                            ${
                                                order.status ===
                                                "Completed"

                                                    ? "Completed ✓"

                                                    : "Completed"
                                            }
                                        </button>


                                        ${
                                            order.status !==
                                            "Completed"

                                                ? `
                                                    <button
                                                        class="cancel-order-button"
                                                        onclick="cancelOrder(
                                                            '${document.id}'
                                                        )"
                                                    >
                                                        Cancel Order
                                                    </button>
                                                `

                                                : ""
                                        }
                                    `
                            }

                        </div>

                    </div>
                `;

            }
        );


        /* =========================
           SORT + FILTER ORDERS
        ========================= */

        sortOrders();

        applyOrderFilters();


        /* =========================
           ORDER COUNTERS
        ========================= */

        if (newOrdersElement) {

            newOrdersElement.textContent =
                newCount;

        }

        if (preparingOrdersElement) {

            preparingOrdersElement.textContent =
                preparingCount;

        }

        if (deliveryOrdersElement) {

            deliveryOrdersElement.textContent =
                outForDeliveryCount;

        }

        if (completedOrdersElement) {

            completedOrdersElement.textContent =
                completedCount;

        }

        if (cancelledOrdersElement) {

            cancelledOrdersElement.textContent =
                cancelledCount;

        }

        const cancellationRate =
    snapshot.size > 0
        ? (
            cancelledCount /
            snapshot.size
        ) * 100
        : 0;

        const orderCompletionRate =
    snapshot.size > 0
        ? (
            completedCount /
            snapshot.size
        ) * 100
        : 0;

if (orderCompletionRateElement) {

    orderCompletionRateElement.textContent =
        orderCompletionRate.toFixed(1) +
        "%";

}
const nonCancelledOrdersCount =
    snapshot.size -
    cancelledCount;

const averageRevenuePerOrder =
    nonCancelledOrdersCount > 0
        ? totalNonCancelledOrderValue /
            nonCancelledOrdersCount
        : 0;

if (averageRevenuePerOrderElement) {

    averageRevenuePerOrderElement.textContent =
        averageRevenuePerOrder.toLocaleString(
            "en-GB",
            {
                style: "currency",
                currency: "GBP"
            }
        );

}
const activeOrdersCount =
    newCount +
    preparingCount +
    outForDeliveryCount;

const activeOrderRate =
    snapshot.size > 0
        ? (
            activeOrdersCount /
            snapshot.size
        ) * 100
        : 0;

if (activeOrderRateElement) {

    activeOrderRateElement.textContent =
        activeOrderRate.toFixed(1) +
        "%";

}

if (cancellationRateElement) {

    cancellationRateElement.textContent =
        cancellationRate.toFixed(1) +
        "%";

}


        /* =========================
           TOTAL SALES
        ========================= */

        if (totalSalesElement) {

            totalSalesElement.textContent =
                totalSales.toLocaleString(
                    "en-GB",
                    {
                        style:
                            "currency",
                        currency:
                            "GBP"
                    }
                );

        }


        /* =========================
           PENDING REVENUE
        ========================= */

        if (pendingRevenueElement) {

            pendingRevenueElement.textContent =
                pendingRevenue.toLocaleString(
                    "en-GB",
                    {
                        style:
                            "currency",
                        currency:
                            "GBP"
                    }
                );

        }


        /* =========================
           TODAY SALES
        ========================= */

        if (todaySalesElement) {

            todaySalesElement.textContent =
                todaySales.toLocaleString(
                    "en-GB",
                    {
                        style:
                            "currency",
                        currency:
                            "GBP"
                    }
                );

        }


        /* =========================
           WEEK SALES
        ========================= */

        if (weekSalesElement) {

            weekSalesElement.textContent =
                weekSales.toLocaleString(
                    "en-GB",
                    {
                        style:
                            "currency",
                        currency:
                            "GBP"
                    }
                );

        }


        /* =========================
           MONTH SALES
        ========================= */

        if (monthSalesElement) {

            monthSalesElement.textContent =
                monthSales.toLocaleString(
                    "en-GB",
                    {
                        style:
                            "currency",
                        currency:
                            "GBP"
                    }
                );

        }


        /* =========================
           AVERAGE ORDER VALUE
        ========================= */

        const averageOrderValue =
            completedCount > 0
                ? totalSales /
                    completedCount
                : 0;

        if (averageOrderValueElement) {

            averageOrderValueElement.textContent =
                averageOrderValue.toLocaleString(
                    "en-GB",
                    {
                        style:
                            "currency",
                        currency:
                            "GBP"
                    }
                );

        }


        /* =========================
           DELIVERY REVENUE
        ========================= */

        if (deliveryRevenueElement) {

            deliveryRevenueElement.textContent =
                deliveryRevenue.toLocaleString(
                    "en-GB",
                    {
                        style:
                            "currency",
                        currency:
                            "GBP"
                    }
                );

        }


        /* =========================
           COMPLETED REVENUE %
        ========================= */

        const completedRevenuePercent =
            totalNonCancelledOrderValue > 0

                ? (
                    totalSales /
                    totalNonCancelledOrderValue
                ) * 100

                : 0;

        if (
            completedRevenuePercentElement
        ) {

            completedRevenuePercentElement
                .textContent =
                    completedRevenuePercent
                        .toFixed(1) +
                    "%";

        }


        /* =========================
           UNITS SOLD
        ========================= */

        if (unitsSoldElement) {

            unitsSoldElement.textContent =
                totalUnitsSold;

        }

        /* =========================
   AVERAGE BASKET SIZE
========================= */

const averageBasketSize =
    completedOrdersCountForBasket > 0
        ? totalUnitsSold /
            completedOrdersCountForBasket
        : 0;

if (averageBasketSizeElement) {

    averageBasketSizeElement.textContent =
        averageBasketSize.toFixed(2);

}


        /* =========================
           UNIQUE CUSTOMERS
        ========================= */

        if (uniqueCustomersElement) {

            uniqueCustomersElement.textContent =
                uniqueCustomers.size;

        }

        /* =========================
   REVENUE PER CUSTOMER
========================= */

const revenuePerCustomer =
    uniqueCustomers.size > 0
        ? totalNonCancelledOrderValue /
            uniqueCustomers.size
        : 0;

    

if (revenuePerCustomerElement) {

    revenuePerCustomerElement.textContent =
        revenuePerCustomer.toLocaleString(
            "en-GB",
            {
                style: "currency",
                currency: "GBP"
            }
        );

}
        /* =========================
   PAYMENT BREAKDOWN
========================= */

if (cardOrdersElement) {

    cardOrdersElement.textContent =
        cardOrdersCount;

}

if (cashOrdersElement) {

    cashOrdersElement.textContent =
        cashOrdersCount;

}

/* =========================
   DELIVERY METHOD BREAKDOWN
========================= */

if (standardDeliveryOrdersElement) {

    standardDeliveryOrdersElement.textContent =
        standardDeliveryOrdersCount;

}

if (collectionOrdersElement) {

    collectionOrdersElement.textContent =
        collectionOrdersCount;

}


        /* =========================
           MOST POPULAR PRODUCT
        ========================= */

        let mostPopularProduct =
            "-";

        let highestUnitsSold =
            0;

        Object.entries(
            productSales
        ).forEach(
            function(
                [productName, quantity]
            ) {

                if (
                    quantity >
                    highestUnitsSold
                ) {

                    highestUnitsSold =
                        quantity;

                    mostPopularProduct =
                        productName;

                }

            }
        );

        if (mostPopularProductElement) {

            mostPopularProductElement
                .textContent =
                    mostPopularProduct ===
                    "-"

                        ? "-"

                        : `${mostPopularProduct} (${highestUnitsSold} units sold)`;

        }


        /* =========================
           TOP 5 PRODUCTS
        ========================= */

        const topFiveProducts =
            Object.entries(
                productSales
            )
                .sort(
                    function(a, b) {

                        return (
                            b[1] -
                            a[1]
                        );

                    }
                )
                .slice(
                    0,
                    5
                );

        if (topFiveProductsElement) {

            if (
                topFiveProducts.length ===
                0
            ) {

                topFiveProductsElement
                    .innerHTML =
                        "<p>No sales yet.</p>";

            } else {

                topFiveProductsElement
                    .innerHTML =
                        topFiveProducts
                            .map(
                                function(
                                    [
                                        productName,
                                        quantity
                                    ],
                                    index
                                ) {

                                    return `
                                        <div
                                            class="top-product-item"
                                        >

                                            <span
                                                class="top-product-position"
                                            >
                                                ${index + 1}
                                            </span>

                                            <span
                                                class="top-product-name"
                                            >
                                                ${getDisplayProductName(productName)}
                                            </span>

                                            <strong
                                                class="top-product-quantity"
                                            >
                                                ${quantity} sold
                                            </strong>

                                        </div>
                                    `;

                                }
                            )
                            .join("");

            }

        }
        /* =========================
   REPEAT CUSTOMERS
========================= */

repeatCustomersCount =
    Object.values(customerStats)
        .filter(function(stats) {

            return stats.orders >= 2;

        })
        .length;

        const repeatCustomerRate =
    uniqueCustomers.size > 0
        ? (
            repeatCustomersCount /
            uniqueCustomers.size
        ) * 100
        : 0;
        const customerValueScore =
    revenuePerCustomer *
    (
        repeatCustomerRate /
        100
    );
    if (customerValueScoreElement) {

    customerValueScoreElement.textContent =
        customerValueScore.toLocaleString(
            "en-GB",
            {
                style: "currency",
                currency: "GBP"
            }
        );

}

if (repeatCustomersElement) {

    repeatCustomersElement.textContent =
        repeatCustomersCount;

}
if (repeatCustomerRateElement) {

    repeatCustomerRateElement.textContent =
        repeatCustomerRate.toFixed(1) +
        "%";

}
        /* =========================
   TOP CUSTOMERS
========================= */

const topCustomers =
    Object.entries(
        customerStats
    )
        .sort(
            function(a, b) {

                return (
                    b[1].spent -
                    a[1].spent
                );

            }
        )
        .slice(
            0,
            5
        );

if (topCustomersElement) {

    if (
        topCustomers.length ===
        0
    ) {

        topCustomersElement.innerHTML =
            "<p>No customer data yet.</p>";

    } else {

        topCustomersElement.innerHTML =
            topCustomers
                .map(
                    function(
                        [email, stats],
                        index
                    ) {

                        return `
                            <div class="top-customer-item">

                                <span class="top-customer-position">
                                    ${index + 1}
                                </span>

                                <span class="top-customer-email">
    ${
        email === "demo@example.com"
            ? "demo@example.com"
            : `sample.customer${index + 1}@example.com`
    }
</span>

                                <span class="top-customer-orders">
                                    ${stats.orders}
                                    ${
                                        stats.orders === 1
                                            ? "order"
                                            : "orders"
                                    }
                                </span>

                                <strong class="top-customer-spent">
                                    £${stats.spent.toFixed(2)}
                                </strong>

                            </div>
                        `;

                    }
                )
                .join("");

    }

}


    } catch (error) {

        console.error(
            "Error loading orders:",
            error
        );

        ordersList.innerHTML =
            "<p>Unable to load orders.</p>";

    }

}


/* =========================
   ORDER FILTER FUNCTION
========================= */

function applyOrderFilters() {

    const searchText =
        adminOrderSearch
            ? adminOrderSearch.value
                .toLowerCase()
                .trim()
            : "";

    const selectedStatus =
        adminOrderStatusFilter
            ? adminOrderStatusFilter.value
            : "all";
const selectedDateFilter =
    adminOrderDateFilter
        ? adminOrderDateFilter.value
        : "all";
    const orderCards =
        document.querySelectorAll(
            ".admin-order"
        );
        let visibleOrderCount = 0;

    orderCards.forEach(
        function(card) {

            const orderNumber =
                card.dataset.orderNumber || "";

            const customerName =
                card.dataset.customerName || "";

            const customerEmail =
                card.dataset.customerEmail || "";

            const customerPhone =
                card.dataset.customerPhone || "";

            const orderStatus =
                card.dataset.orderStatus || "";
                const orderTime =
    Number(
        card.dataset.orderTime || 0
    );

            const matchesSearch =
                orderNumber.includes(searchText) ||
                customerName.includes(searchText) ||
                customerEmail.includes(searchText) ||
                customerPhone.includes(searchText);

            const matchesStatus =
                selectedStatus === "all" ||
                orderStatus === selectedStatus;
                let matchesDate = true;

if (
    selectedDateFilter !== "all" &&
    orderTime > 0
) {

    const orderDate =
        new Date(orderTime);

    const today =
        new Date();

    if (
        selectedDateFilter ===
        "today"
    ) {

        matchesDate =
            orderDate.getDate() ===
                today.getDate() &&
            orderDate.getMonth() ===
                today.getMonth() &&
            orderDate.getFullYear() ===
                today.getFullYear();

    }

    if (
        selectedDateFilter ===
        "week"
    ) {

        const startOfWeek =
            new Date(today);

        const day =
            startOfWeek.getDay();

        const difference =
            day === 0
                ? -6
                : 1 - day;

        startOfWeek.setDate(
            startOfWeek.getDate() +
            difference
        );

        startOfWeek.setHours(
            0,
            0,
            0,
            0
        );

        const endOfWeek =
            new Date(startOfWeek);

        endOfWeek.setDate(
            endOfWeek.getDate() +
            7
        );

        matchesDate =
            orderDate >=
                startOfWeek &&
            orderDate <
                endOfWeek;

    }

    if (
        selectedDateFilter ===
        "month"
    ) {

        matchesDate =
            orderDate.getMonth() ===
                today.getMonth() &&
            orderDate.getFullYear() ===
                today.getFullYear();

    }

}

            if (
    matchesSearch &&
    matchesStatus &&
    matchesDate
) {
    card.style.display = "";
    visibleOrderCount++;
} else {
    card.style.display = "none";
}

        }
    );
const orderResultsCount =
    document.getElementById(
        "order-results-count"
    );

if (orderResultsCount) {

    orderResultsCount.textContent =
        visibleOrderCount === 1
            ? "Showing 1 order"
            : `Showing ${visibleOrderCount} orders`;
}
const noMatchingOrders =
    document.getElementById(
        "no-matching-orders"
    );

if (noMatchingOrders) {

    noMatchingOrders.style.display =
        visibleOrderCount === 0
            ? "block"
            : "none";
}
}
/* =========================
   VIEW ORDER DETAILS
========================= */

window.viewOrderDetails =
async function(orderId) {

    try {

        const orderRef =
            doc(
                db,
                "orders",
                orderId
            );

        const orderSnapshot =
            await getDoc(
                orderRef
            );

        if (!orderSnapshot.exists()) {

            alert(
                "Order could not be found."
            );

            return;
        }

        const order =
            orderSnapshot.data();
            const displayCustomer =
    getDisplayCustomer(
        order.customer
    );


        const modal =
            document.getElementById(
                "order-details-modal"
            );

        const body =
            document.getElementById(
                "order-details-body"
            );


        if (!modal || !body) {
            return;
        }


        const orderDate =
            order.createdAt
                ? order.createdAt
                    .toDate()
                    .toLocaleString(
                        "en-GB"
                    )
                : "Date unavailable";


        const deliveryMethodText =
            order.deliveryMethod ===
            "collection"
                ? "Collection"
                : "Standard Delivery";


        const paymentMethodText =
            order.paymentMethod ===
            "cash"
                ? "Cash on Delivery"
                : "Card Payment";
                const totalItemQuantity =
    (order.items || []).reduce(
        function(total, item) {

            return total +
                Number(
                    item.quantity || 0
                );

        },
        0
    );


        const statusClass =
            (order.status || "")
                .toLowerCase()
                .replaceAll(
                    " ",
                    "-"
                );


        const itemsHTML =
            (order.items || [])
                .map(
                    function(item) {

                        return `
                            <div class="receipt-item">

                                <div class="receipt-item-info">

                                    <strong>
                                        ${getDisplayProductName(item.name || "")}
                                    </strong>

                                    <small>
                                        ${Number(
                                            item.quantity || 0
                                        )}
                                        ×
                                        £${Number(
                                            item.price || 0
                                        ).toFixed(2)}
                                    </small>

                                </div>

                                <strong
                                    class="receipt-item-total"
                                >
                                    £${(
                                        Number(
                                            item.price || 0
                                        ) *
                                        Number(
                                            item.quantity || 0
                                        )
                                    ).toFixed(2)}
                                </strong>

                            </div>
                        `;

                    }
                )
                .join("");


        body.innerHTML = `

            <div class="receipt-order">


                <div class="receipt-header">

                    <div>

                        <p class="receipt-label">
                            Order Number
                        </p>

                        <h2>
    ${order.orderNumber || ""}
</h2>

<button
    type="button"
    class="copy-order-number"
    onclick="copyOrderNumber(
        '${order.orderNumber || ""}'
    )"
>
    Copy Order Number
</button>

                    </div>


                    <div>

                        <p class="receipt-label">
                            Date
                        </p>

                        <strong>
                            ${orderDate}
                        </strong>

                    </div>

                </div>


                <div class="receipt-status-row">

                    <span class="receipt-label">
                        Status
                    </span>

                    <span
                        class="receipt-status ${statusClass}"
                    >
                        ${order.status || ""}
                    </span>

                </div>


                <hr>


                <h3>
                    Customer
                </h3>


                <div class="receipt-customer">

                    <p>

                        <span>
                            Name
                        </span>

                        <strong>
                            ${displayCustomer.name}
                        </strong>

                    </p>


                    <p>

                        <span>
                            Phone
                        </span>

                        <strong>
                            ${displayCustomer.phone}
                        </strong>

                    </p>


            <p>
    <strong>
        Email:
    </strong>

    ${displayCustomer.email}
</p>


                    <p>

                        <span>
                            Address
                        </span>

                        <strong>
                            ${displayCustomer.address},
${displayCustomer.city},
${displayCustomer.postcode}
                        </strong>

                    </p>

                </div>


                <hr>


                <div class="receipt-items-heading">

    <h3>
        Items
    </h3>

    <span>
        ${totalItemQuantity}
        ${
            totalItemQuantity === 1
                ? "item"
                : "items"
        }
    </span>

</div>


                <div class="receipt-items">

                    ${itemsHTML}

                </div>


                <hr>

<h3 class="receipt-summary-title">
    Order Summary
</h3>
                <div class="receipt-summary">

                    <p>

                        <strong>
                            Subtotal:
                        </strong>

                        <span>
                            £${Number(
                                order.subtotal || 0
                            ).toFixed(2)}
                        </span>

                    </p>


                    <p>

                        <strong>
                            Delivery:
                        </strong>

                        <span>
                            £${Number(
                                order.delivery || 0
                            ).toFixed(2)}
                        </span>

                    </p>


                    <p>

                        <strong>
                            Total:
                        </strong>

                        <span>
                            £${Number(
                                order.total || 0
                            ).toFixed(2)}
                        </span>

                    </p>

                </div>


                <hr>


             <div class="receipt-methods">

    <div class="receipt-method-card">

        <span class="receipt-method-icon">
            🚚
        </span>

        <div>

            <span class="receipt-label">
                Delivery Method
            </span>

            <strong>
                ${deliveryMethodText}
            </strong>

        </div>

    </div>


    <div class="receipt-method-card">

        <span class="receipt-method-icon">
            💳
        </span>

        <div>

            <span class="receipt-label">
                Payment Method
            </span>

            <strong>
                ${paymentMethodText}
            </strong>

        </div>

    </div>

</div>

<div class="admin-order-note-box">

    <h3>
        Admin Note
    </h3>

    <textarea
        id="admin-order-note"
        placeholder="Add a private note for this order..."
    >${order.adminNote || ""}</textarea>

    <button
        type="button"
        onclick="saveOrderNote(
            '${orderId}'
        )"
    >
        Save Note
    </button>

    <p
        id="admin-order-note-message"
        class="admin-order-note-message"
    ></p>

</div>
<div class="receipt-footer">

    <p>
        Thank you for shopping with
        <strong>
            Spice World Supermarket
        </strong>
    </p>

    <small>
        Please keep your order number
        for any order enquiries.
    </small>

</div>


</div>
`;


        modal.style.display =
            "flex";


    } catch (error) {

        console.error(
            "View order error:",
            error
        );

        alert(
            "Could not load order details."
        );

    }

};
/* =========================
   COPY ORDER NUMBER
========================= */

window.copyOrderNumber =
async function(orderNumber) {

    try {

        await navigator.clipboard.writeText(
            orderNumber
        );

        alert(
            "Order number copied: " +
            orderNumber
        );

    } catch (error) {

        console.error(
            "Copy order number error:",
            error
        );

        alert(
            "Could not copy order number."
        );

    }

};
/* =========================
   SAVE ORDER NOTE
========================= */

window.saveOrderNote =
async function(orderId) {

    const noteInput =
        document.getElementById(
            "admin-order-note"
        );

    const message =
        document.getElementById(
            "admin-order-note-message"
        );

    if (!noteInput) {
        return;
    }

    try {

        if (message) {
            message.textContent =
                "Saving...";
        }

        await updateDoc(
            doc(
                db,
                "orders",
                orderId
            ),
            {
                adminNote:
                    noteInput.value.trim()
            }
        );

        if (message) {
            message.textContent =
                "Note saved ✓";
        }

    } catch (error) {

        console.error(
            "Save order note error:",
            error
        );

        if (message) {
            message.textContent =
                "Could not save note.";
        }

    }

};
/* =========================
   SORT ORDERS
========================= */

function sortOrders() {

    if (!ordersList) {
        return;
    }

    const sortValue =
        adminOrderSort
            ? adminOrderSort.value
            : "newest";

    const orderCards =
        Array.from(
            document.querySelectorAll(
                ".admin-order"
            )
        );

    orderCards.sort(
        function(a, b) {

            const totalA =
                Number(
                    a.dataset.orderTotal || 0
                );

            const totalB =
                Number(
                    b.dataset.orderTotal || 0
                );

            const timeA =
                Number(
                    a.dataset.orderTime || 0
                );

            const timeB =
                Number(
                    b.dataset.orderTime || 0
                );

            if (
                sortValue ===
                "oldest"
            ) {
                return timeA - timeB;
            }

            if (
                sortValue ===
                "total-high"
            ) {
                return totalB - totalA;
            }

            if (
                sortValue ===
                "total-low"
            ) {
                return totalA - totalB;
            }

            return timeB - timeA;

        }
    );

    orderCards.forEach(
        function(card) {

            ordersList.appendChild(
                card
            );

        }
    );

}
/* =========================
   LOAD PRODUCTS
========================= */

async function loadAdminProducts() {

    const productsList =
        document.getElementById(
            "admin-products-list"
        );

    if (!productsList) {
        return;
    }

    productsList.innerHTML =
        "<p>Loading products...</p>";

    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "products"
                )
            );


        /* DASHBOARD ELEMENTS */

        const totalProductsElement =
            document.getElementById(
                "total-products"
            );
            const activeProductsElement =
    document.getElementById(
        "active-products"
    );

const inactiveProductsElement =
    document.getElementById(
        "inactive-products"
    );

        const lowStockElement =
            document.getElementById(
                "low-stock-products"
            );

        const outOfStockElement =
            document.getElementById(
                "out-of-stock-products"
            );

        const inventoryValueElement =
            document.getElementById(
                "inventory-value"
            );


        /* IF THERE ARE NO PRODUCTS */

        if (snapshot.empty) {

    productsList.innerHTML =
        "<p>No products yet.</p>";

    if (totalProductsElement) {
        totalProductsElement.textContent =
            "0";
    }

    if (activeProductsElement) {
        activeProductsElement.textContent =
            "0";
    }

    if (inactiveProductsElement) {
        inactiveProductsElement.textContent =
            "0";
    }

    if (lowStockElement) {
        lowStockElement.textContent =
            "0";
    }

    if (outOfStockElement) {
        outOfStockElement.textContent =
            "0";
    }

    if (inventoryValueElement) {
        inventoryValueElement.textContent =
            "£0.00";
    }

    return;
}


        productsList.innerHTML = "";


        /* PRODUCT COUNTERS */

        let totalProductsCount = 0;
let activeProductsCount = 0;
let inactiveProductsCount = 0;
let lowStockCount = 0;
let outOfStockCount = 0;
let inventoryValue = 0;


        snapshot.forEach(
            function(document) {

                const product =
                    document.data();


                /* TOTAL PRODUCTS */

                totalProductsCount++;
                if (product.active) {

    activeProductsCount++;

} else {

    inactiveProductsCount++;

}


                const stock =
                    Number(
                        product.stock || 0
                    );


                const price =
                    Number(
                        product.price || 0
                    );


                /* INVENTORY VALUE */

                inventoryValue +=
                    price * stock;


                /* STOCK COUNTERS */

                if (
    stock > 0 &&
    stock <= 5
) {
    lowStockCount++;
}

                if (stock === 0) {
                    outOfStockCount++;
                }


                const statusButtonText =
                    product.active
                        ? "Deactivate"
                        : "Activate";


                const safeName =
                    String(
                        product.name || ""
                    )
                        .replace(
                            /\\/g,
                            "\\\\"
                        )
                        .replace(
                            /'/g,
                            "\\'"
                        )
                        .replace(
                            /"/g,
                            "&quot;"
                        );


                const safeImage =
                    String(
                        product.image || ""
                    )
                        .replace(
                            /\\/g,
                            "\\\\"
                        )
                        .replace(
                            /'/g,
                            "\\'"
                        )
                        .replace(
                            /"/g,
                            "&quot;"
                        );


                const dataName =
                    String(
                        product.name || ""
                    )
                        .toLowerCase()
                        .replace(
                            /"/g,
                            "&quot;"
                        );


                const dataCategory =
                    String(
                        product.category || ""
                    )
                        .toLowerCase()
                        .trim()
                        .replace(
                            /"/g,
                            "&quot;"
                        );


                productsList.innerHTML += `
                    <div
                        class="admin-product-card"
                        data-stock="${stock}"
                        data-price="${price}"
                        data-name="${dataName}"
                        data-category="${dataCategory}"
                        data-status="${
                            product.active
                                ? "active"
                                : "inactive"
                        }"
                    >

                        <div class="admin-product-name">

                            <div class="admin-product-preview">

                                ${
                                    product.image

                                        ? `
                                            <img
                                                src="${product.image}"
                                                alt="${
                                                    product.name ||
                                                    "Product"
                                                }"
                                                class="admin-product-image"
                                            >
                                        `

                                        : `
                                            <div
                                                class="admin-product-no-image"
                                            >
                                                No image
                                            </div>
                                        `
                                }

                            </div>


                            <h3>
                                ${
                                    product.name ||
                                    ""
                                }
                            </h3>

                        </div>


                        <p>

                            <strong>
                                Price:
                            </strong>

                            <br>

                            £${price.toFixed(2)}

                        </p>


                        <p>

                            <strong>
                                Stock:
                            </strong>

                            <br>

                            ${stock}

                            ${
                                stock === 0

                                    ? `
                                        <span
                                            class="stock-badge stock-out"
                                        >
                                            Out of Stock
                                        </span>
                                    `

                                    : stock <= 5

                                    ? `
                                        <span
                                            class="stock-badge stock-low"
                                        >
                                            Low Stock
                                        </span>
                                    `

                                    : `
                                        <span
                                            class="stock-badge stock-good"
                                        >
                                            In Stock
                                        </span>
                                    `
                            }

                        </p>


                        <p>

                            <strong>
                                Category:
                            </strong>

                            <br>

                            ${
                                product.category ||
                                ""
                            }

                        </p>


                        <p>

                            <strong>
                                Status:
                            </strong>

                            <br>

                            ${
                                product.active
                                    ? "Active"
                                    : "Inactive"
                            }

                        </p>


                        <div class="product-actions">

                            <button
                                class="edit-product-button"
                               onclick="editProduct(
    '${document.id}',
    '${safeName}',
    ${Number(product.price || 0)},
    ${stock},
    '${safeImage}',
    '${product.category || ""}'
)"
                            >
                                Edit
                            </button>


                            <button
                                class="status-product-button"
                                onclick="toggleProductStatus(
                                    '${document.id}',
                                    ${Boolean(
                                        product.active
                                    )}
                                )"
                            >
                                ${statusButtonText}
                            </button>


                            <button
                                class="delete-product-button"
                                onclick="deleteProduct(
                                    '${document.id}'
                                )"
                            >
                                Delete
                            </button>

                        </div>

                    </div>
                `;

            }
        );


        /* UPDATE TOTAL PRODUCTS */

        if (totalProductsElement) {

            totalProductsElement.textContent =
                totalProductsCount;

        }


        /* UPDATE LOW STOCK */

        if (lowStockElement) {

            lowStockElement.textContent =
                lowStockCount;

        }


        /* UPDATE OUT OF STOCK */

        if (outOfStockElement) {

            outOfStockElement.textContent =
                outOfStockCount;

        }


        /* UPDATE INVENTORY VALUE */

        if (inventoryValueElement) {

            inventoryValueElement.textContent =
                inventoryValue.toLocaleString(
                    "en-GB",
                    {
                        style: "currency",
                        currency: "GBP"
                    }
                );

        }
        /* UPDATE ACTIVE PRODUCTS */

if (activeProductsElement) {

    activeProductsElement.textContent =
        activeProductsCount;

}


/* UPDATE INACTIVE PRODUCTS */

if (inactiveProductsElement) {

    inactiveProductsElement.textContent =
        inactiveProductsCount;

}


        sortProducts();

        applyProductFilters();


    } catch (error) {

        console.error(
            "Error loading products:",
            error
        );

        productsList.innerHTML =
            "<p>Could not load products.</p>";

    }

}


/* =========================
   LOAD ENQUIRIES
========================= */

async function loadEnquiries() {

    if (!enquiriesList) {
        return;
    }

    enquiriesList.innerHTML =
        "<p>Loading enquiries...</p>";

    try {

        const enquiriesQuery =
            query(
                collection(
                    db,
                    "enquiries"
                ),
                orderBy(
                    "createdAt",
                    "desc"
                )
            );

        const snapshot =
            await getDocs(
                enquiriesQuery
            );

        if (snapshot.empty) {

            enquiriesList.innerHTML =
                "<p>No customer enquiries yet.</p>";

            return;
        }

        enquiriesList.innerHTML = "";

        snapshot.forEach(
            function(document) {

                const enquiry =
                    document.data();

                enquiriesList.innerHTML += `
                    <div class="enquiry-card">

                        <div class="enquiry-top">

                            <div>

                                <h3>
                                    ${
                                        enquiry.name ||
                                        ""
                                    }
                                </h3>

                                <p>
                                    ${
                                        enquiry.email ||
                                        ""
                                    }
                                </p>

                            </div>

                            <span class="enquiry-status">
                                ${
                                    enquiry.status ||
                                    "New"
                                }
                            </span>

                        </div>


                        <div class="enquiry-details">

                            <p>
                                <strong>
                                    Phone:
                                </strong>

                                ${
                                    enquiry.phone ||
                                    "Not provided"
                                }
                            </p>

                            <p>
                                <strong>
                                    Subject:
                                </strong>

                                ${
                                    enquiry.subject ||
                                    ""
                                }
                            </p>

                            <p>
                                <strong>
                                    Message:
                                </strong>
                            </p>

                            <p>
                                ${
                                    enquiry.message ||
                                    ""
                                }
                            </p>

                        </div>


                        <div class="enquiry-actions">

                            <button
                                onclick="markEnquiryRead(
                                    '${document.id}'
                                )"
                            >
                                Mark as Read
                            </button>


                            <button
                                class="delete-enquiry-button"
                                onclick="deleteEnquiry(
                                    '${document.id}'
                                )"
                            >
                                Delete
                            </button>

                        </div>

                    </div>
                `;

            }
        );

    } catch (error) {

        console.error(
            "Error loading enquiries:",
            error
        );

        enquiriesList.innerHTML =
            "<p>Could not load enquiries.</p>";

    }

}


/* =========================
   MARK ENQUIRY READ
========================= */

window.markEnquiryRead =
async function(enquiryId) {

    try {

        await updateDoc(
            doc(
                db,
                "enquiries",
                enquiryId
            ),
            {
                status:
                    "Read"
            }
        );

        await loadEnquiries();

    } catch (error) {

        console.error(
            "Mark enquiry read error:",
            error
        );

    }

};


/* =========================
   DELETE ENQUIRY
========================= */

window.deleteEnquiry =
async function(enquiryId) {

    try {

        await deleteDoc(
            doc(
                db,
                "enquiries",
                enquiryId
            )
        );

        await loadEnquiries();

    } catch (error) {

        console.error(
            "Delete enquiry error:",
            error
        );

    }

};


/* =========================
   OPEN EDIT PRODUCT FORM
========================= */

window.editProduct =
function(
    productId,
    currentName,
    currentPrice,
    currentStock,
    currentImage = "",
    currentCategory = ""
) {

    const editBox =
        document.getElementById(
            "edit-product-box"
        );

    if (!editBox) {
        return;
    }

    const idInput =
        document.getElementById(
            "edit-product-id"
        );

    const nameInput =
        document.getElementById(
            "edit-product-name"
        );

    const priceInput =
        document.getElementById(
            "edit-product-price"
        );

    const stockInput =
        document.getElementById(
            "edit-product-stock"
        );

    const imageInput =
        document.getElementById(
            "edit-product-image"
        );

    const message =
        document.getElementById(
            "edit-product-message"
        );

    if (idInput) {
        idInput.value =
            productId;
    }

    if (nameInput) {
        nameInput.value =
            currentName;
    }

    if (priceInput) {
        priceInput.value =
            currentPrice;
    }

    if (stockInput) {
        stockInput.value =
            currentStock;
    }

    if (imageInput) {
        imageInput.value =
            currentImage;
    }
    document.getElementById(
    "edit-product-category"
).value =
    currentCategory;

    if (message) {
        message.textContent =
            "";
    }

    editBox.style.display =
        "block";

    editBox.scrollIntoView({
        behavior:
            "smooth",
        block:
            "center"
    });

};


/* =========================
   SAVE EDITED PRODUCT
========================= */

const saveEditProductButton =
    document.getElementById(
        "save-edit-product"
    );

if (saveEditProductButton) {

    saveEditProductButton.addEventListener(
        "click",
        async function() {

            const productId =
                document
                    .getElementById(
                        "edit-product-id"
                    )
                    .value;

            const name =
                document
                    .getElementById(
                        "edit-product-name"
                    )
                    .value
                    .trim();

            const price =
                Number(
                    document
                        .getElementById(
                            "edit-product-price"
                        )
                        .value
                );

            const stock =
                Number(
                    document
                        .getElementById(
                            "edit-product-stock"
                        )
                        .value
                );

            const image =
                document
                    .getElementById(
                        "edit-product-image"
                    )
                    .value
                    .trim();
                    const category =
    document
        .getElementById(
            "edit-product-category"
        )
        .value;

            const message =
                document.getElementById(
                    "edit-product-message"
                );

            if (
    productId === "" ||
    name === "" ||
    category === "" ||
    isNaN(price) ||
    isNaN(stock) ||
    price < 0 ||
    stock < 0
) {

                if (message) {
                    message.textContent =
                        "Please enter valid product details.";
                }

                return;
            }

            try {

                if (message) {
                    message.textContent =
                        "Saving...";
                }

                await updateDoc(
                    doc(
                        db,
                        "products",
                        productId
                    ),
                    {
                        name:
                            name,

                        price:
                            price,

                        stock:
                            stock,
                            category: category,

                        image:
                            image
                    }
                );

                if (message) {
                    message.textContent =
                        "Product updated successfully ✓";
                }

                await loadAdminProducts();

                setTimeout(
                    function() {

                        const editBox =
                            document.getElementById(
                                "edit-product-box"
                            );

                        if (editBox) {
                            editBox.style.display =
                                "none";
                        }

                    },
                    1000
                );

            } catch (error) {

                console.error(
                    "Product update error:",
                    error
                );

                if (message) {
                    message.textContent =
                        "Could not update product.";
                }

            }

        }
    );

}


/* =========================
   CANCEL EDIT PRODUCT
========================= */

const cancelEditProductButton =
    document.getElementById(
        "cancel-edit-product"
    );

if (cancelEditProductButton) {

    cancelEditProductButton.addEventListener(
        "click",
        function() {

            const editBox =
                document.getElementById(
                    "edit-product-box"
                );

            const message =
                document.getElementById(
                    "edit-product-message"
                );

            if (editBox) {
                editBox.style.display =
                    "none";
            }

            if (message) {
                message.textContent =
                    "";
            }

        }
    );

}


/* =========================
   ACTIVATE / DEACTIVATE
========================= */

window.toggleProductStatus =
async function(
    productId,
    currentStatus
) {

    try {

        await updateDoc(
            doc(
                db,
                "products",
                productId
            ),
            {
                active:
                    !currentStatus
            }
        );

        await loadAdminProducts();

    } catch (error) {

        console.error(
            "Product status error:",
            error
        );

    }

};


/* =========================
   DELETE PRODUCT
========================= */

window.deleteProduct =
async function(productId) {

    try {

        await deleteDoc(
            doc(
                db,
                "products",
                productId
            )
        );

        await loadAdminProducts();

    } catch (error) {

        console.error(
            "Delete product error:",
            error
        );

    }

};


/* =========================
   UPDATE ORDER STATUS
   + DEDUCT STOCK
========================= */

window.updateOrderStatus =
async function(
    orderId,
    newStatus
) {

    try {

        const orderRef =
            doc(
                db,
                "orders",
                orderId
            );

        await runTransaction(
            db,
            async function(transaction) {

                const orderSnapshot =
                    await transaction.get(
                        orderRef
                    );

                if (
                    !orderSnapshot.exists()
                ) {

                    throw new Error(
                        "Order not found."
                    );

                }

                const order =
                    orderSnapshot.data();

                if (
                    newStatus ===
                        "Preparing" &&

                    order.stockDeducted !==
                        true
                ) {

                    const productRecords =
                        [];

                    for (
                        const item
                        of order.items || []
                    ) {

                        const productRef =
                            doc(
                                db,
                                "products",
                                item.productId
                            );

                        const productSnapshot =
                            await transaction.get(
                                productRef
                            );

                        if (
                            !productSnapshot.exists()
                        ) {

                            throw new Error(
                                `${item.name} could not be found.`
                            );

                        }

                        const product =
                            productSnapshot.data();

                        const currentStock =
                            Number(
                                product.stock || 0
                            );

                        const orderedQuantity =
                            Number(
                                item.quantity || 0
                            );

                        if (
                            orderedQuantity >
                            currentStock
                        ) {

                            throw new Error(
                                `Not enough stock for ${item.name}. Current stock: ${currentStock}`
                            );

                        }

                        productRecords.push({
                            productRef:
                                productRef,

                            newStock:
                                currentStock -
                                orderedQuantity
                        });

                    }

                    productRecords.forEach(
                        function(record) {

                            transaction.update(
                                record.productRef,
                                {
                                    stock:
                                        record.newStock
                                }
                            );

                        }
                    );

                    transaction.update(
                        orderRef,
                        {
                            status:
                                "Preparing",

                            stockDeducted:
                                true,

                            stockRestored:
                                false
                        }
                    );

                } else {

                    transaction.update(
                        orderRef,
                        {
                            status:
                                newStatus
                        }
                    );

                }

            }
        );

        await loadOrders();

        await loadAdminProducts();

    } catch (error) {

        console.error(
            "Order update error:",
            error
        );

        alert(
            error.message ||
            "Could not update order."
        );

    }

};


/* =========================
   CANCEL ORDER
   + RESTORE STOCK
========================= */

window.cancelOrder =
async function(orderId) {

    try {

        const orderRef =
            doc(
                db,
                "orders",
                orderId
            );

        await runTransaction(
            db,
            async function(transaction) {

                const orderSnapshot =
                    await transaction.get(
                        orderRef
                    );

                if (
                    !orderSnapshot.exists()
                ) {

                    throw new Error(
                        "Order not found."
                    );

                }

                const order =
                    orderSnapshot.data();

                if (
                    order.status ===
                    "Completed"
                ) {

                    throw new Error(
                        "Completed orders cannot be cancelled."
                    );

                }

                if (
                    order.status ===
                    "Cancelled"
                ) {

                    return;

                }

                if (
                    order.stockDeducted ===
                        true &&

                    order.stockRestored !==
                        true
                ) {

                    const productRecords =
                        [];

                    for (
                        const item
                        of order.items || []
                    ) {

                        const productRef =
                            doc(
                                db,
                                "products",
                                item.productId
                            );

                        const productSnapshot =
                            await transaction.get(
                                productRef
                            );

                        if (
                            !productSnapshot.exists()
                        ) {

                            continue;

                        }

                        const product =
                            productSnapshot.data();

                        const currentStock =
                            Number(
                                product.stock || 0
                            );

                        const orderedQuantity =
                            Number(
                                item.quantity || 0
                            );

                        productRecords.push({
                            productRef:
                                productRef,

                            newStock:
                                currentStock +
                                orderedQuantity
                        });

                    }

                    productRecords.forEach(
                        function(record) {

                            transaction.update(
                                record.productRef,
                                {
                                    stock:
                                        record.newStock
                                }
                            );

                        }
                    );

                    transaction.update(
                        orderRef,
                        {
                            status:
                                "Cancelled",

                            stockRestored:
                                true
                        }
                    );

                } else {

                    transaction.update(
                        orderRef,
                        {
                            status:
                                "Cancelled"
                        }
                    );

                }

            }
        );

        await loadOrders();

        await loadAdminProducts();

    } catch (error) {

        console.error(
            "Cancel order error:",
            error
        );

        alert(
            error.message ||
            "Could not cancel order."
        );

    }

};


/* =========================
   SEARCH PRODUCTS
========================= */

if (adminProductSearch) {

    adminProductSearch.addEventListener(
        "input",
        applyProductFilters
    );

}


/* =========================
   CATEGORY FILTER
========================= */

if (adminCategoryFilter) {

    adminCategoryFilter.addEventListener(
        "change",
        applyProductFilters
    );

}

/* =========================
   STATUS FILTER
========================= */

if (adminStatusFilter) {

    adminStatusFilter.addEventListener(
        "change",
        applyProductFilters
    );

}
/* =========================
   PRODUCT SORT
========================= */

if (adminProductSort) {

    adminProductSort.addEventListener(
        "change",
        function() {

            sortProducts();

            applyProductFilters();

        }
    );

}


/* =========================
   LOW STOCK FILTER
========================= */

const lowStockCard =
    document.getElementById(
        "low-stock-card"
    );

if (lowStockCard) {

    lowStockCard.addEventListener(
        "click",
        function() {

            lowStockOnly = true;
            outOfStockOnly = false;

            applyProductFilters();

        }
    );

}
/* =========================
   OUT OF STOCK FILTER
========================= */

const outOfStockCard =
    document.getElementById(
        "out-of-stock-card"
    );

if (outOfStockCard) {

    outOfStockCard.addEventListener(
        "click",
        function() {

            lowStockOnly = false;
            outOfStockOnly = true;

            applyProductFilters();

        }
    );

}

/* =========================
   SHOW ALL PRODUCTS
========================= */

const showAllProductsButton =
    document.getElementById(
        "show-all-products"
    );

if (showAllProductsButton) {

    showAllProductsButton.addEventListener(
        "click",
        function() {

            lowStockOnly = false;
            outOfStockOnly = false;

            if (adminProductSearch) {
                adminProductSearch.value =
                    "";
            }

            if (adminCategoryFilter) {
                adminCategoryFilter.value =
                    "all";
            }

            if (adminStatusFilter) {
                adminStatusFilter.value =
                    "all";
            }

            if (adminProductSort) {
                adminProductSort.value =
                    "default";
            }

            sortProducts();

            applyProductFilters();

        }
    );

}

/* =========================
   ORDER SEARCH
========================= */

if (adminOrderSearch) {

    adminOrderSearch.addEventListener(
        "input",
        applyOrderFilters
    );

}


/* =========================
   ORDER STATUS FILTER
========================= */

if (adminOrderStatusFilter) {

    adminOrderStatusFilter.addEventListener(
        "change",
        applyOrderFilters
    );

}
/* =========================
   ORDER SORT
========================= */

if (adminOrderSort) {

    adminOrderSort.addEventListener(
        "change",
        function() {

            sortOrders();

            applyOrderFilters();

        }
    );

}
/* =========================
   ORDER DATE FILTER
========================= */

if (adminOrderDateFilter) {

    adminOrderDateFilter.addEventListener(
        "change",
        applyOrderFilters
    );

}
/* =========================
   SHOW ALL ORDERS
========================= */

const showAllOrdersButton =
    document.getElementById(
        "show-all-orders"
    );

if (showAllOrdersButton) {

    showAllOrdersButton.addEventListener(
        "click",
        function() {

            if (adminOrderSearch) {
                adminOrderSearch.value =
                    "";
            }

            if (adminOrderStatusFilter) {
                adminOrderStatusFilter.value =
                    "all";
            }
            if (adminOrderSort) {
    adminOrderSort.value =
        "newest";
}
if (adminOrderDateFilter) {
    adminOrderDateFilter.value =
        "all";
}

            sortOrders();
applyOrderFilters();

        }
    );

}
/* =========================
   LOGIN CHECK
========================= */

onAuthStateChanged(
    auth,
    function(user) {

        if (user) {

            loadOrders();

            loadAdminProducts();

            loadEnquiries();

        } else {

            window.location.href =
                "admin-login.html";

        }

    }
);


/* =========================
   LOGOUT
========================= */

const logoutButton =
    document.getElementById(
        "logout-button"
    );

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        async function() {

            try {

                await signOut(
                    auth
                );

                window.location.href =
                    "admin-login.html";

            } catch (error) {

                console.error(
                    "Logout error:",
                    error
                );

            }

        }
    );

}


/* =========================
   ADD PRODUCT
========================= */

const productForm =
    document.getElementById(
        "product-form"
    );

const productMessage =
    document.getElementById(
        "product-message"
    );

if (productForm) {

    productForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();

            const name =
                document
                    .getElementById(
                        "product-name"
                    )
                    .value
                    .trim();

            const price =
                Number(
                    document
                        .getElementById(
                            "product-price"
                        )
                        .value
                );

            const category =
                document
                    .getElementById(
                        "product-category"
                    )
                    .value;

            const stock =
                Number(
                    document
                        .getElementById(
                            "product-stock"
                        )
                        .value
                );

            const image =
                document
                    .getElementById(
                        "product-image"
                    )
                    .value
                    .trim();

            if (
                name === "" ||
                category === "" ||
                isNaN(price) ||
                isNaN(stock) ||
                price < 0 ||
                stock < 0
            ) {

                if (productMessage) {

                    productMessage.textContent =
                        "Please enter valid product details.";

                }

                return;
            }

            try {

                if (productMessage) {

                    productMessage.textContent =
                        "Adding product...";

                }

                await addDoc(
                    collection(
                        db,
                        "products"
                    ),
                    {
                        name:
                            name,

                        price:
                            price,

                        category:
                            category,

                        stock:
                            stock,

                        image:
                            image,

                        active:
                            true
                    }
                );

                if (productMessage) {

                    productMessage.textContent =
                        "Product added successfully ✓";

                }

                productForm.reset();

                await loadAdminProducts();

            } catch (error) {

                console.error(
                    "Add product error:",
                    error
                );

                if (productMessage) {

                    productMessage.textContent =
                        "Could not add product.";

                }

            }

        }
    );

}
/* =========================
   CLOSE ORDER DETAILS
========================= */

const closeOrderDetailsButton =
    document.getElementById(
        "close-order-details"
    );

const orderDetailsModal =
    document.getElementById(
        "order-details-modal"
    );

if (
    closeOrderDetailsButton &&
    orderDetailsModal
) {

    closeOrderDetailsButton.addEventListener(
        "click",
        function() {

            orderDetailsModal.style.display =
                "none";

        }
    );

}
document.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key === "Escape" &&
            orderDetailsModal &&
            orderDetailsModal.style.display === "flex"
        ) {

            orderDetailsModal.style.display =
                "none";

        }

    }
);
if (orderDetailsModal) {

    orderDetailsModal.addEventListener(
        "click",
        function(event) {

            if (
                event.target ===
                orderDetailsModal
            ) {

                orderDetailsModal.style.display =
                    "none";

            }

        }
    );

}
/* =========================
   PRINT ORDER RECEIPT
========================= */

const printOrderButton =
    document.getElementById(
        "print-order-button"
    );

if (printOrderButton) {

    printOrderButton.addEventListener(
        "click",
        function() {

            window.print();

        }
    );

}
/* =========================
   EXPORT ORDERS TO CSV
========================= */

const exportOrdersButton =
    document.getElementById(
        "export-orders"
    );

if (exportOrdersButton) {

    exportOrdersButton.addEventListener(
        "click",
        async function() {

            try {

                const snapshot =
                    await getDocs(
                        collection(
                            db,
                            "orders"
                        )
                    );

                if (snapshot.empty) {

                    alert(
                        "There are no orders to export."
                    );

                    return;
                }


                const rows = [];

                rows.push([
                    "Order Number",
                    "Date",
                    "Customer",
                    "Email",
                    "Phone",
                    "Address",
                    "Delivery Method",
                    "Payment Method",
                    "Status",
                    "Subtotal",
                    "Delivery",
                    "Total"
                ]);


                snapshot.forEach(
                    function(document) {

                        const order =
                            document.data();


                        const orderDate =
                            order.createdAt
                                ? order.createdAt
                                    .toDate()
                                    .toLocaleString(
                                        "en-GB"
                                    )
                                : "";


                        const address = [
                            order.customer?.address || "",
                            order.customer?.city || "",
                            order.customer?.postcode || ""
                        ]
                            .filter(Boolean)
                            .join(", ");


                        rows.push([

                            order.orderNumber || "",

                            orderDate,

                            order.customer?.name || "",

                            order.customer?.email || "",

                            order.customer?.phone || "",

                            address,

                            order.deliveryMethod ===
                            "collection"
                                ? "Collection"
                                : "Standard Delivery",

                            order.paymentMethod ===
                            "cash"
                                ? "Cash on Delivery"
                                : "Card Payment",

                            order.status || "",

                            Number(
                                order.subtotal || 0
                            ).toFixed(2),

                            Number(
                                order.delivery || 0
                            ).toFixed(2),

                            Number(
                                order.total || 0
                            ).toFixed(2)

                        ]);

                    }
                );


                const csvContent =
                    rows
                        .map(
                            function(row) {

                                return row
                                    .map(
                                        function(value) {

                                            const safeValue =
                                                String(value)
                                                    .replaceAll(
                                                        '"',
                                                        '""'
                                                    );

                                            return `"${safeValue}"`;

                                        }
                                    )
                                    .join(",");

                            }
                        )
                        .join("\n");


                const blob =
                    new Blob(
                        [csvContent],
                        {
                            type:
                                "text/csv;charset=utf-8;"
                        }
                    );


                const url =
                    URL.createObjectURL(
                        blob
                    );


                const link =
                    document.createElement(
                        "a"
                    );


                link.href = url;

                link.download =
                    "spice-world-orders.csv";


                document.body.appendChild(
                    link
                );

                link.click();

                link.remove();

                URL.revokeObjectURL(
                    url
                );


            } catch (error) {

                console.error(
                    "Export orders error:",
                    error
                );

                alert(
                    "Could not export orders."
                );

            }

        }
    );

}
