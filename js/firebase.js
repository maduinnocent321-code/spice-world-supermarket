import { initializeApp }
from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";

import { getFirestore }
from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

import { getAuth }
from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

// Public portfolio version: add your own Firebase web app configuration below.
// Do not commit private server credentials or service-account keys.
const firebaseConfig = {
    apiKey: "YOUR_FIREBASE_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.firebasestorage.app",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
