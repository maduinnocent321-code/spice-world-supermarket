# Spice World Supermarket

A responsive supermarket e-commerce website built as a software development portfolio project. The application combines a customer-facing shopping experience with Firebase-backed data, authentication, checkout flows, order handling, customer enquiries, and an administration dashboard.

## Features

### Customer experience
- Browse supermarket products and offers
- Search and filter products by category
- Add products to a shopping basket
- Update quantities and remove basket items
- Checkout with customer and delivery details
- Choose delivery/collection and payment options
- View an order confirmation page
- Submit customer enquiries through a contact form
- Responsive pages for shop, delivery, offers, basket, checkout and contact

### Administration
- Firebase Authentication-based admin sign-in
- Product creation, editing and management
- Inventory and stock monitoring
- Order search, filtering, sorting and status management
- Customer enquiry management
- Dashboard metrics for products, orders, stock and revenue
- Order detail views and export/print-related functionality

## Technologies

- HTML5
- CSS3
- JavaScript (ES modules)
- Firebase Authentication
- Cloud Firestore
- Browser Local Storage

## Project structure

```text
spice-world-supermarket/
├── index.html
├── shop.html
├── offers.html
├── cart.html
├── checkout.html
├── order-success.html
├── delivery.html
├── contact.html
├── admin-login.html
├── admin.html
├── css/
│   └── style.css
└── js/
    ├── firebase.js
    ├── firebase.example.js
    ├── shop.js
    ├── cart.js
    ├── checkout.js
    ├── contact.js
    ├── admin-login.js
    └── admin.js
```

## Firebase setup

This public portfolio copy does not include the original live Firebase project configuration.

1. Create a Firebase project and a Web App.
2. Enable Cloud Firestore and Firebase Authentication.
3. Open `js/firebase.js`.
4. Replace the placeholder values in `firebaseConfig` with your own Firebase Web App configuration.
5. Configure Firestore Security Rules so customers can only perform intended actions and administrative writes require authenticated/authorised users.
6. Create an authorised admin account in Firebase Authentication if you want to use the admin dashboard.

> Firebase Web App configuration is client-side configuration, but private credentials such as service-account keys must never be committed to the repository. Firestore Security Rules are responsible for protecting stored data.

## Running locally

Because the project uses JavaScript ES modules, run it through a local web server rather than opening the HTML files directly from the file system.

For example, using VS Code Live Server:

1. Open the project folder in VS Code.
2. Install the Live Server extension if required.
3. Open `index.html` with Live Server.

You can also serve the folder using any other local HTTP server.

## What I developed

This project demonstrates practical experience with:

- Building multi-page web interfaces
- JavaScript application logic and DOM manipulation
- Relational-style thinking around products, customers and orders
- Integrating a frontend with a cloud-hosted database
- Authentication and protected administration workflows
- Shopping-cart and checkout logic
- Data validation and error handling
- Search, filtering, sorting and dashboard functionality
- Testing and debugging a larger web application

## Portfolio note

This repository is intended as a portfolio demonstration. Any store names, sample customer records, product data, prices or contact information should be treated as demonstration content rather than production business data.
