import { db } from "./firebase.js";

import {
    collection,
    addDoc,
    serverTimestamp,
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";


/* =========================
   GET CART
========================= */

const cart =
    JSON.parse(
        localStorage.getItem("cart")
    ) || [];


/* =========================
   PAGE ELEMENTS
========================= */

const checkoutItems =
    document.getElementById(
        "checkout-items"
    );

const checkoutSubtotal =
    document.getElementById(
        "checkout-subtotal"
    );

const checkoutDelivery =
    document.getElementById(
        "checkout-delivery"
    );

const checkoutTotal =
    document.getElementById(
        "checkout-total"
    );

const cartCount =
    document.getElementById(
        "cart-count"
    );


/* =========================
   DISPLAY ORDER
========================= */

function showOrder() {

    let subtotal = 0;
    let totalQuantity = 0;

    checkoutItems.innerHTML = "";


    if (cart.length === 0) {

        checkoutItems.innerHTML = `
            <p>Your basket is empty.</p>
        `;

        checkoutSubtotal.textContent =
            "£0.00";

        checkoutDelivery.textContent =
            "£0.00";

        checkoutTotal.textContent =
            "£0.00";

        cartCount.textContent =
            "0";

        return;
    }


    cart.forEach(function(item) {

        const price =
            Number(item.price);

        const quantity =
            Number(item.quantity);

        const itemTotal =
            price * quantity;


        subtotal += itemTotal;

        totalQuantity += quantity;


        checkoutItems.innerHTML += `
            <div class="checkout-item">

                <div>

                    <strong>
                        ${item.name}
                    </strong>

                    <p>
                        £${price.toFixed(2)}
                        ×
                        ${quantity}
                    </p>

                </div>

                <strong>
                    £${itemTotal.toFixed(2)}
                </strong>

            </div>
        `;

    });


    let deliveryPrice = 3.99;


    if (subtotal >= 50) {
        deliveryPrice = 0;
    }


    const finalTotal =
        subtotal + deliveryPrice;


    checkoutSubtotal.textContent =
        "£" + subtotal.toFixed(2);


    checkoutDelivery.textContent =
        deliveryPrice === 0
            ? "FREE"
            : "£" + deliveryPrice.toFixed(2);


    checkoutTotal.textContent =
        "£" + finalTotal.toFixed(2);


    cartCount.textContent =
        totalQuantity;

}


/* =========================
   CHECK CURRENT STOCK
========================= */

async function checkStockBeforeOrder() {

    for (const item of cart) {

        const productRef =
            doc(
                db,
                "products",
                item.productId
            );

        const productSnapshot =
            await getDoc(productRef);


        if (!productSnapshot.exists()) {

            alert(
                item.name +
                " is no longer available."
            );

            return false;
        }


        const product =
            productSnapshot.data();

        const currentStock =
            Number(product.stock || 0);

        const requestedQuantity =
            Number(item.quantity || 0);


        if (product.active !== true) {

            alert(
                item.name +
                " is currently unavailable."
            );

            return false;
        }


        if (
            requestedQuantity >
            currentStock
        ) {

            alert(
                `Only ${currentStock} ${item.name} available. Please update your basket.`
            );

            return false;
        }

    }


    return true;

}


/* =========================
   START PAGE
========================= */

showOrder();


/* =========================
   PLACE ORDER
========================= */

const checkoutForm =
    document.getElementById(
        "checkout-form"
    );


checkoutForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        if (cart.length === 0) {

            alert(
                "Your basket is empty."
            );

            return;
        }


        /*
        Check Firestore again immediately
        before accepting the order.
        */

        try {

            const stockAvailable =
                await checkStockBeforeOrder();

            if (!stockAvailable) {
                return;
            }

        } catch (error) {

            console.error(
                "Stock check error:",
                error
            );

            alert(
                "We could not check product availability. Please try again."
            );

            return;

        }


        const customerName =
            document
                .getElementById("name")
                .value
                .trim();

        const customerEmail =
            document
                .getElementById("email")
                .value
                .trim();

        const customerPhone =
            document
                .getElementById("phone")
                .value
                .trim();

        const customerAddress =
            document
                .getElementById("address")
                .value
                .trim();

        const customerCity =
            document
                .getElementById("city")
                .value
                .trim();

        const customerPostcode =
            document
                .getElementById("postcode")
                .value
                .trim();


        const deliveryOption =
            document.querySelector(
                'input[name="delivery"]:checked'
            );

        const paymentOption =
            document.querySelector(
                'input[name="payment"]:checked'
            );


        if (
            !deliveryOption ||
            !paymentOption
        ) {

            alert(
                "Please choose delivery and payment options."
            );

            return;
        }


        const deliveryMethod =
            deliveryOption.value;

        const paymentMethod =
            paymentOption.value;


        const subtotal =
            cart.reduce(
                (sum, item) =>
                    sum +
                    Number(item.price) *
                    Number(item.quantity),
                0
            );


        let deliveryPrice = 3.99;


        if (
            subtotal >= 50 ||
            deliveryMethod === "collection"
        ) {

            deliveryPrice = 0;

        }


        const total =
            subtotal + deliveryPrice;


        const orderNumber =
            "SW" +
            Math.floor(
                100000 +
                Math.random() * 900000
            );


        const order = {

            orderNumber: orderNumber,

            customer: {
                name: customerName,
                email: customerEmail,
                phone: customerPhone,
                address: customerAddress,
                city: customerCity,
                postcode: customerPostcode
            },

            deliveryMethod:
                deliveryMethod,

            paymentMethod:
                paymentMethod,

            items:
                cart,

            subtotal:
                subtotal,

            delivery:
                deliveryPrice,

            total:
                total,

            status:
                "Order Received",

            stockDeducted:
                false

        };


        try {

            const docRef =
                await addDoc(
                    collection(
                        db,
                        "orders"
                    ),
                    {
                        ...order,
                        createdAt:
                            serverTimestamp()
                    }
                );


            order.firebaseId =
                docRef.id;


            localStorage.setItem(
                "lastOrder",
                JSON.stringify(order)
            );


            localStorage.removeItem(
                "cart"
            );


            window.location.href =
                "order-success.html";


        } catch (error) {

            console.error(
                "Order error:",
                error
            );


            alert(
                "There was a problem placing your order. Please try again."
            );

        }

    }
);