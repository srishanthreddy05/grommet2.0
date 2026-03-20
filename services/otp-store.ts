type OtpRecord = {
  otp: string;
  expiresAt: number;
};

import { db } from "@/lib/firebase";
import { get, ref, remove, set } from "firebase/database";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function getEmailKey(email: string): string {
  const normalized = normalizeEmail(email);
  const base64 = Buffer.from(normalized).toString("base64");
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export async function setOtp(email: string, otp: string, expiresAt: number): Promise<void> {
  const key = getEmailKey(email);
  await set(ref(db, `otpVerifications/${key}`), {
    email: normalizeEmail(email),
    otp,
    expiresAt,
    createdAt: Date.now(),
  });
}

export async function getOtp(email: string): Promise<OtpRecord | undefined> {
  const key = getEmailKey(email);
  const snap = await get(ref(db, `otpVerifications/${key}`));
  if (!snap.exists()) return undefined;
  const val = snap.val() as Partial<OtpRecord>;
  return {
    otp: String(val.otp || ""),
    expiresAt: Number(val.expiresAt || 0),
  };
}

export async function clearOtp(email: string): Promise<void> {
  const key = getEmailKey(email);
  await remove(ref(db, `otpVerifications/${key}`));
}
