import { auth } from "./firebase.js";

import {
    signInWithEmailAndPassword
}
from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";


const loginForm =
    document.getElementById("admin-login-form");

const loginMessage =
    document.getElementById("login-message");


loginForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();

        const email =
            document.getElementById("admin-email").value.trim();

        const password =
            document.getElementById("admin-password").value;

        loginMessage.textContent =
            "Signing in...";

        try {

            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

            window.location.href =
                "admin.html";

        } catch (error) {

            console.error(
                "Firebase login error:",
                error
            );

            loginMessage.textContent =
                "Login failed: " + error.code;

        }

    }
);