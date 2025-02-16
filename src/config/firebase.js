import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
const firebaseConfig = {
// Pegar configuración de Firebase Console
    apiKey: "AIzaSyCI1-jvf6ageEp--y0FNgKOGBw5P-hRk08",
    authDomain: "micomidafavorita-1ddc6.firebaseapp.com",
    databaseURL: "https://micomidafavorita-1ddc6-default-rtdb.firebaseio.com",
    projectId: "micomidafavorita-1ddc6",
    storageBucket: "micomidafavorita-1ddc6.firebasestorage.app",
    messagingSenderId: "499137891653",
    appId: "1:499137891653:web:ee4534bca155e68522022c",
    measurementId: "G-2H0MSTCNXJ"
};
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);