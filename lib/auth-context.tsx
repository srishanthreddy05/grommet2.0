"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  onAuthStateChanged,
  signOut,
  User as FirebaseUser,
  signInWithPopup,
} from "firebase/auth";
import { ref, set, get, update } from "firebase/database";
import { auth, db, googleProvider } from "@/lib/firebase";
import type { User } from "@/types";

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  firebaseUser: null,
  loading: true,
  signInWithGoogle: async () => {},
  logout: async () => {},
  isAdmin: false,
});

function toFriendlyGoogleAuthError(error: unknown): Error {
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? String((error as { code?: unknown }).code || "")
      : "";

  switch (code) {
    case "auth/unauthorized-domain":
      return new Error("This domain is not authorized in Firebase Auth. Add localhost in Authentication -> Settings -> Authorized domains.");
    case "auth/operation-not-allowed":
      return new Error("Google sign-in is disabled in Firebase. Enable Google provider in Authentication -> Sign-in method.");
    case "auth/popup-blocked":
      return new Error("Popup was blocked by browser. Allow popups for this site and try again.");
    case "auth/popup-closed-by-user":
      return new Error("Google popup was closed before sign-in completed.");
    case "auth/cancelled-popup-request":
      return new Error("Another sign-in popup is already open. Close it and retry.");
    default: {
      const message = error instanceof Error ? error.message : "Google login failed";
      return new Error(message);
    }
  }
}

function deriveRole(userData: { isAdmin?: unknown; role?: unknown }): { isAdmin: boolean; role: "admin" | "user" } {
  const isAdmin = userData.isAdmin === true || String(userData.role || "").toLowerCase() === "admin";
  return { isAdmin, role: isAdmin ? "admin" : "user" };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      console.error("Firebase Auth is unavailable. Check NEXT_PUBLIC_FIREBASE_* values in .env.local.");
      setLoading(false);
      return;
    }

    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      setLoading(true);
      setFirebaseUser(fbUser);
      if (fbUser) {
        const userRef = ref(db, `users/${fbUser.uid}`);
        const snap = await get(userRef);

        if (!snap.exists()) {
          const newUser: User = {
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: fbUser.displayName || "User",
            photoURL: fbUser.photoURL || undefined,
            isAdmin: false,
            role: "user",
            createdAt: Date.now(),
          };
          await set(userRef, { ...newUser, name: newUser.displayName });
          setUser(newUser);
        } else {
          const userData = snap.val() as Partial<User> & { role?: string; name?: string; phone?: string; mobile?: string };
          const { isAdmin, role } = deriveRole(userData);
          const normalizedUser: User = {
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: userData.displayName || userData.name || fbUser.displayName || "User",
            photoURL: fbUser.photoURL || undefined,
            isAdmin,
            role,
            createdAt: Number(userData.createdAt || Date.now()),
          };
          await update(userRef, {
            uid: normalizedUser.uid,
            email: normalizedUser.email,
            displayName: normalizedUser.displayName,
            photoURL: normalizedUser.photoURL || null,
            isAdmin: normalizedUser.isAdmin,
            role: normalizedUser.role,
            createdAt: normalizedUser.createdAt,
            name: normalizedUser.displayName,
          });
          setUser(normalizedUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const signInWithGoogle = async () => {
    try {
      if (!auth || !googleProvider) {
        throw new Error("Firebase Auth is unavailable. Check NEXT_PUBLIC_FIREBASE_* values in .env.local.");
      }
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Sign in error:", error);
      throw toFriendlyGoogleAuthError(error);
    }
  };

  const logout = async () => {
    if (auth) {
      await signOut(auth);
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        loading,
        signInWithGoogle,
        logout,
        isAdmin: user?.isAdmin || false,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
