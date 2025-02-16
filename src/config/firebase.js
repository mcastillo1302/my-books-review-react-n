import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
const firebaseConfig = {
// Pegar configuración de Firebase Console
    apiKey: "AIzaSyDUhMiwn0HlL1i011wpaSJKOMMIEKIyGPI",
    authDomain: "my-books-review.firebaseapp.com",
    projectId: "my-books-review",
    storageBucket: "my-books-review.firebasestorage.app",
    messagingSenderId: "104562332120",
    appId: "1:104562332120:web:97f9f1849f78237a38a2ad",
    measurementId: "G-RQ7QGQ1FK1"
};
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);