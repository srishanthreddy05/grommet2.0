import { NextResponse } from "next/server";
import { generateOtp, OTP_EXPIRY_MS } from "@/utils/otp";
import { getOtp, setOtp } from "@/services/otp-store";
import { isOtpExpired } from "@/utils/otp";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { email, name } = (await request.json()) as { email?: string; name?: string };
    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const apiKey = process.env.BREVO_API_KEY;
    const senderEmail = process.env.BREVO_SENDER_EMAIL;

    if (!apiKey || !senderEmail) {
      return NextResponse.json(
        { error: "Missing Brevo environment variables" },
        { status: 500 }
      );
    }

    const existingRecord = await getOtp(normalizedEmail);
    const shouldReuseExisting =
      existingRecord && !isOtpExpired(existingRecord.expiresAt) && Boolean(existingRecord.otp);

    const otp = shouldReuseExisting ? existingRecord.otp : generateOtp(6);
    const expiresAt = shouldReuseExisting
      ? existingRecord.expiresAt
      : Date.now() + OTP_EXPIRY_MS;

    await setOtp(normalizedEmail, otp, expiresAt);

    const payload = {
      sender: { email: senderEmail, name: "Storefront" },
      to: [{ email: normalizedEmail, name: name || "Customer" }],
      subject: "Your OTP for Order Verification",
      htmlContent: `<p>Your OTP is: <strong>${otp}</strong></p><p>This OTP is valid for 5 minutes.</p>`,
    };

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Failed to send OTP email: ${errorText}` },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true, expiresAt });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to send OTP";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
