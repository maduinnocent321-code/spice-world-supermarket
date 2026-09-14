import { db } from "./firebase.js";

import {
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";


const contactForm =
    document.getElementById("contact-form");

const contactMessage =
    document.getElementById(
        "contact-form-message"
    );


contactForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        const name =
            document
                .getElementById("contact-name")
                .value
                .trim();

        const email =
            document
                .getElementById("contact-email")
                .value
                .trim();

        const phone =
            document
                .getElementById("contact-phone")
                .value
                .trim();

        const subject =
            document
                .getElementById("contact-subject")
                .value;

        const message =
            document
                .getElementById("contact-message")
                .value
                .trim();


        if (
            name === "" ||
            email === "" ||
            subject === "" ||
            message === ""
        ) {

            contactMessage.textContent =
                "Please complete all required fields.";

            return;
        }


        try {

            contactMessage.textContent =
                "Sending...";


            await addDoc(
                collection(db, "enquiries"),
                {
                    name: name,
                    email: email,
                    phone: phone,
                    subject: subject,
                    message: message,
                    status: "New",
                    createdAt: serverTimestamp()
                }
            );


            contactMessage.textContent =
                "Thank you. Your message has been sent ✓";


            contactForm.reset();


        } catch (error) {

            console.error(error);

            contactMessage.textContent =
                "Sorry, your message could not be sent.";

        }

    }
);