let cart =
    JSON.parse(
        localStorage.getItem("cart")
    ) || [];


const cartItems =
    document.getElementById("cart-items");

const subtotalElement =
    document.getElementById("subtotal");

const deliveryElement =
    document.getElementById("delivery");

const totalElement =
    document.getElementById("total");

const cartCount =
    document.getElementById("cart-count");

const checkoutButton =
    document.getElementById("checkout-button");


function displayCart() {

    cartItems.innerHTML = "";


    if (cart.length === 0) {

        checkoutButton.style.display =
            "none";

        cartItems.innerHTML = `
            <div class="empty-cart">

                <h2>
                    Your basket is empty
                </h2>

                <p>
                    Add some groceries before checking out.
                </p>

                <a
                    href="shop.html"
                    class="shop-button"
                >
                    Continue Shopping
                </a>

            </div>
        `;


        subtotalElement.textContent =
            "£0.00";

        deliveryElement.textContent =
            "£0.00";

        totalElement.textContent =
            "£0.00";

        cartCount.textContent =
            "0";


        return;
    }


    checkoutButton.style.display =
        "block";


    cart.forEach((item, index) => {

        const itemTotal =
            item.price * item.quantity;


        cartItems.innerHTML += `
            <div class="cart-item">

                <div>

                    <h3>
                        ${item.name}
                    </h3>

                    <p>
                        £${Number(item.price).toFixed(2)}
                        each
                    </p>

                </div>


                <div class="quantity-controls">

                    <button
                        onclick="decreaseQuantity(${index})"
                    >
                        −
                    </button>

                    <span>
                        ${item.quantity}
                    </span>

                    <button
                        onclick="increaseQuantity(${index})"
                    >
                        +
                    </button>

                </div>


                <strong>
                    £${itemTotal.toFixed(2)}
                </strong>


                <button
                    class="remove-button"
                    onclick="removeItem(${index})"
                >
                    Remove
                </button>

            </div>
        `;

    });


    updateTotals();

}


function increaseQuantity(index) {

    const item =
        cart[index];

    const availableStock =
        Number(item.stock);

    if (
        availableStock &&
        item.quantity >= availableStock
    ) {

        alert(
            "You cannot add more than the available stock."
        );

        return;
    }

    item.quantity++;

    saveCart();
}


function decreaseQuantity(index) {

    if (cart[index].quantity > 1) {

        cart[index].quantity--;

    } else {

        cart.splice(index, 1);

    }


    saveCart();

}


function removeItem(index) {

    cart.splice(index, 1);

    saveCart();

}


function saveCart() {

    localStorage.setItem(
        "cart",
        JSON.stringify(cart)
    );


    displayCart();

}


function updateTotals() {

    const subtotal =
        cart.reduce(
            (sum, item) =>
                sum +
                item.price *
                item.quantity,
            0
        );


    let delivery = 3.99;


    if (subtotal >= 50) {

        delivery = 0;

    }


    const total =
        subtotal + delivery;


    subtotalElement.textContent =
        `£${subtotal.toFixed(2)}`;


    deliveryElement.textContent =
        delivery === 0
            ? "FREE"
            : `£${delivery.toFixed(2)}`;


    totalElement.textContent =
        `£${total.toFixed(2)}`;


    const quantity =
        cart.reduce(
            (sum, item) =>
                sum + item.quantity,
            0
        );


    cartCount.textContent =
        quantity;

}


displayCart();