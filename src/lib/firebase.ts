import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyD2pnzmtlcZRo9-sLsOS-s11kndd_Hp85M",
  authDomain: "kukutyoga-96c6b.firebaseapp.com",
  projectId: "kukutyoga-96c6b",
  storageBucket: "kukutyoga-96c6b.firebasestorage.app",
  messagingSenderId: "185996047683",
  appId: "1:185996047683:web:7ced31b24f754ca0606bf6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
