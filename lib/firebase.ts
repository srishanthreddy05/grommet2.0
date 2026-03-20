import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getDatabase } from "firebase/database";

const env = {
  NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  NEXT_PUBLIC_FIREBASE_DATABASE_URL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const missingEnvVars = Object.entries(env)
  .filter(([, value]) => !value || value.trim() === "")
  .map(([key]) => key);

if (missingEnvVars.length > 0) {
  throw new Error(
    `Missing Firebase environment variables: ${missingEnvVars.join(", ")}. ` +
      "Create .env.local from .env.local.example and add your Firebase project values."
  );
}

const firebaseApiKey = env.NEXT_PUBLIC_FIREBASE_API_KEY!;
if (firebaseApiKey === "your_api_key" || !firebaseApiKey.startsWith("AIza")) {
  throw new Error(
    "NEXT_PUBLIC_FIREBASE_API_KEY looks invalid. Use the real Web API key from Firebase project settings."
  );
}

const firebaseConfig = {
  apiKey: firebaseApiKey,
  authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  databaseURL: env.NEXT_PUBLIC_FIREBASE_DATABASE_URL!,
  projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const isBrowser = typeof window !== "undefined";

export const auth = isBrowser ? getAuth(app) : null;
export const db = getDatabase(app);
export const googleProvider = isBrowser ? new GoogleAuthProvider() : null;

export default app;
