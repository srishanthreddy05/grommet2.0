import { NextResponse } from "next/server";
import { clearOtp, getOtp } from "@/services/otp-store";
import { isOtpExpired } from "@/utils/otp";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { email, otp } = (await request.json()) as { email?: string; otp?: string };
    const normalizedEmail = email?.trim().toLowerCase();
    const normalizedOtp = otp?.replace(/\D/g, "").trim();

    if (!normalizedEmail || !normalizedOtp) {
      return NextResponse.json({ error: "Email and OTP are required" }, { status: 400 });
    }

    const record = await getOtp(normalizedEmail);
    if (!record) {
      return NextResponse.json({ error: "OTP not found. Please resend OTP." }, { status: 400 });
    }

    if (isOtpExpired(record.expiresAt)) {
      await clearOtp(normalizedEmail);
      return NextResponse.json({ error: "OTP expired. Please resend OTP." }, { status: 400 });
    }

    if (record.otp !== normalizedOtp) {
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
    }

    await clearOtp(normalizedEmail);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to verify OTP";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
