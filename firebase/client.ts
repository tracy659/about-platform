// Import the functions you need from the SDKs you need
//import { getAnalytics } from "firebase/analytics";
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyByQVTOwPFDzO1cAk8RvL6lh5Alb7Sv92g",
    authDomain: "prepwise-fcc0f.firebaseapp.com",
    projectId: "prepwise-fcc0f",
    storageBucket: "prepwise-fcc0f.firebasestorage.app",
    messagingSenderId: "793472718671",
    appId: "1:793472718671:web:5d0edce549b23446ca973a",
    measurementId: "G-8LKFRF6JQE"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
//const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const db = getFirestore(app);