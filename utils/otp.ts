export const OTP_EXPIRY_MS = 5 * 60 * 1000;

export function generateOtp(length = 6): string {
  const min = 10 ** (length - 1);
  const max = 10 ** length - 1;
  return String(Math.floor(min + Math.random() * (max - min + 1)));
}

export function isOtpExpired(expiresAt: number): boolean {
  return Date.now() > expiresAt;
}
