import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "bee-live-fdc15.firebaseapp.com",
  databaseURL: "https://bee-live-fdc15-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "bee-live-fdc15",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db };